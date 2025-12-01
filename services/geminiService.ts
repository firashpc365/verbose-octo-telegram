import GoogleGenAI from "@google/genai";
import type { ServiceItem } from '../types';

export class QuotaExceededError extends Error {
    retryAfter: number;
    isHardLimit: boolean;
    userAction?: string;

    constructor(message: string, retryAfter = 60, isHardLimit = false, userAction = '') {
        super(message);
        this.name = 'QuotaExceededError';
        this.retryAfter = retryAfter;
        this.isHardLimit = isHardLimit;
        this.userAction = userAction;
    }
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const safeGenerateContent = async (params: any): Promise<any> => {
    try {
        return await ai.models.generateContent(params);
    } catch (error: any) {
        if (error?.status === 429 || error?.code === 429) {
            throw new QuotaExceededError("API Quota Exceeded", 60, error.message);
        }
        throw error;
    }
}

const parseJSON = (text: string) => {
    try {
        // Aggressively clean markdown and potential noise
        const cleanText = text
            .replace(/```json\s*/g, '')
            .replace(/```\s*$/g, '')
            .replace(/```/g, '')
            .trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.warn("Failed to parse JSON, returning raw text or empty object", text);
        const arrayMatch = text.match(/\[.*\]/s);
        if (arrayMatch) {
            try { return JSON.parse(arrayMatch[0]); } catch (e2) { }
        }
        const objectMatch = text.match(/\{.*\}/s);
        if (objectMatch) {
            try { return JSON.parse(objectMatch[0]); } catch (e3) { }
        }
        return {};
    }
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const getAIServiceAssistance = async (type: string, service: Partial<ServiceItem>, settings: any, uniqueCategories: string[]) => {
    let prompt = '';
    let responseMimeType = 'text/plain';

    switch (type) {
        case 'description':
            prompt = `Write a compelling marketing description for a service named "${service.name}"${service.category ? ` in the category "${service.category}"` : ''}. Keep it under 300 characters.`;
            break;
        case 'features':
            prompt = `List 3 key features or benefits for the service "${service.name}" (${service.description}). Return as JSON array of strings.`;
            responseMimeType = 'application/json';
            break;
        case 'menu_options':
            prompt = `Generate a list of 5-8 specific menu items, inclusions, or components for a service named "${service.name}" described as "${service.description}". Return as a JSON array of strings.`;
            responseMimeType = 'application/json';
            break;
        case 'price':
            prompt = `Suggest a base price number (no currency symbol) for "${service.name}" in Saudi Riyals (SAR). Market: High-end events. Return only the number.`;
            break;
        case 'tags':
            prompt = `Generate 5 relevant tags for "${service.name}"${service.description ? ` based on description: "${service.description}"` : ''}. Return as comma-separated string.`;
            break;
        case 'category':
             prompt = `Suggest the best category for "${service.name}" from this list: ${uniqueCategories.join(', ')}. If none fit, suggest a new short one. Return only the category name.`;
             break;
        case 'image_prompt':
             prompt = `Create a detailed image generation prompt for a high-quality, photorealistic image of the service "${service.name}" (${service.description}). The image should be suitable for a luxury event catalogue.`;
             break;
    }

    const response = await safeGenerateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: responseMimeType !== 'text/plain' ? { responseMimeType } : undefined
    });

    let result: any = response?.text ?? response;
    if (responseMimeType === 'application/json' && typeof result === 'string') {
        result = parseJSON(result);
    }
    
    return { result, fullPrompt: prompt, source: 'ai' };
};
