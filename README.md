# Cozy Condo - Marketing Website

Premium short-term rental marketing website for Cozy Condo properties in Iloilo City, Philippines.

## Features

- 🏠 **Property Showcase** - Display all 9+ properties with photos, amenities, and locations
- 📝 **Blog System** - Share travel tips and local guides with rich content
- 💬 **Contact Integration** - Facebook Messenger, phone, and email
- 🔧 **Admin Panel** - Manage properties, blog posts, and site settings
- 📱 **Responsive Design** - Beautiful on all devices
- ⚡ **Optimized Performance** - Fast loading with Next.js 16 and Turbopack

## Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Dokploy
- **UI Components**: Lucide React Icons

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd cozy-condo
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=https://cozycondo.net
ADMIN_PASSWORD=your_secure_password
```

### 3. Set Up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the SQL in `supabase/schema_optimized.sql` to create tables
4. Create storage buckets:
   - `property-photos` (public)
   - `blog-images` (public)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
cozy-condo/
├── src/
│   ├── app/
│   │   ├── admin/           # Admin panel pages
│   │   ├── api/             # API routes
│   │   ├── blog/            # Blog pages
│   │   ├── contact/         # Contact page
│   │   ├── properties/      # Property pages
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Homepage
│   ├── components/          # Reusable components
│   └── lib/                 # Utilities and types
├── public/                  # Static assets
├── supabase/
│   └── schema_optimized.sql # Optimized database schema
└── README.md
```

## Admin Panel

Access the admin panel at `/admin`. Enter any password (4+ characters) for demo access.

### Admin Features

- **Dashboard**: Real-time overview with properties count, blog posts, and visitor statistics
- **Properties**: Add, edit, and manage property listings with photos and amenities
- **Blog**: Create and publish blog posts with rich text and images
- **Settings**: Update site configuration, contact details, images, and FAQs

## API Endpoints

The application provides RESTful API endpoints for all data operations:

- `/api/properties` - Get all properties
- `/api/properties/[slug]` - Get specific property
- `/api/blog` - Get all blog posts
- `/api/blog/[slug]` - Get specific blog post
- `/api/settings` - Get/update site settings
- `/api/health/database` - Check database connectivity

## Contact Information

- **Facebook**: [facebook.com/cozycondoiloilocity](https://www.facebook.com/cozycondoiloilocity)
- **Messenger**: [m.me/cozycondoiloilocity](https://m.me/cozycondoiloilocity)
- **Phone**: +63 977 887 0724
- **Email**: admin@cozycondo.net

## Deployment with Dokploy

### Method 1: GitHub Integration

1. Push code to GitHub
2. In Dokploy, create new application
3. Connect to your GitHub repo
4. Set build command: `npm run build`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy

### Method 2: Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_SITE_URL=https://cozycondo.net
ADMIN_PASSWORD=your_secure_password
```

## Design System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Sand 50-900 | #fefdfb → #5f4a38 | Primary neutral tones |
| Ocean 500-700 | #14b8a6 → #0f766e | Primary accent (teal) |
| Coral 400-500 | #fb923c → #f97316 | Secondary accent (orange) |

### Typography

- **Display Font**: Playfair Display (headers, titles)
- **Body Font**: Outfit (body text, UI elements)

## Adding Real Photos

1. Upload photos to Supabase Storage (`property-photos` bucket)
2. Get the public URL
3. Update the property in Admin → Properties
4. Add photos with alt text

## Customization

### Changing Colors

Edit `tailwind.config.ts` to modify the color palette.

### Adding New Amenities

Edit `src/lib/types.ts` to add amenity icons:

```typescript
export const amenityIcons: Record<string, string> = {
  'wifi': 'Wifi',
  'your-amenity': 'IconName',
};
```

## Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues

1. Check Supabase URL and keys in `.env.local`
2. Verify RLS policies are set up correctly
3. Check network connectivity to Supabase

## License

Private - Cozy Condo © 2024

---

Built with ❤️ for Cozy Condo Iloilo City
