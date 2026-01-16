# Cloudinary Setup Guide

## Why Cloudinary?

Netlify and Vercel are **serverless platforms** that don't support writing files to disk.
The file upload system now uses **Cloudinary** for media storage, which works perfectly with serverless deployments.

## Setup Instructions

### 1. Create a Free Cloudinary Account

1. Go to https://cloudinary.com
2. Click "Sign Up" and create a free account
3. The free tier includes:
   - 25GB storage
   - 25GB bandwidth/month
   - Perfect for most small to medium sites

### 2. Get Your API Credentials

1. After logging in, go to your **Dashboard**
2. You'll see three important values:
   - **Cloud Name**
   - **API Key**
   - **API Secret** (click the eye icon to reveal it)

### 3. Add to Environment Variables

#### For Local Development:

Create a `.env` file in the project root (if you don't have one):

```bash
# Copy from .env.example
cp .env.example .env
```

Then update these values in `.env`:

```env
CLOUDINARY_CLOUD_NAME="your-actual-cloud-name"
CLOUDINARY_API_KEY="your-actual-api-key"
CLOUDINARY_API_SECRET="your-actual-api-secret"
```

#### For Netlify Deployment:

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site configuration** → **Environment variables**
4. Add these three variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
5. Redeploy your site

#### For Vercel Deployment:

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the three Cloudinary variables
5. Redeploy

## How It Works

- **With Cloudinary configured**: Files upload to Cloudinary (works everywhere)
- **Without Cloudinary**: Falls back to local storage (only works in local development)

## Testing

After setup:

1. Go to your admin panel `/admin/media`
2. Try uploading an image or video
3. If successful, you'll see the file in:
   - Your media library
   - Cloudinary dashboard under the `omok-cms` folder

## Troubleshooting

### Upload still fails after adding credentials

1. Make sure you **restarted your development server** after adding env variables
2. Check that there are **no typos** in your credentials
3. Verify the credentials are correct by logging into Cloudinary dashboard

### "Unauthorized" error

- Make sure you're logged in to the admin panel
- Check that NextAuth is configured correctly

### Need Help?

- Cloudinary Docs: https://cloudinary.com/documentation
- Check the server logs for detailed error messages
