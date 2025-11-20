# Hướng dẫn thiết lập - Phase 2: Database Migration & Gemini Integration

## Tổng quan Phase 2

Phase 2 là giai đoạn quan trọng nhất - chuyển đổi Lexi từ Client-side application sang Serverless architecture với Firebase.

### Mục tiêu Phase 2
1. ✅ Migrate từ `localStorage` sang `Firestore` (Database)
2. ✅ Integrate `AuthContext` với Firestore user data
3. ✅ Implement `DataContext` cho Realtime data sync
4. ✅ Secure Gemini API Key bằng Cloud Functions
5. ✅ Create Data Audit Tool để inspect existing data
6. ✅ Setup Firebase Security Rules

---

## Các file sẽ tạo/chỉnh sửa

### Stage 1: Core Configuration (1 ngày)
- `src/firebaseConfig.ts` - Firebase config
- `src/contexts/AuthContext.tsx` - Authentication management
- Update `src/App.tsx` - Integrate AuthContext

### Stage 2: Database Layer (2-3 ngày)
- `src/services/firestoreService.ts` - Firestore CRUD operations
- `src/contexts/DataContext.tsx` - Realtime data sync
- `src/utils/migrationHelper.ts` - localStorage → Firestore migration

### Stage 3: Security (2 ngày)
- `functions/` - Firebase Cloud Functions
- `functions/src/geminiProxy.ts` - Gemini API secure endpoint
- `src/services/geminiCloudService.ts` - Secure API calls

### Stage 4: Tooling (1 ngày)
- `src/components/MigrationAuditModal.tsx` - Data inspection tool
- `src/contexts/DebugContext.tsx` - Debug utilities

---

## Firestore Schema Design

```
lexi-ai-tutor (Database)
├── users (Collection)
│   └── {userId} (Document)
│       ├── persona (Object)
│       │   ├── name: string
│       │   ├── grade: string
│       │   ├── learningStyle: string
│       │   ├── createdAt: timestamp
│       │   └── updatedAt: timestamp
│       ├── stats (Object)
│       │   ├── totalScore: number
│       │   ├── streak: number
│       │   ├── totalSessions: number
│       │   └── lastActivityAt: timestamp
│       ├── sessions (Subcollection)
│       │   └── {sessionId} (Document)
│       │       ├── unitId: string
│       │       ├── score: number
│       │       ├── duration: number
│       │       ├── feedback: string
│       │       └── createdAt: timestamp
│       └── notebook (Subcollection)
│           └── {entryId} (Document)
│               ├── content: string
│               ├── category: string
│               ├── tags: array
│               └── createdAt: timestamp
```

---

## Execution Timeline

### Day 1: Foundation (Stage 1)
- [ ] Create `firebaseConfig.ts`
- [ ] Setup `AuthContext.tsx`
- [ ] Update `App.tsx` routing
- [ ] Test authentication flow

### Day 2-3: Database (Stage 2)
- [ ] Design Firestore schema
- [ ] Create `firestoreService.ts`
- [ ] Create `DataContext.tsx`
- [ ] Setup data sync listeners
- [ ] Test data operations

### Day 4-5: Security (Stage 3)
- [ ] Setup Firebase Functions
- [ ] Create Gemini proxy endpoint
- [ ] Update gemini service for secure calls
- [ ] Setup security rules
- [ ] Test API security

### Day 6: Tooling & Testing (Stage 4)
- [ ] Create MigrationAuditModal
- [ ] Create migration script
- [ ] End-to-end testing
- [ ] Documentation

---

## Critical Implementation Notes

### 1. Firestore Security Rules (Phase 2 Test Mode)
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      match /sessions/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
      match /notebook/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

### 2. Migration Strategy
- Detect localStorage data on first Firestore query
- Auto-migrate to user document
- Keep localStorage as fallback (1 week)
- Display migration notification to user

### 3. Backward Compatibility
- Maintain localStorage functions temporarily
- Fallback to localStorage if Firestore unavailable
- Version-check data structure

### 4. Error Handling
- Graceful fallback to localStorage
- Clear error messages to user
- Automatic retry logic
- Error logging to console

---

## API Key Security Implementation

### Current Risk (Phase 1)
- API Key exposed in `geminiService.ts`
- Accessible via Browser DevTools
- Vulnerable to quota theft

### Solution (Phase 2)
```
Frontend (React)
    ↓ (Secure HTTPS call)
  Cloud Function (Firebase)
    ↓ (Use API Key from Environment)
  Gemini API
```

### Cloud Function Template
```typescript
imports {GoogleGenerativeAI} from '@google/generative-ai';
import * as functions from 'firebase-functions';

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chatWithLexi = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new Error('Not authenticated');
  
  // Process chat request
  const response = await ai.models.generateContent(...);
  return response;
});
```

---

## Success Criteria

- [ ] Users can login with Firebase Auth
- [ ] User data persists in Firestore
- [ ] Data syncs in real-time across tabs
- [ ] Old localStorage data migrates automatically
- [ ] Gemini API works through secure endpoint
- [ ] All data is private (userId-based access)
- [ ] App works offline (basic functionality)
- [ ] No API Key leaks in frontend code
- [ ] Performance: <100ms for Firestore queries
- [ ] Security: All collections user-protected

---

## Next Steps

1. Generate code via Gemini based on this plan
2. Create files in proper directory structure
3. Test each stage incrementally
4. Document any changes to the plan
5. Commit to git with clear messages

---

## Repository Reference
- GitHub: https://github.com/Dandatto/lexi-ai-tutor
- Firebase: https://console.firebase.google.com/project/lexi-ai-tutor
- Gemini Studio: [Gemini Project Link]

**Status**: Phase 2 In Progress
**Last Updated**: 2025-11-20
**Version**: 1.0
