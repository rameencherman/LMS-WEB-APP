# Vercel Deployment Guide

To deploy this Quasar App to Vercel, follow these steps:

## 1. Project Configuration

- A `vercel.json` file has been added to the project root to handle SPA routing (rewrites to `index.html`).

## 2. Vercel Dashboard Settings

When importing the project in Vercel:

- **Framework Preset**: Vercel might auto-detect "Other" or "Vite". If asked, you can choose **Vite** or leave as Other.
- **Build Command**: `quasar build` (or `npm run build`)
- **Output Directory**: `dist/spa` <-- **IMPORTANT**
- **Install Command**: `npm install` (Default)

## 3. Environment Variables

You MUST add the following environment variables in the Vercel Project Settings > Environment Variables:

- `VITE_SUPABASE_URL`: Your Supabase Project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

(You can copy these from your local `.env` file).

## 4. Deploy

- Click **Deploy**.
- Once finished, your app will be live!
