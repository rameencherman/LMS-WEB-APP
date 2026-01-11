# Vercel Deployment Guide

Your project is ready for Vercel deployment. Follow these steps:

## 1. Preparation (Already done)

- `vercel.json` has been created to handle Single Page Application (SPA) routing.
- `package.json` has correct build scripts.
- Codebase is lint-free and builds successfully.

## 2. Deploy via Vercel Dashboard (Recommended)

1.  Push your code to **GitHub**.
2.  Log in to **[Vercel](https://vercel.com/)**.
3.  Click **"Add New..."** -> **"Project"**.
4.  Import your GitHub repository `LMS-WEB-APP`.
5.  **Configure Project**:
    - **Framework Preset**: Select **Quasar** (or manually configure if it doesn't auto-detect).
    - **Root Directory**: `./` (default).
    - **Build Command**: `quasar build` (or `npm run build`).
    - **Output Directory**: `dist/spa` (IMPORTANT: Vercel might default to `dist`, make sure it is `dist/spa`).
6.  **Environment Variables**:
    - Expand the **"Environment Variables"** section.
    - Add the following variables (copy values from your local `.env` file):
      - `VITE_SUPABASE_URL`
      - `VITE_SUPABASE_ANON_KEY`
7.  Click **"Deploy"**.

## 3. Verify

- Once deployed, visit the URL provided by Vercel.
- Check navigation (refresh a page like `/dashboard/schedule` to ensure `vercel.json` rewrites are working).
- Check data loading (Supabase connection).

## Troubleshooting

- **404 on Refresh**: Ensure `vercel.json` exists in the root and contains the rewrite rule (already added).
- **Blank Page**: Check console errors. Often due to missing Environment Variables.
- **Build Fails**: Check Vercel logs. Ensure `node_modules` are installing correctly (Vercel handles `npm install` automatically).
