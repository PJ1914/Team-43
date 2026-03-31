# Firestore Setup Instructions

## Problem Fixed
The Firestore "INTERNAL ASSERTION FAILED" error was caused by:
1. Missing composite index for queries with multiple `where()` clauses
2. Listener subscribing before configuration was loaded
3. Rapid listener setup/teardown causing state issues

## Changes Made

### 1. Fixed Real-time Subscription ([frontend/src/hooks/useRealtimeEntries.ts](frontend/src/hooks/useRealtimeEntries.ts))
- **Removed `orderBy()`** from query (now sorts client-side)
- **Added active flag** to prevent stale callbacks
- **Added error logging** for debugging
- **Proper cleanup** on unsubscribe

### 2. Fixed Component Lifecycle ([frontend/src/pages/Sections/SectionPage.tsx](frontend/src/pages/Sections/SectionPage.tsx))
- **Wait for config** before subscribing (`isLoaded` check)
- **Error handling** for subscription failures
- **Dependencies updated** to include `isLoaded`

### 3. Created Firestore Configuration Files

#### firestore.indexes.json
Defines composite indexes for efficient queries.

#### firestore.rules
Security rules for all collections.

## Deploy Firestore Rules & Indexes

### Option 1: Firebase Console (Recommended for Quick Fix)

1. **Deploy Security Rules:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Navigate to **Firestore Database** → **Rules**
   - Copy content from `firestore.rules` and paste
   - Click **Publish**

2. **Create Indexes:**
   - Go to **Firestore Database** → **Indexes**
   - Click **Add Index**
   - **For entries collection:**
     - Collection: `entries`
     - Fields:
       - `reportId` (Ascending)
       - `sectionId` (Ascending)
       - `createdAt` (Descending)
     - Query scope: Collection
   - Click **Create**

### Option 2: Firebase CLI (Automated)

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project root
firebase init

# Select:
# - Firestore (rules and indexes)
# - Use existing project
# - Accept default filenames

# Deploy rules and indexes
firebase deploy --only firestore
```

## Testing

After deployment:
1. Refresh your browser
2. Navigate to a report section
3. The "INTERNAL ASSERTION FAILED" error should be gone
4. Entries should load without errors

## Current Query Structure

**Before (Required Index):**
```typescript
query(
  entriesRef,
  where("reportId", "==", reportId),
  where("sectionId", "==", sectionId),
  orderBy("createdAt", "desc") // ❌ Needs index
);
```

**After (No Index Required):**
```typescript
query(
  entriesRef,
  where("reportId", "==", reportId),
  where("sectionId", "==", sectionId)
  // ✅ Sorting done client-side
);
```

## Temporary Solution

If you can't deploy Firestore rules immediately, the current code will work because:
- Sorting is done client-side (no `orderBy()` in query)
- Subscription waits for config to load
- Proper error handling prevents crashes

## Production Deployment

For production, you should:
1. ✅ Deploy `firestore.rules` (security)
2. ✅ Deploy `firestore.indexes.json` (performance)
3. Consider re-adding `orderBy()` after index is created (better performance for large datasets)

## Security Rules Summary

- **Users**: Read by all authenticated, write by self or admin
- **Reports**: Read by all, create by all, modify by admin/coordinator
- **Sections**: Full access for authenticated users
- **Entries**: Read by all, create by all, modify/delete by creator or admin
- **Config**: Read by all, write by admin only
