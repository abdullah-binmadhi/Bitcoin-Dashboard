# Deployment Guide for Vercel

This project is a React application built with Vite, located in the `sentinel-dashboard` subdirectory.

## Prerequisites

- A GitHub repository (already set up).
- A Vercel account.

## Steps to Deploy

1.  **Log in to Vercel** and click **"Add New..."** -> **"Project"**.
2.  **Import Git Repository:** Select the `Bitcoin-Dashboard` repository.
3.  **Configure Project:**
    - **Framework Preset:** Select `Vite`.
    - **Root Directory:** Click "Edit" and select `sentinel-dashboard`.
    - **Build Command:** `npm run build` (Default should be fine).
    - **Output Directory:** `dist` (Default should be fine).
    - **Install Command:** `npm install` (Default should be fine).
4.  **Environment Variables:**
    Expand the "Environment Variables" section and add the following keys from your `.env` file:
    
    | Key | Value |
    | --- | --- |
    | `VITE_SUPABASE_URL` | `https://uzxocjwuisgzldbtppnk.supabase.co` |
    | `VITE_SUPABASE_ANON_KEY` | *(Your Supabase Anon Key)* |

    *Note: Do NOT use the Service Role Key here. Use the Anon Key found in your Supabase dashboard.*

5.  **Deploy:** Click **"Deploy"**.

## Post-Deployment

- Vercel will build your application and assign a domain (e.g., `bitcoin-dashboard.vercel.app`).
- If you encounter routing issues (404 on refresh), ensure the `vercel.json` file in `sentinel-dashboard` is present (it handles rewrites).
