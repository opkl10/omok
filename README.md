This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

### Blog CMS with Advanced Post Management
- **Post Themes**: Each post can have a custom theme (color or image) displayed at the top of the page
- **Unique Post Pages**: Access posts via unique identifier at `/post/{uniqueIdentifier}`
- **Post Management**: Create, edit, delete posts with rich text editor
- **Category Management**: Organize posts by categories
- **Media Management**: Upload and manage media files

### Admin Panel
- **User Management**: View, edit, and manage registered users
- **Settings Management**: 
  - Site-wide theme colors (primary and secondary)
  - UI text customization (buttons and labels)
  - 404 page content customization
  - General site settings (name, description, etc.)
- **Posts with Themes**: Assign color or image themes to individual posts
- **Access Control**: Admin-only features protected by role-based authentication

### API Endpoints

#### Post Management
- `GET /api/posts` - List all posts (with pagination)
- `POST /api/posts` - Create new post (with theme support)
- `GET /api/posts/{id}` - Get post by ID
- `PUT /api/posts/{id}` - Update post (with theme support)
- `DELETE /api/posts/{id}` - Delete post
- `GET /api/post/{uniqueIdentifier}` - Get published post by unique identifier

#### Admin APIs
- `GET /api/admin/users` - List all users (admin only)
- `GET /api/admin/users/{id}` - Get user by ID (admin only)
- `PUT /api/admin/users/{id}` - Update user (admin only)
- `DELETE /api/admin/users/{id}` - Delete user (admin only)

#### Settings
- `GET /api/settings` - Get all settings
- `POST /api/settings` - Update settings (admin only)

## Getting Started

### Prerequisites
- Node.js 20+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env`:
```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Generate Prisma client:
```bash
npx prisma generate
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database Schema

### Post Model
- `id`: UUID primary key
- `title`: Post title
- `slug`: URL-friendly slug (unique)
- `content`: Post content (HTML)
- `excerpt`: Short description
- `featuredImage`: Featured image URL
- `status`: Draft or published
- `theme`: Theme color or image URL (optional)
- `themeType`: Type of theme - "color" or "image" (default: "color")
- `uniqueIdentifier`: Unique identifier for public post URL (unique)
- `publishedAt`: Publication date
- `categoryId`: Category reference
- `authorId`: User reference

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Notes

This application requires a running PostgreSQL database. The build process may fail without database access as some pages are statically generated and require database queries.
