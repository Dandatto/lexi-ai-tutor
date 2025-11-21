# Stage 4: Frontend Integration & Security Cleanup - Implementation Plan

## Status: IN PROGRESS ✅

**Commits Completed**: 2 of 4
**Overall Progress**: 50%

---

## Stage 4 Overview

**Goal**: Migrate Lexi frontend from direct Gemini API calls to secure Cloud Functions proxy pattern

**Security Focus**: 
- ✅ **ZERO downtime** - Lexi continues operating seamlessly
- ✅ **MAXIMUM security** - API Key protected on backend only
- ✅ **ZERO data loss** - All user data preserved
- ✅ **ANTI-HACK measures** - 401 auth enforcement, no key leakage

---

## Completed Work

### Commit 1: Infrastructure Bridge ✅
**Message**: `feat(firebase): export functions instance and setup callable interface`

**Changes**:
- Added `import { getFunctions }` to `src/firebaseConfig.ts`
- Exported `functions` instance for Cloud Functions integration
- Enables frontend to call secure backend functions

**Files Modified**: `src/firebaseConfig.ts`

### Commit 2: TypeScript Types Definition ✅
**Message**: `refactor(service): migrate gemini calls to secure cloud proxy`

**Changes**:
- Created `src/types.ts` with Cloud Functions interfaces
- Defined `ChatWithLexiRequest` interface
- Defined `ChatWithLexiResponse` interface
- Created supporting `ChatMessage` and `UserSession` types

**Files Created**: `src/types.ts` (32 lines)

---

## Remaining Work

### Commit 3: Security Cleanup (PENDING)
**Message**: `chore(security): remove exposed API_KEY and google-genai sdk`

**Tasks**:
1. Modify `src/services/geminiService.ts`:
   - Remove direct GoogleGenAI SDK import
   - Remove `new GoogleGenAI({ apiKey... })` initialization
   - Replace with `httpsCallable('chatWithLexi')` pattern
   - Implement error handling for unauthenticated responses

2. Update `src/components/ChatInterface.tsx` (if exists):
   - Add authentication checks before chat
   - Handle 401 Unauthenticated errors

3. Remove from `package.json`:
   - Run `npm uninstall @google/genai` equivalent
   - Remove SDK dependency

4. Clean environment variables:
   - Remove `VITE_GEMINI_API_KEY` references
   - Delete `.env` API_KEY lines

**Files to Modify**:
- `src/services/geminiService.ts` (~150 lines)
- `.env` or `vite.config.ts`
- `package.json`

### Commit 4: UX Hardening (PENDING)
**Message**: `fix(ux): add auth guards and network error handling`

**Tasks**:
1. Add authentication guards to prevent unauthorized API calls
2. Implement error boundary for network failures
3. Handle Firebase Function timeout scenarios
4. Add user-friendly error messages
5. Implement fallback UI for degraded modes

**Files to Modify**:
- `src/App.tsx`
- `src/components/ChatInterface.tsx`
- Error handling utilities

---

## Token Flow & Security Chain

```
1. User Login → Firebase Auth → ID Token (JWT)
   ↓
2. User sends message → httpsCallable('chatWithLexi')
   ↓
3. Firebase SDK auto-injects → Authorization: Bearer <ID_TOKEN>
   ↓
4. Cloud Function receives → request.auth validates token
   ↓
5. If invalid → 401 Unauthenticated ← Frontend catches error
   ↓
6. If valid → Backend uses API_KEY from Secret Manager
   ↓
7. Backend calls → Google Gemini API securely
   ↓
8. Response returned → Frontend displays result
```

---

## Testing Strategy

### Functional Test
- [ ] Sign into Lexi app
- [ ] Send message: "Hello"
- [ ] Verify response received ✓ = SUCCESS

### Security Test (Incognito Mode)
- [ ] Open incognito tab (no login)
- [ ] Try to send chat message
- [ ] Open Developer Tools → Network tab
- [ ] Verify backend returns: **401 Unauthorized**
- [ ] No API response from frontend

### Leak Detection Test
- [ ] View Page Source (Cmd+U on Mac)
- [ ] Search for: "AIza" (Google API Key format)
- [ ] Search for: "generative-ai" (SDK keyword)
- [ ] Result: **"Not Found"** = SECURE ✓

---

## Security Checklist

- [ ] Cloud Functions deployed and working (Stage 3 Done)
- [ ] Frontend has firebase package installed (Stage 2 Done)
- [ ] No file in `src/` contains hardcoded API Key
- [ ] No `.env` file has `VITE_GEMINI_API_KEY` exposed
- [ ] `@google/genai` SDK removed from frontend
- [ ] All gemini calls use `httpsCallable` pattern
- [ ] ID token verification enforced on backend
- [ ] 401 errors handled gracefully in frontend
- [ ] No data loss during migration verified
- [ ] Zero downtime maintained throughout migration

---

## Architecture Comparison

### BEFORE (Stage 3)
```
Frontend (React)
    ↓
[API_KEY exposed]
    ↓
[GoogleGenAI SDK]
    ↓
Direct to Google Gemini
```

### AFTER (Stage 4)
```
Frontend (React)
    ↓
[httpsCallable + ID Token]
    ↓
Cloud Functions (Protected)
    ↓
[API_KEY in Secret Manager]
    ↓
Google Gemini API
```

---

## Deployment Notes

**Order of Execution**:
1. ✅ Commit 1: Infrastructure Bridge
2. ✅ Commit 2: TypeScript Types
3. ⏳ Commit 3: Security Cleanup
4. ⏳ Commit 4: UX Hardening
5. ⏳ Create STAGE_4_VERIFICATION.md
6. ⏳ Execute all security tests

**Rollback Plan**:
- Commits 1 & 2 are non-breaking (additive only)
- Commits 3 & 4 can be rolled back individually
- No permanent deletions until final verification

---

## Next Steps

1. **Modify geminiService.ts** to use Cloud Functions
2. **Update error handling** in Chat components
3. **Remove @google/genai** dependency
4. **Execute security tests** in all three scenarios
5. **Create verification document** with test results
6. **Prepare for Stage 5** (Production Deployment)

---

**Last Updated**: Stage 4 In Progress
**Created by**: Comet (AI Assistant) with Gemini Planning
**Target Status**: Ready for Stage 5 by next session
