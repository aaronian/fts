# 🚀 Quick Deployment Guide

## Fastest Way to Deploy (5 minutes)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Navigate to the app folder
```bash
cd follow-the-sun-app
```

### Step 3: Login to Vercel
```bash
vercel login
```
This will open your browser to sign in (it's free!)

### Step 4: Deploy!
```bash
vercel
```

Answer the prompts:
- "Set up and deploy?" → **Yes**
- "Which scope?" → **Your username** (hit enter)
- "Link to existing project?" → **No** (hit enter)
- "What's your project's name?" → **follow-the-sun** (or hit enter for default)
- "In which directory is your code located?" → **./** (hit enter)
- "Want to modify these settings?" → **No** (hit enter)

### Step 5: Done! 🎉

Vercel will give you a URL like:
```
https://follow-the-sun-abc123.vercel.app
```

Open that URL on any device and start tracking!

---

## Alternative: GitHub + Vercel Dashboard

If you prefer a visual interface:

1. **Create GitHub repo**: https://github.com/new
2. **Upload this folder** to GitHub
3. **Connect to Vercel**: https://vercel.com/new
4. **Import your repo** and click Deploy

That's it! No coding required.

---

## Important Note About Storage

⚠️ The current setup uses **in-memory storage** which means:
- Data resets when Vercel restarts the server (usually daily)
- This is fine for testing, but not ideal for long-term use

**For permanent storage**, I recommend upgrading to Vercel KV (free tier):
- Takes 5 extra minutes to set up
- Your data will persist forever
- Still completely free

Want help setting that up? Just ask!
