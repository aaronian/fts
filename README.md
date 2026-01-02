# Follow the Sun 🌞🌲

Track your outdoor time throughout 2026 with beautiful visualizations and Oura Ring integration.

## Features

- 🌅 Real-time sun position indicator
- 📊 Weekly outdoor time statistics
- 💍 Oura Ring data integration (readiness, sleep, activity)
- 📝 Quick-log with category buttons (Walking, Soccer, Vibing, Playground)
- ⏱️ Quick-select time buttons (15, 30, 45, 60 minutes)
- 📅 Backfill past entries with date picker
- 🎨 Peaceful, nature-inspired design
- ☁️ Cloud storage syncing across devices

## Deploy to Vercel (Recommended - Free!)

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Create a GitHub account** (if you don't have one) at https://github.com
2. **Upload your code to GitHub:**
   - Go to https://github.com/new
   - Name your repository "follow-the-sun"
   - Click "Create repository"
   - Follow the instructions to upload this folder

3. **Deploy to Vercel:**
   - Go to https://vercel.com/signup
   - Sign up with your GitHub account
   - Click "Import Project"
   - Select your "follow-the-sun" repository
   - Click "Deploy"
   - Wait 2-3 minutes ☕

4. **Done!** Vercel will give you a URL like: `https://follow-the-sun-xyz123.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from this directory
cd follow-the-sun-app
vercel

# Follow the prompts and you're done!
```

## Local Development

If you want to test locally before deploying:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

## How to Use

1. **First time setup:**
   - Get your Oura personal access token from https://cloud.ouraring.com/personal-access-tokens
   - Paste it into the app

2. **Log outdoor time:**
   - Click "Log Outdoor Time"
   - Select the date (defaults to today)
   - Pick an activity (Walking, Soccer, Vibing, Playground)
   - Choose a quick time (15/30/45/60 min) OR enter custom minutes
   - Save!

3. **Your Oura data automatically attaches** to each entry

4. **Access from anywhere:**
   - Bookmark your Vercel URL
   - Add to home screen on mobile
   - Data syncs across all your devices

## Storage Note

**Current setup:** Uses in-memory storage on the server (resets when server restarts)

**For permanent storage**, you'll want to upgrade to a real database:
- **Vercel KV** (Redis) - Free tier available
- **Vercel Postgres** - Free tier available
- **Supabase** - Free PostgreSQL database
- **MongoDB Atlas** - Free tier available

Want help setting up a real database? Let me know!

## Tech Stack

- **Next.js 14** - React framework
- **Vercel** - Hosting & deployment
- **Oura API** - Health data integration
- **React** - UI library
- **Lucide React** - Icons

## Support

Questions? Open an issue or reach out!

---

Made with 🌲 for outdoor enthusiasts
