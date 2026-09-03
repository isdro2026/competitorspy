# CompetitorSpy MVP - Setup Guide

## 🚀 Quick Start (5 Steps)

### Step 1: Create Supabase Database
1. Go to **supabase.com** → Sign up/Login
2. Create new project
3. Go to **SQL Editor** → paste content from `database.sql`
4. Run queries to create tables
5. Copy your **Project URL** and **Anon Key**

### Step 2: Get API Keys

**Firecrawl:**
- Go to firecrawl.dev → Sign up
- Get API key

**Claude (Anthropic):**
- Go to console.anthropic.com → Sign up
- Get API key

**Perplexity (optional for later):**
- Go to perplexity.ai → Sign up
- Get API key

**Composio (for social media automation later):**
- Go to composio.dev → Sign up
- Get API key

### Step 3: Setup Local Development

```bash
# Clone or create the project folder
cd competitorspy

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local and add your API keys:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
FIRECRAWL_API_KEY=your_firecrawl_key
ANTHROPIC_API_KEY=your_claude_key
PERPLEXITY_API_KEY=your_perplexity_key
COMPOSIO_API_KEY=your_composio_key
```

### Step 4: Run Locally

```bash
npm run dev
```

Visit: **http://localhost:3000**

### Step 5: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard → Project Settings → Environment Variables

---

## 📋 MVP Features Included

### ✅ Competitor Scraper
- Add competitor URLs
- Scrape with Firecrawl (markdown + HTML)
- Extract keywords automatically
- Store in PostgreSQL

### ✅ Content Generator
- **Blog Posts** — SEO-optimized, 500-800 words
- **Social Media** — Instagram, Facebook, LinkedIn, Twitter
- **Ad Copy** — Multiple variations with CTAs
- **Landing Pages** — Full funnel copy
- Uses Claude API for generation

### ✅ Basic Dashboard
- Add/manage competitors
- Scrape competitor sites
- Generate content with one click
- View scraped keywords
- Mobile responsive UI

---

## 📁 Project Structure

```
competitorspy/
├── pages/
│   ├── api/
│   │   ├── competitors.js (CRUD operations)
│   │   ├── scrape-competitor.js (Firecrawl integration)
│   │   └── generate-content.js (Claude integration)
│   └── index.jsx (Main page)
├── components/
│   └── Dashboard.jsx (Main UI component)
├── database.sql (PostgreSQL schema)
├── .env.example (Environment variables template)
├── next.config.js (Next.js config)
├── package.json (Dependencies)
└── SETUP_GUIDE.md (This file)
```

---

## 🔄 How It Works

### 1. Add Competitor
```
User enters: Name, Website, Industry
→ Stored in `competitors` table
```

### 2. Scrape Competitor
```
User clicks "Scrape"
→ Firecrawl API crawls website
→ Extracts markdown, keywords
→ Stores in `scraped_content` table
```

### 3. Generate Content
```
User selects: Content Type, Platform
→ Claude API generates content
→ Content stored in `generated_content` table
→ Ready to post or edit
```

---

## 🎯 Next Phase Features (After MVP)

1. **Social Media Automation** — Auto-post to Instagram, TikTok, FB
2. **Ad Manager** — Create ads automatically
3. **Keyword Spy** — Track competitor rankings
4. **Analytics Dashboard** — Track post performance
5. **Email Drip Campaigns** — Auto-send generated content
6. **AI Copywriter** — Improve generated content with feedback
7. **Website Builder** — Create landing pages instantly
8. **SEO Optimization** — Auto-optimize for search

---

## 🐛 Troubleshooting

**Issue: "API key not found"**
- Check `.env.local` file
- Restart dev server: `npm run dev`

**Issue: "Database connection failed"**
- Verify Supabase credentials in `.env.local`
- Check Supabase project is active

**Issue: "Content not generating"**
- Check Claude API key is valid
- Check rate limits haven't been hit

---

## 📞 Support

For questions, check:
- Firecrawl docs: docs.firecrawl.dev
- Claude docs: docs.anthropic.com
- Supabase docs: supabase.com/docs

---

## 🚢 Deployment Checklist

- [ ] All API keys added to Vercel
- [ ] Database credentials working
- [ ] Test scraper on live site
- [ ] Test content generator
- [ ] Mobile UI working
- [ ] Error handling working
- [ ] Analytics tracking enabled
- [ ] Monitoring setup (Vercel analytics)

---

**Built with:** Next.js, Supabase, Claude API, Firecrawl
**Status:** MVP (0.1.0)
**Last Updated:** Aug 29, 2026
