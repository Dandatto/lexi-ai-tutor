# 🎯 Phase 2 Fire Drill - Production Deployment Rehearsal

## Executive Summary

After completing Phase 2 Migration (100% complete, 43 commits, zero security issues), Lexi is now production-ready. This Fire Drill document outlines the controlled deployment rehearsal and UAT process to ensure zero downtime, maximum security, and zero data loss before launching to production.

**Status:** Ready for execution
**Duration:** 2-3 days
**Team:** Dev Lead + QA Lead + DevOps Engineer
**Success Criteria:** All checkboxes passed, real user testing successful

---

## 📋 Pre-Deployment Validation (1 hour)

### Environment Setup Verification

- [ ] Firebase Console: Project `lexi-ai-tutor` is accessible
- [ ] Firebase Authentication: Google Sign-in enabled
- [ ] Firestore Database: Security rules deployed and tested
- [ ] Cloud Functions: All functions deployed (gemini-related functions)
- [ ] Storage Bucket: Configured and accessible
- [ ] Analytics: Firebase Analytics enabled
- [ ] Sentry: Project created and DSN configured

### Code Security Audit

- [ ] Search frontend code for "AIza" (API key prefix) - result must be EMPTY
- [ ] Verify `.env.local` is NOT committed to git
- [ ] Confirm `process.env.VITE_GEMINI_API_KEY` is removed from all files
- [ ] Check `package.json` - `@google/genai` dependency removed or only in `functions/`
- [ ] Verify Cloud Functions use `defineSecret()` for API Key

### Firebase Configuration

- [ ] `firebaseConfig.ts`: All credentials are public-safe (no secrets)
- [ ] `firebaseConfig.ts`: Functions instance properly exported
- [ ] Security Rules: Firestore rules enforce authentication checks
- [ ] CORS: Firebase Hosting CORS properly configured
- [ ] Domain Whitelist: Production domain added to Firebase Console

---

## 🚀 Staging Deployment (2-3 hours)

### Step 1: Deploy to Staging Environment

**Option A: Firebase Hosting Preview Channel**
```bash
# Build the app
npm run build

# Deploy to preview channel (not main)
firebase hosting:channel:deploy staging --token $FIREBASE_TOKEN
```
Preview URL: `https://lexi-ai-tutor--staging-XXXX.web.app`

**Option B: Vercel Preview**
```bash
# If using Vercel for frontend
vercel --prod
# Creates preview deployment
```

### Step 2: Deploy Cloud Functions to Staging

```bash
cd functions
npm run build
firebase deploy --only functions:chatWithLexi --project lexi-ai-tutor
```

**Verification:**
- [ ] Function appears in Firebase Console > Functions
- [ ] Function status is green (deployed successfully)
- [ ] No deployment errors in console

### Step 3: Smoke Tests (15 minutes)

**Authentication Flow:**
- [ ] Open staging URL
- [ ] Click "Sign in with Google"
- [ ] Verify redirect to Google login page
- [ ] Complete login
- [ ] Verify redirect back to app with user ID
- [ ] Check Firebase Console - new user appears in Authentication > Users

**Chat Functionality:**
- [ ] Type test message: "Hello Lexi"
- [ ] Monitor Network tab: Request goes to Cloud Function (not direct API)
- [ ] Verify response returns correctly
- [ ] Check Sentry - no errors recorded

**Database Connectivity:**
- [ ] Check user data persists in Firestore
- [ ] Verify database reads/writes are logged
- [ ] Confirm Analytics events are flowing

---

## 🔒 Critical Security Tests (1 hour)

### API Key Exposure Test

**Browser DevTools - Network Tab:**
- [ ] Open DevTools > Network tab
- [ ] Perform full user flow (login, chat, dashboard)
- [ ] Search all network requests for "AIza" - **MUST FIND ZERO RESULTS**
- [ ] Verify all API calls go to `.firebaseapp.com` domain
- [ ] Check Authorization headers contain Firebase tokens (not API keys)

**Source Code Inspection:**
- [ ] Open DevTools > Sources tab
- [ ] Search in all JS files for "AIza" - **MUST FIND ZERO RESULTS**
- [ ] Search for "GEMINI_API_KEY" - **MUST FIND ZERO RESULTS**
- [ ] Verify minified code contains no API credentials

### Authentication & Authorization Tests

**Unauthenticated Access:**
- [ ] Open incognito window
- [ ] Access staging URL without logging in
- [ ] Attempt to send chat message
- [ ] Result: UI blocks action OR backend returns 401 Unauthorized
- [ ] Monitor Sentry for any security warnings

**Token Validation:**
- [ ] Log in normally
- [ ] In DevTools Console, run: `localStorage.clear()`
- [ ] Refresh page
- [ ] Try to chat
- [ ] Expected: Error message asking to re-login (token cleared)

### CORS & Domain Validation

- [ ] Verify requests only to Firebase domains (not external APIs)
- [ ] Check Cloud Function headers: `Access-Control-Allow-Origin` is correct
- [ ] Test from different domains (should fail CORS if not staging domain)

---

## ⚡ Performance Validation (30 minutes)

### Google Lighthouse Audit

```bash
# Run Lighthouse (in Chrome DevTools or CLI)
# Target minimum scores:
```

- [ ] Performance: >90
- [ ] Accessibility: >90
- [ ] Best Practices: >90
- [ ] SEO: >85
- [ ] PWA: Installable

**Bundle Size Check:**
- [ ] Main JS bundle: <500KB (gzipped)
- [ ] Total page load: <3 seconds on 4G
- [ ] Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1

### Cloud Functions Performance

**Cold Start Measurement:**
- [ ] Monitor first Cloud Function call after deployment
- [ ] Expected cold start: 5-10 seconds (acceptable)
- [ ] Warm calls: <1 second response time
- [ ] Set alert if consistently >3 seconds

**Concurrent User Testing:**
- [ ] Simulate 5-10 concurrent users sending messages
- [ ] Monitor Firestore quota usage
- [ ] Check Cloud Functions scaling (auto-scales from 1 to 100 instances)
- [ ] No timeouts or 429 (rate limit) errors

---

## 📱 PWA & Offline Functionality Testing (30 minutes)

### Service Worker Installation

**Desktop Testing:**
- [ ] Open staging URL
- [ ] DevTools > Application > Service Workers
- [ ] Verify service worker is registered and activated
- [ ] Check Cache Storage - app shell files are cached
- [ ] Open offline (DevTools > Network > offline)
- [ ] Navigate existing pages - should load from cache
- [ ] Attempt new API call (chat) - should show "Offline" message

**Mobile Installation:**
- [ ] Open staging URL on mobile browser
- [ ] Menu > "Install app" or browser prompt
- [ ] App installs to home screen
- [ ] Open installed app (should work offline)
- [ ] Disable network
- [ ] App shows cached content correctly
- [ ] Chat shows error about network when attempting message

### Network Recovery Testing

- [ ] Disable network
- [ ] Try to chat (fails gracefully with retry button)
- [ ] Enable network
- [ ] Click retry
- [ ] Message sends successfully
- [ ] Verify no data loss

---

## 🧪 Complete QA Checklist Execution

**Reference:** Run complete `QA_CHECKLIST.md`

- [ ] All 9 sections completed
- [ ] All critical tests passed
- [ ] No blocker issues found
- [ ] Medium/Low priority issues documented
- [ ] QA Lead signs off on Pass/Fail

**QA Sign-off:**
- [ ] QA Lead Name: ________________
- [ ] Date/Time: ________________
- [ ] Status: ☐ PASSED | ☐ FAILED (requires remediation)

---

## 🟢 Production Deployment Decision Gate

**GO/NO-GO Checklist:**

- [ ] Pre-Deployment Validation: 100% PASSED
- [ ] Smoke Tests: 100% PASSED
- [ ] Security Tests: 100% PASSED (zero API key exposure)
- [ ] Performance Tests: 100% PASSED (Lighthouse >90)
- [ ] PWA Tests: 100% PASSED
- [ ] QA Checklist: 100% PASSED (all critical items)
- [ ] All team members sign-off

**Final GO/NO-GO Decision:**
- [ ] **GO - Ready for Production Deployment**
- [ ] **NO-GO - Requires remediation** (document blocking issues below)

**Blocking Issues (if NO-GO):**
```
1. ____________________________
2. ____________________________
3. ____________________________
```

---

## 🎉 Production Deployment

### Step 1: Production Build

```bash
# Set production environment
export NODE_ENV=production

# Build
npm run build

# Verify build artifact size
ls -lh dist/
```

### Step 2: Deploy to Production

**Firebase Hosting:**
```bash
firebase deploy --only hosting --project lexi-ai-tutor
```

**Cloud Functions (if updates):**
```bash
firebase deploy --only functions --project lexi-ai-tutor
```

### Step 3: Verify Production Deployment

- [ ] Production URL accessible: `https://lexi-ai-tutor.web.app`
- [ ] SSL certificate valid (green lock icon)
- [ ] No DevTools errors in console
- [ ] Sentry receiving events
- [ ] Analytics dashboard shows traffic

### Step 4: Production Smoke Tests

- [ ] Sign in with Google (production flow)
- [ ] Send test chat message
- [ ] Verify response received
- [ ] Check Firestore for new user document
- [ ] Monitor Sentry for errors (should be 0)

---

## 📊 Monitoring & Observability Setup

### Sentry Configuration

- [ ] Sentry DSN configured in app
- [ ] Error tracking active
- [ ] Performance monitoring enabled
- [ ] Alerts configured for:
  - [ ] Error rate >5%
  - [ ] Response time >3s (p95)
  - [ ] Cloud Function failures

### Firebase Console Monitoring

- [ ] Monitor > Performance dashboard active
- [ ] Analytics > Events showing user activity
- [ ] Firestore > Monitor showing read/write rates
- [ ] Functions > Logs showing execution times

### Alert Configuration

- [ ] Uptime monitoring enabled
- [ ] Slack/Email alerts configured
- [ ] On-call escalation procedure defined
- [ ] Team notified of critical alerts

---

## 🔄 24-Hour Post-Deployment Checklist

**Day 1 - First 24 Hours:**

- [ ] System stability: Zero critical errors in Sentry
- [ ] User metrics: Expected traffic levels achieved
- [ ] Database: No quota exceeded warnings
- [ ] Performance: API response times stable (<1s)
- [ ] Authentication: Zero login failures reported
- [ ] Data integrity: All user data correctly persisted

**Daily Monitoring Tasks:**
- [ ] Check Sentry dashboard (morning/evening)
- [ ] Review Firebase Analytics for anomalies
- [ ] Monitor Cloud Function cold starts
- [ ] Verify backup processes running

---

## 🔄 7-Day Post-Deployment Checklist

**Week 1 - Full Week Stability:**

- [ ] No recurring errors
- [ ] User feedback positive (no complaints about downtime)
- [ ] Performance metrics stable and optimized
- [ ] Database scaling working correctly under load
- [ ] All features functioning as designed
- [ ] Cost analysis: Firebase usage within projections

---

## 🆘 Rollback Procedures (Emergency Only)

**If Critical Issues Found:**

### Step 1: Immediate Rollback (5 minutes)

```bash
# If hosting issue:
firebase hosting:rollback --project lexi-ai-tutor

# Returns to previous stable version
```

### Step 2: Investigation

- [ ] Check Sentry for error patterns
- [ ] Review recent commits for breaking changes
- [ ] Check Firebase Console for quota issues
- [ ] Verify Cloud Functions still responding

### Step 3: Fix & Re-deploy

- [ ] Fix issue in code
- [ ] Test on staging environment
- [ ] Deploy updated version to production
- [ ] Monitor for 1 hour after re-deployment

---

## 📞 Incident Response Contacts

**On-Call Engineer:**
- Name: ________________
- Phone: ________________
- Email: ________________
- Escalation: ________________

**Escalation Procedure:**
1. Issue detected in Sentry/Monitoring
2. Alert sent to Slack #incidents channel
3. On-call engineer investigates (15 min)
4. If not resolved in 30 min, escalate to Tech Lead
5. If production down >1 hour, initiate rollback

---

## 📝 Sign-Off

**Deployment Team Sign-Off:**

| Role | Name | Date | Signature |
|------|------|------|----------|
| Dev Lead | ________________ | __________ | __________ |
| QA Lead | ________________ | __________ | __________ |
| DevOps/Platform | ________________ | __________ | __________ |
| Product Owner | ________________ | __________ | __________ |

---

## 📚 Related Documentation

- `DEPLOYMENT_GUIDE.md` - Detailed deployment procedures
- `QA_CHECKLIST.md` - Comprehensive QA verification
- `PHASE_2_VERIFICATION.md` - Phase 2 completion status
- `INCIDENT_RESPONSE.md` - Crisis management procedures

---

**Last Updated:** November 22, 2025  
**Status:** Ready for Fire Drill Execution  
**Next Step:** Execute Pre-Deployment Validation
