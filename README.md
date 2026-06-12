# review-collect

review-collect is a QR-code-powered customer review platform. Businesses create campaigns with incentives — customers scan, review, and win. No app download required.

---

## The Problem

Small businesses struggle to collect genuine reviews. Asking customers in person is awkward. Email follow-ups go unread. Google and Yelp review counts stay embarrassingly low while the business next door somehow has 400 five-star ratings. Most review tools require customers to download an app or create an account — killing conversion before it starts.

review-collect fixes this with a single QR code. A customer scans it, fills in a 30-second form, and is entered to win a prize the business set up. No account. No app. Just a review.

---

## How It Works

1. **Business signs up** — creates a profile, sets an incentive (e.g. "Win a $50 gift card"), and launches a campaign.
2. **Gets a QR code** — the platform generates a unique QR code linked to the campaign. Print it on a receipt, stick it on the counter, or embed it in an email.
3. **Customers scan and review** — they land on a branded page, leave a star rating and optional feedback, and are entered to win. The business gets an instant notification.

The business dashboard shows all reviews, stats, and lets the owner mark a winner with one click.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 7 |
| Routing (client) | Wouter |
| UI Components | Radix UI primitives + shadcn/ui style |
| Styling | Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| Server | Node.js, Express |
| API | tRPC v11 |
| ORM | Drizzle ORM |
| Database | MySQL (via mysql2) |
| Auth | OAuth (JWT/JOSE, cookie-based sessions) |
| Payments | Stripe (Starter $29/mo, Pro $79/mo) |
| QR Codes | `qrcode` + `qrcode-svg` |
| File Storage | AWS S3 |
| Testing | Vitest |
| Package Manager | pnpm |

---

## Local Setup

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- A MySQL database
- A Stripe account (for payments)

### Steps

```bash
# Clone the repo
git clone https://github.com/Engr-BenitoIshimwe/review-collect.git
cd review-collect

# Install dependencies
pnpm install

# Copy and fill in environment variables
cp .env.example .env
# Edit .env with your values

# Push the database schema
pnpm db:push

# Start the development server
pnpm dev
```

The app runs at `http://localhost:3000` by default.

### Build for Production

```bash
pnpm build
pnpm start
```

---

## Key Features

- **QR Code Generation** — each business campaign gets a unique, printable QR code (PNG and SVG)
- **Incentive Campaigns** — set a prize title, description, and value; customers are entered on review submission
- **Review Collection** — star rating (1–5), written feedback, name, email, and optional phone; no customer account required
- **Winner Selection** — business owner marks a winner from the dashboard with one click
- **Business Dashboard** — review list with search and rating filters, aggregate stats, CSV export
- **Subscription Tiers** — Free, Starter ($29/mo), and Pro ($79/mo) with feature gates (analytics, email notifications, custom branding)
- **Instant Notifications** — owner is notified the moment a review comes in

---

## API Endpoints

All data endpoints are served via tRPC at `/trpc/*`. The table below maps the logical operations:

| Procedure | Type | Auth | Description |
|---|---|---|---|
| `auth.me` | query | public | Returns the current session user |
| `auth.logout` | mutation | public | Clears the session cookie |
| `business.get` | query | protected | Get the authenticated user's business |
| `business.upsert` | mutation | protected | Create or update business profile |
| `business.getPublic` | query | public | Get business + active campaign by slug |
| `campaign.list` | query | protected | List all campaigns for the business |
| `campaign.create` | mutation | protected | Create a new campaign |
| `campaign.update` | mutation | protected | Update a campaign |
| `campaign.delete` | mutation | protected | Delete a campaign |
| `review.submit` | mutation | public | Submit a customer review |
| `review.list` | query | protected | List reviews with filters and pagination |
| `review.markWinner` | mutation | protected | Mark a review as the prize winner |
| `review.exportCsv` | query | protected | Export reviews as CSV |
| `subscription.*` | mixed | protected | Stripe checkout and webhook handling |

REST routes:

| Method | Path | Description |
|---|---|---|
| GET | `/api/oauth/callback` | OAuth login callback |
| POST | `/api/stripe/webhook` | Stripe webhook receiver |

---

## Screenshots

> Screenshots will be added here once the hosted demo is live.

<!-- Suggested screenshots:
  1. Landing / QR code scan page (customer view)
  2. Review submission form
  3. Business dashboard — review list
  4. Business dashboard — stats overview
  5. Campaign creation form
  6. Pricing page (Free / Starter / Pro)
-->

---

## Known Limitations

- Input validation and rate limiting are planned for v2
- The review submission endpoint is currently unauthenticated and unenforced at the network level; a bad actor could submit fake reviews programmatically

---

## License

MIT — see [LICENSE](LICENSE)
