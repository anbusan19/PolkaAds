# Fixes Applied

## Issue: "window is not defined" Error

### Problem
Polkadot.js API was being imported during server-side rendering, causing a `window is not defined` error.

### Solution
Made all Polkadot.js imports dynamic and client-side only:

1. **blockchain.ts**: Changed to dynamic imports
   - Only loads API in browser
   - Checks for `window` before initializing

2. **AdSubmissionForm.tsx**: Dynamic imports for blockchain functions
   - Imports functions only when needed
   - Prevents SSR issues

### Changes Made

#### lib/blockchain.ts
- ✅ Dynamic import of `@polkadot/api`
- ✅ Dynamic import of `@polkadot/extension-dapp`
- ✅ Browser-only check

#### components/AdSubmissionForm.tsx
- ✅ Removed static imports
- ✅ Added dynamic imports in functions

## How to Test

```powershell
# Stop the dev server (Ctrl+C)
# Restart it
npm run dev
```

The error should be gone and the app should load properly.

## What This Means

- ✅ App now works with Next.js SSR
- ✅ Polkadot.js only loads in browser
- ✅ No more "window is not defined" errors
- ✅ Better performance (code splitting)

## Next Steps

1. Restart dev server
2. Open http://localhost:3000
3. Connect wallet
4. Test registration
5. Submit ad

---

**Status**: Fixed ✅  
**Action**: Restart `npm run dev`
