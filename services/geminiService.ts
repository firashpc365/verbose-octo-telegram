import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { ServiceItem, EventItem, User, Client, CostTrackerItem, ProcurementDocument, SubItem, ProposalLineItem } from '../types';

export class QuotaExceededError extends Error {
    retryAfter: number;
    isHardLimit: boolean;
    userAction?: string;

    constructor(message: string, retryAfter = 60, detailedMessage = '', isHardLimit = false, userAction = '') {
        super(message);
        this.name = 'QuotaExceededError';
        this.retryAfter = retryAfter;
        this.isHardLimit = isHardLimit;
        this.userAction = userAction;
    }
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const safeGenerateContent = async (params: any): Promise<GenerateContentResponse> => {
    try {
        return await ai.models.generateContent(params);
    } catch (error: any) {
        if (error.status === 429 || error.code === 429) {
            throw new QuotaExceededError("API Quota Exceeded", 60, error.message);
        }
        throw error;
    }
}
