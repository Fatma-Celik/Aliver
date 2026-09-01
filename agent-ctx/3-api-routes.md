# Task ID: 3 — Family & Shopping List API Routes

## Status: Completed

## Summary
Created 7 API route files for the ALIVER app covering family management (create, join, leave, QR) and shopping list/item CRUD operations.

## Files Created

### Family Routes
1. `src/app/api/family/create/route.ts` — POST: create family with random 6-char invite code, caller becomes admin
2. `src/app/api/family/join/route.ts` — POST: join family by invite code
3. `src/app/api/family/my-family/route.ts` — GET: return user's family with members
4. `src/app/api/family/leave/route.ts` — POST: leave family, cascade delete if last admin
5. `src/app/api/family/qr/route.ts` — GET: return invite code, family name, and aliver:// deep link

### List Routes
6. `src/app/api/lists/route.ts` — GET (all lists with item counts), POST (create list)
7. `src/app/api/lists/items/route.ts` — GET (items by listId), POST (add item), PATCH (toggle completion), DELETE (remove item)

## Key Design Patterns
- Auth: extractToken → verifyToken → proceed/401
- Family scoping: every data operation verifies familyId matches user membership
- Cascade delete: transaction-based deletion of items → lists → members → family on last admin leave
- Invite code: collision-retry loop guarantees uniqueness

## Lint: Clean (0 errors)
