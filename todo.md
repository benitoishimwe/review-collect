# ReviewCollect — Project TODO

## Phase 1: Schema & Backend
- [x] Database schema: businesses, campaigns, reviews tables
- [x] DB helpers: business CRUD, campaign CRUD, review CRUD
- [x] tRPC: business profile procedures (get, upsert)
- [x] tRPC: campaign procedures (create, update, get, list)
- [x] tRPC: review procedures (submit public, list, export)
- [x] Unique slug generation for each business QR link
- [x] Run db:push to apply migrations

## Phase 2: Global Styles & Landing + Auth
- [x] Elegant global theme (color palette, typography, CSS variables)
- [x] Landing page (hero, features, CTA)
- [x] Auth flow (login redirect, protected routes)
- [x] Dashboard layout with sidebar navigation

## Phase 3: Dashboard Features
- [x] Business profile setup page
- [x] Campaign/incentive creation and management
- [x] QR code generation and display (downloadable)
- [x] Review management table with filtering
- [x] CSV export of reviews

## Phase 4: Customer Review Page
- [x] Public review submission page (no login)
- [x] Business info + incentive display
- [x] Review form: name, email, phone, star rating, text feedback
- [x] Submission confirmation page

## Phase 5: Polish & Delivery
- [x] Vitest unit tests for backend procedures
- [x] Responsive design check
- [x] Empty states and loading skeletons
- [x] Save checkpoint and deliver

## Phase 6: Enhancements
- [x] Add "Share to Google" button on review success page

## Phase 7: Stripe Subscriptions
- [x] Set up Stripe integration with webdev_add_feature
- [x] Update DB schema: subscription tier, status, Stripe customer/subscription IDs
- [x] Create Stripe product/price IDs for Starter ($29) and Pro ($79) tiers
- [x] Build pricing page with tier comparison
- [x] Build Stripe checkout flow (redirect to Stripe Checkout)
- [ ] Build subscription management dashboard (current plan, billing history, cancel)
- [ ] Implement webhook handler for subscription events (created, updated, deleted)
- [x] Add feature gates: analytics (Pro only), email notifications (Pro only), custom branding (Pro only)
- [ ] Test subscription flow end-to-end
