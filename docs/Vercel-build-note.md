## Vercel Build Note

If you see an error during `npm install` in Vercel such as:

```
npm error notarget No matching version found for node-fetch@^3.4.1.
```

It means a transitive dependency requires a version of `node-fetch` that is no longer published. This repository pins `node-fetch` to `3.3.2` and adds an `overrides` entry in `package.json` to ensure Vercel can resolve dependencies.

If build errors persist, check that your Vercel project is configured to use Node.js 18.x so `npm` supports `overrides` and, if needed, add or commit a `package-lock.json` to ensure deterministic installs.
