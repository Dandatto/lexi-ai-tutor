# DEPLOYMENT GUIDE - Lexi AI Tutor Phase 2 Migration

## Overview
This guide provides comprehensive instructions for deploying Lexi AI Tutor Phase 2 Migration to production. The migration introduces cloud infrastructure, enhanced security, and production optimization to support scalability and reliability.

**Key Objectives:**
- Zero downtime migration
- Enhanced security with backend-only API keys
- Cloud Functions for API handling
- Progressive Web App (PWA) capabilities
- Advanced monitoring and error tracking

---

## Pre-Deployment Checklist

### Code Readiness
- [ ] All 5 stages of Phase 2 migration completed
- [ ] All commits reviewed and merged to main branch
- [ ] TypeScript compilation successful with zero errors
- [ ] Unit tests passing (100% coverage target)
- [ ] Integration tests passing
- [ ] Security audit completed
- [ ] Performance benchmarks validated
- [ ] API endpoint testing completed

### Security Verification
- [ ] No API keys exposed in frontend code
- [ ] No sensitive credentials in environment files committed to repository
- [ ] Firebase security rules reviewed and tested
- [ ] CORS policies configured correctly
- [ ] Authentication token validation implemented
- [ ] Permission checks in place for all API endpoints
- [ ] Rate limiting configured on Cloud Functions
- [ ] Input validation on all API endpoints

### Team Readiness
- [ ] Deployment team trained on rollback procedures
- [ ] On-call engineer assigned for deployment period
- [ ] Rollback plan reviewed and tested
- [ ] Communication channels established
- [ ] Status page monitoring prepared
- [ ] Customer support team briefed

---

## Step 1: Environment Configuration

### Firebase Project Setup

1. **Create Firebase Project** (if not already created)
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add project"
   - Name: `lexi-ai-tutor`
   - Enable Google Analytics (optional)

2. **Initialize Firestore Database**
   ```bash
   # Set up in production mode with security rules
   # Region: us-central1 (recommended for US users)
   # Multi-region: Enabled for high availability
   ```

3. **Configure Authentication**
   ```bash
   # Enable in Firebase Console:
   # - Email/Password authentication
   # - Google Sign-In
   # - Anonymous authentication (for guest access)
   ```

4. **Create Cloud Functions Project**
   - Enable Cloud Functions API
   - Set runtime: Node.js 18 or later
   - Set region: us-central1

### Environment Variables Setup

1. **Create `.env.production` file:**
   ```env
   # Firebase Configuration (PUBLIC - OK to expose)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=lexi-ai-tutor.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=lexi-ai-tutor
   VITE_FIREBASE_STORAGE_BUCKET=lexi-ai-tutor.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Sentry Configuration (PUBLIC - OK to expose DSN)
   VITE_SENTRY_DSN=your_sentry_dsn
   VITE_SENTRY_ENVIRONMENT=production
   VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
   ```

2. **Backend Environment Variables (Cloud Functions)**
   - Set in Cloud Functions Settings > Runtime environment variables:
   ```env
   # SENSITIVE - Never expose these to frontend
   OPENAI_API_KEY=xxx
   ANTHROPIC_API_KEY=xxx
   DATABASE_PASSWORD=xxx
   ADMIN_API_KEYS=xxx
   ```

### Vercel/Hosting Configuration

1. **Connect GitHub Repository**
   ```bash
   - Go to vercel.com
   - Import project from GitHub (Dandatto/lexi-ai-tutor)
   - Select main branch for production deployment
   ```

2. **Set Environment Variables in Vercel**
   - Add all VITE_* variables from .env.production
   - Set build command: `npm run build`
   - Set output directory: `dist`

3. **Configure Custom Domain**
   ```bash
   - Add your custom domain in Vercel Dashboard
   - Configure DNS records pointing to Vercel nameservers
   - Enable SSL/TLS certificate
   ```

---

## Step 2: Database Migration & Firestore Setup

### Deploy Firestore Security Rules

1. **Review Security Rules** (in `firestore.rules`)
   - Authentication required for all operations
   - User-based access control enforced
   - Token validation at every endpoint
   - Field-level security implemented

2. **Deploy Rules to Production**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Verify Rules Applied**
   - Access [Firebase Console Firestore Security Rules](https://console.firebase.google.com/project/lexi-ai-tutor/firestore/databases/-default-/security/rules)
   - Confirm rules are active and showing latest deployed version

### Database Migration

1. **Backup Existing Data** (if migrating from Phase 1)
   ```bash
   # Export current Firestore data
   firebase firestore:export backup_$(date +%Y%m%d_%H%M%S).json
   ```

2. **Create Collections**
   - Navigate to Firestore Console
   - Create collections in this order:
     - `users` - User profiles and metadata
     - `courses` - Course definitions
     - `lessons` - Individual lesson content
     - `userProgress` - User progress tracking
     - `tutoringSessions` - Tutoring session records
     - `feedback` - User feedback and ratings
     - `analytics` - Event tracking data

3. **Verify Collection Access**
   ```bash
   # Test read access
   curl -X POST https://firestore.googleapis.com/v1/projects/lexi-ai-tutor/databases/-default-/documents:query
   ```

---

## Step 3: Cloud Functions Deployment

### Deploy API Functions

1. **Build Cloud Functions**
   ```bash
   cd functions
   npm install
   npm run build
   ```

2. **Deploy Functions**
   ```bash
   firebase deploy --only functions
   ```

3. **Verify Function Deployment**
   - Access [Cloud Functions Console](https://console.cloud.google.com/functions)
   - Confirm functions showing "OK" status
   - Check function logs for errors: `firebase functions:log`

### Test API Endpoints

1. **Authentication Endpoint**
   ```bash
   # Test token validation
   curl -X POST https://region-lexi-ai-tutor.cloudfunctions.net/auth/validate \
     -H "Authorization: Bearer USER_TOKEN" \
     -H "Content-Type: application/json"
   ```

2. **Course Endpoint**
   ```bash
   curl -X GET https://region-lexi-ai-tutor.cloudfunctions.net/courses/list \
     -H "Authorization: Bearer USER_TOKEN"
   ```

3. **Error Handling**
   ```bash
   # Test error response (should return 401 without token)
   curl -X GET https://region-lexi-ai-tutor.cloudfunctions.net/courses/list
   # Expected: { "error": "Unauthorized", "code": "401" }
   ```

---

## Step 4: PWA & Service Worker Setup

### Service Worker Configuration

1. **Verify Service Worker Registration**
   - Check `vite.config.ts` - VitePWA plugin configured
   - Check `public/manifest.json` - PWA metadata correct
   - Check `index.html` - manifest link present

2. **Enable Service Worker in Production**
   ```bash
   # Build will automatically generate service worker
   npm run build
   ```

3. **Verify Service Worker Deployment**
   - Open DevTools > Application > Service Workers
   - Confirm service worker is "activated and running"
   - Check cached assets in Cache Storage

### PWA Installation

1. **Test PWA Installation**
   - Open app in production environment
   - Should show "Install" prompt
   - Vietnamese text: "Cài đặt Lexi trên thiết bị của bạn"
   - Click "Install" to verify it works

2. **Offline Capability Test**
   - Open DevTools > Network > Throttling
   - Select "Offline"
   - Should see "Bạn đang offline" indicator
   - Critical pages should still be accessible

### Workbox Caching Strategies

- **Cache First**: Static assets (JS, CSS, images)
- **Network First**: API calls with fallback to cache
- **Stale While Revalidate**: HTML documents
- **Background Sync**: Failed requests retry when online

---

## Step 5: Monitoring & Error Tracking Setup

### Sentry Configuration

1. **Create Sentry Project**
   ```bash
   - Go to sentry.io
   - Create new project for React
   - Copy DSN (Data Source Name)
   ```

2. **Set Sentry DSN**
   - Add to `.env.production`: `VITE_SENTRY_DSN=your_dsn`
   - Vercel will automatically pick up from environment

3. **Verify Sentry Integration**
   - In production, navigate to app
   - Go to Sentry Dashboard
   - Check "Transactions" tab - should see page loads
   - Check "Releases" - should show production version

### Performance Monitoring

1. **Enable Sentry Profiling**
   - Set `VITE_SENTRY_TRACES_SAMPLE_RATE=0.1` (10% sampling)
   - Review profiles in Sentry Dashboard > Performance

2. **Track Key Metrics**
   - Page load time
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)
   - Time to Interactive (TTI)

### Custom Monitoring

1. **Analytics Events**
   - User authentication events
   - Course completion events
   - Error events (with severity)
   - Performance bottlenecks

2. **Funnel Tracking**
   - User signup completion
   - Course enrollment
   - Lesson completion
   - Session retention

---

## Step 6: Deployment Procedure

### Pre-Deployment Verification

```bash
# 1. Test build locally
npm run build
echo "Build successful"

# 2. Run security checks
npm run security-check

# 3. Run all tests
npm run test
echo "All tests passed"

# 4. Final git check
git status
git log --oneline -5
```

### Production Deployment

1. **Vercel Deployment**
   - Push code to main branch: `git push origin main`
   - Vercel automatically triggers deployment
   - Wait for build to complete (typically 5-10 minutes)
   - Check deployment status in Vercel Dashboard

2. **Deployment Progress Tracking**
   - Building: Code is being compiled
   - Analyzing: Dependencies being analyzed
   - Downloading Cache: Reusing build cache
   - Building Output: Creating production bundle
   - Ready: Deployment complete

3. **Verify Production Deployment**
   - Navigate to production URL
   - Check browser console for errors
   - Verify Sentry shows new events
   - Confirm offline indicator works (throttle network)

### Smoke Tests (Immediate Post-Deployment)

```bash
# Test critical paths
1. User Authentication
   - Test login
   - Test signup
   - Test logout

2. Core Functionality
   - Browse courses
   - Access lesson content
   - Submit feedback

3. API Connectivity
   - Verify all endpoints responding
   - Check authentication headers
   - Test error scenarios

4. Performance
   - Page load < 3 seconds
   - API response < 1 second
   - No console errors
```

---

## Step 7: Rollback Procedures

### Quick Rollback (If Critical Issue Detected)

1. **Revert to Previous Vercel Deployment**
   ```bash
   # In Vercel Dashboard:
   # 1. Go to Deployments
   # 2. Find last known-good deployment
   # 3. Click "Promote to Production"
   # Takes effect immediately (< 30 seconds)
   ```

2. **Revert to Previous Cloud Functions**
   ```bash
   # In Cloud Functions Console:
   # 1. Select function with issue
   # 2. Click "Trigger" tab
   # 3. View deployment history
   # 4. Click "Redeploy" on previous version
   ```

3. **Revert Database Changes**
   ```bash
   # From backup created before deployment:
   firebase firestore:restore backup_YYYYMMDD_HHMMSS.json
   ```

### Communication During Incident

- [ ] Notify team in #deployments Slack channel
- [ ] Update status page: "Investigating issue"
- [ ] Monitor Sentry dashboard for error trends
- [ ] Prepare rollback explanation for users

### Post-Incident Review

- [ ] Document what went wrong
- [ ] Root cause analysis
- [ ] Preventive measures for next deployment
- [ ] Update deployment guide if needed

---

## Step 8: Health Checks & Monitoring

### Production Health Check Endpoints

1. **App Status**
   ```bash
   GET /health
   Response: { "status": "ok", "version": "2.0.0" }
   ```

2. **Database Connectivity**
   ```bash
   GET /health/database
   Response: { "firestore": "connected", "latency": "120ms" }
   ```

3. **API Gateway Status**
   ```bash
   GET /health/api
   Response: { "cloudfunctions": "ok", "response_time": "95ms" }
   ```

4. **Authentication Service**
   ```bash
   GET /health/auth
   Response: { "firebase": "connected", "token_validation": "ok" }
   ```

### Monitoring Dashboard Setup

1. **Sentry Dashboard**
   - Monitor "Issues" tab for errors
   - Review error trends over time
   - Set alerts for error spike (>50% increase)

2. **Vercel Analytics**
   - Page load times
   - Request latency
   - Error rates

3. **Firebase Console**
   - Firestore read/write operations
   - Cloud Functions execution time
   - API quota usage

### Alert Configuration

```
Sentry Alerts:
- New issue created
- Error spike (20+ events in 5 minutes)
- Performance degradation (>30% slower)

Vercel Alerts:
- Build failure
- Deployment timeout
- 500 error rate > 1%

Firebase Alerts:
- Quota exceeded warnings
- Function timeout
- Database quota exceeded
```

---

## Step 9: Post-Deployment Verification

### 24-Hour Post-Deployment Checklist

- [ ] Zero critical errors in Sentry
- [ ] Error rate < 0.1%
- [ ] Page load time < 3 seconds (p95)
- [ ] API response time < 1 second (p95)
- [ ] All user authentication flows working
- [ ] PWA installation and offline working
- [ ] No 401/403 errors for valid users
- [ ] Database queries performing within SLA
- [ ] Service worker cached correctly
- [ ] No API key leaks detected

### 7-Day Post-Deployment Metrics

- [ ] User engagement maintained (no drop-off)
- [ ] Course completion rates stable
- [ ] Zero security incidents
- [ ] Performance stable
- [ ] Database growth within predictions
- [ ] Cost metrics within budget

---

## Step 10: Troubleshooting Guide

### Common Issues & Solutions

#### Issue: "401 Unauthorized" errors for all users
**Possible Causes:**
- Firebase security rules too restrictive
- Token validation failing
- CORS configuration incorrect

**Solution:**
```bash
# 1. Check Firestore security rules
firebase firestore:rules:get

# 2. Verify Cloud Functions logs
firebase functions:log

# 3. Check CORS headers
curl -I https://your-domain.com
```

#### Issue: "Service Worker not updating"
**Possible Causes:**
- Browser cache not cleared
- Service worker registration issue
- Build artifact not deployed

**Solution:**
```bash
# 1. Check vite.config.ts VitePWA configuration
# 2. Verify manifest.json deployed
# 3. User: Clear browser cache (Cmd+Shift+Del)
# 4. Unregister and re-register: DevTools > Application > Service Workers
```

#### Issue: "Network errors offline"
**Possible Causes:**
- Workbox caching not configured
- Offline indicator not showing
- Critical files not cached

**Solution:**
```bash
# 1. Verify workbox caching strategies in vite.config.ts
# 2. Check OfflineIndicator component rendering
# 3. Test with DevTools Network Offline mode
```

#### Issue: "High error rate in Sentry"
**Possible Causes:**
- Backend issue (check Cloud Functions logs)
- Frontend issue (check browser console)
- Third-party service unavailable

**Solution:**
```bash
# 1. Check Sentry issue details for error stack trace
# 2. Review Cloud Functions logs
# 3. Check third-party service status
# 4. If critical: Execute rollback procedure
```

#### Issue: "Database quota exceeded"
**Possible Causes:**
- Unexpected traffic spike
- Inefficient queries
- Data growth larger than predicted

**Solution:**
```bash
# 1. Upgrade Firestore plan
# 2. Optimize queries (add indexes)
# 3. Implement caching strategy
# 4. Monitor quota dashboard
```

---

## Deployment Runbook Summary

| Phase | Duration | Owner | Status |
|-------|----------|-------|--------|
| Environment Setup | 1-2 hours | DevOps | Pre-deployment |
| Database Migration | 30 minutes | DBA | Pre-deployment |
| Cloud Functions Deploy | 10 minutes | Backend | During deployment |
| Frontend Deploy | 10 minutes | Frontend | During deployment |
| PWA Setup | 5 minutes | Frontend | During deployment |
| Monitoring Activation | 5 minutes | DevOps | Post-deployment |
| Health Checks | 15 minutes | QA | Post-deployment |
| **TOTAL TIME** | **~2.5 hours** | **TEAM** | **0-Downtime** |

---

## Contact & Escalation

**On-Call Engineer:** [Team contact]
**Slack Channel:** #production-incidents
**Status Page:** https://status.lexi-ai-tutor.com
**Runbook Location:** This document

**If Major Issue Detected:**
1. Notify #production-incidents immediately
2. Execute rollback procedure
3. Document incident
4. Schedule post-mortem

---

**Last Updated:** [Deployment Date]
**Maintained By:** Development Team
**Next Review:** 30 days post-deployment
