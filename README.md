# Laapak PO - Price Offer Generator

A modern, web-based Price Offer (PO) generation system for B2B clients. Built with Next.js, PostgreSQL (via Prisma), and Tailwind CSS.

## Features

- ✅ Client Management - Create and manage B2B clients
- ✅ Price Offer Creation - Generate professional price offers with line items
- ✅ Public Sharing - Share price offers via public links
- ✅ PDF Export - Download price offers as PDFs
- ✅ Status Management - Track offer status (Pending, Approved, Expired)
- ✅ Automatic Expiration - POs automatically expire based on validity date
- ✅ View Tracking - Track when price offers are viewed
- ✅ Responsive Design - Mobile-friendly interface
- ✅ Brand Customization - Laapak brand styling

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MySQL (via Prisma ORM)
- **Styling**: Tailwind CSS
- **PDF Generation**: Puppeteer
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MySQL database (8.0+)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd laapak-po-web
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database connection:
```env
DATABASE_URL="mysql://user:password@localhost:3306/laapak_po"
NODE_ENV="development"
```

4. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma Client
- `npm run db:studio` - Open Prisma Studio
- `npm run type-check` - Type check TypeScript

## Project Structure

```
laapak-po-web/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── p/                # Public PO pages
│   │   └── page.tsx          # Home page
│   └── lib/
│       ├── prisma.ts         # Prisma client
│       └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma         # Database schema
├── public/
│   └── assets/               # Static assets
└── package.json
```

## Production Deployment

See [PRODUCTION.md](./PRODUCTION.md) for detailed production deployment instructions.

Quick deployment options:
- **Vercel** (Recommended) - Automatic deployments, SSL, CDN
- **Self-hosted** - Nginx + PM2
- **Docker** - Containerized deployment

## Database Schema

- **Client** - B2B client information
- **PurchaseOffer** - Price offers with settings and visibility toggles
- **LineItem** - Individual items in a price offer
- **POView** - View tracking for analytics

## Security

- Environment variables for sensitive data
- Security headers configured
- Input validation on all API routes
- SQL injection protection via Prisma

## License

Private - Laapak Internal Use

## Support

For issues or questions, please contact the development team.
