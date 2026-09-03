# CompetitorSpy MVP - Quick Start Checklist

## ⚡ 30-Minute Setup

### Phase 1: Get API Keys (10 min)

- [ ] **Supabase** (Database)
  - Go to supabase.com
  - Sign up → Create project
  - Get URL and Anon Key

- [ ] **Firecrawl** (Web Scraping)
  - Go to firecrawl.dev
  - Sign up → Get API key
  - Test with sample URL

- [ ] **Claude** (Content Generation)
  - Go to console.anthropic.com
  - Sign up → Get API key
  - Keep secret!

### Phase 2: Setup Database (5 min)

- [ ] In Supabase → SQL Editor
- [ ] Copy all SQL from `database.sql`
- [ ] Paste and run
- [ ] Wait for tables to create ✓

### Phase 3: Setup Local Project (10 min)

- [ ] `npm install` (install all packages)
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in API keys
- [ ] `npm run dev`
- [ ] Visit http://localhost:3000

### Phase 4: Test MVP (5 min)

- [ ] Add a competitor (name, website)
- [ ] Click "Scrape" button
- [ ] Wait for scraping to complete
- [ ] Select competitor and "Generate Content"
- [ ] Check console for generated text

---

## ✅ MVP Works When:

1. ✓ Can add competitors without errors
2. ✓ Can scrape websites and extract keywords
3. ✓ Can generate blog posts / social content
4. ✓ Dashboard loads with no errors
5. ✓ Mobile view responsive

---

## 🚀 Deploy to Production (5 min)

```bash
vercel login
vercel
# Follow prompts
# Add env variables in Vercel dashboard
```

---

## 📊 What You Get

**Today (MVP):**
- Competitor scraper
- Content generator (blog, social, ads, landing pages)
- Database backend
- Dashboard UI

**Next Phase:**
- Social media auto-posting
- Ad management
- Keyword tracking
- Analytics
- Email automation

---

## 💰 Cost Estimate (Monthly)

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel | ✓ | Free |
| Supabase | ✓ (1GB) | Free-$25 |
| Firecrawl | ✓ (100 calls) | ~$20 |
| Claude API | - | Pay-as-you-go (~$5/month) |
| **Total** | | **$25-50/month** |

---

## ⚠️ Common Issues & Fixes

**"Module not found"**
→ Run `npm install`

**"Database error"**
→ Check Supabase credentials in `.env.local`

**"API key invalid"**
→ Double-check key is copied correctly (no spaces)

**"CORS error"**
→ All API calls go through Next.js backend (pages/api)

---

## 🎯 Your Next Steps

1. **Gather API Keys** (15 min)
2. **Run Setup** (15 min)
3. **Test MVP** (5 min)
4. **Deploy to Vercel** (5 min)
5. **Add competitors & generate content** (testing)

---

**Total Time:** ~45 minutes to live MVP 🚀

Questions? Check SETUP_GUIDE.md for detailed instructions.
