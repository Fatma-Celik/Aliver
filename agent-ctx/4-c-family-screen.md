# Task 4-c: Family Management Screen

**Status:** ✅ Complete
**File:** `src/components/aliver/family-screen.tsx`

## What was built
Family management screen with two UI states driven by whether the user has a family in the store.

### State 1 — No Family
- Two responsive cards (side-by-side on desktop, stacked on mobile)
- **Aile Oluştur:** name input + gold gradient pill create button
- **Aileye Katıl:** invite code input (monospace, auto-uppercase) + join button + QR camera note
- POST `/api/family/create` and POST `/api/family/join` with Bearer token

### State 2 — Has Family
- **Header:** Family name (2xl bold), member count badge (gold tint), Shield icon
- **QR Code:** `QRCodeSVG` from `qrcode.react` (180px, navy fg), invite code in gold monospace with Copy/Check toggle
- **Members list:** `max-h-96` scrollable, each row has: first-letter gold avatar (solid for admin, outline for member), name, Turkish relative time join date, role badge (Crown+gold for admin, gray for member)
- **Leave button:** Red-tinted, opens confirm Dialog
- **Leave Dialog:** Dark themed, family name in white, cancel + red confirm buttons

### Technical notes
- All API calls use `Authorization: Bearer ${token}` header
- Toast notifications via `sonner` for all actions
- Framer Motion: stagger children, AnimatePresence for family state transitions, per-member slide-in
- Turkish relative time helper: supports seconds through years
- Lint: clean, no errors
