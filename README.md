# Male Afrique E-Commerce Platform

A modern, full-featured e-commerce platform for African fashion built with React, TypeScript, and Supabase. This platform offers a complete shopping experience with multi-language support, dynamic theming, vendor management, and comprehensive admin controls.

## 🌟 Features

### Customer Features
- **Multi-language Support**: English and Swahili
- **Dynamic Theming**: Light/Dark mode with multiple color schemes (Classic Gold, Forest Green, African Heritage)
- **Product Browsing**: Category-based navigation, search, and filtering
- **Shopping Cart**: Full cart management with checkout
- **Wishlist**: Save favorite products
- **Order Tracking**: Track orders with unique tracking codes
- **Rewards Program**: Earn points on purchases (1 point per 100 KES)
- **Product Reviews**: Rate and review purchased products
- **M-Pesa Payment**: Manual verification workflow with transaction screenshots

### Vendor Features
- **Vendor Registration**: Apply to become a vendor
- **Product Management**: Add and manage products
- **Dashboard**: View sales and performance metrics

### Admin Features
- **Complete Dashboard**: Analytics, sales metrics, order management
- **Product Management**: Full CRUD operations with CSV/Excel import
- **Category Management**: Create and manage product categories dynamically
- **User Management**: Role assignment (User, Vendor, Admin)
- **Order Management**: Approve/reject orders with M-Pesa verification
- **Inventory Management**: Track and update stock levels
- **Content Management**: Edit hero section, features, and footer
- **Custom CSS**: Apply custom styling through admin panel
- **Newsletter Management**: Manage subscribers with export functionality
- **Payment Settings**: Configure M-Pesa details

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, Auth, Storage, Edge Functions)
- **State Management**: React Context API
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for backend services)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <project-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

To get these values:
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy the Project URL and anon/public key

### 4. Database Setup

#### Run Migrations

Execute the SQL migrations in your Supabase SQL editor in order:

1. Navigate to `supabase/migrations/` directory
2. Run each migration file in chronological order (sorted by timestamp)

The migrations will create:
- User profiles and roles tables
- Products and categories tables
- Orders and order items tables
- Reviews and wishlist tables
- Vendor management tables
- Rewards system tables
- Settings and content management tables

#### Enable Row Level Security (RLS)

All tables have RLS policies defined in the migrations. Ensure RLS is enabled on all tables through the Supabase dashboard.

#### Configure Storage

Create the following storage buckets in Supabase:
1. `product-images` (public access)

Set up storage policies for secure file uploads.

### 5. Authentication Configuration

In your Supabase dashboard:
1. Go to Authentication > Settings
2. Enable Email provider
3. Configure Email templates (optional)
4. Enable auto-confirm for development (disable in production)

### 6. Edge Functions Setup (Optional)

If you need to deploy edge functions:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your_project_id

# Deploy edge functions
supabase functions deploy
```

### 7. Admin Account Setup

After running migrations, create your first admin account:

1. Sign up through the app
2. In Supabase SQL editor, run:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('your_user_id', 'admin');
```

Get your user_id from the `auth.users` table or `profiles` table.

### 8. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## 📦 Deployment Options

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Add environment variables in Vercel dashboard

### Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `netlify deploy`
3. Follow the prompts
4. Add environment variables in Netlify dashboard

### Self-Hosted (Docker)

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Build and run:

```bash
docker build -t male-afrique .
docker run -p 80:80 male-afrique
```

## 🔐 Security Configuration

### Environment Variables

Never commit `.env` files. Use environment-specific configurations:

- **Development**: `.env.local`
- **Production**: Set via hosting provider dashboard

### Supabase RLS Policies

Review and ensure all RLS policies are properly configured:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### API Keys

Store sensitive keys in Supabase Secrets:

```bash
supabase secrets set SECRET_NAME=value
```

## 📊 Initial Setup Checklist

- [ ] Create Supabase project
- [ ] Set up environment variables
- [ ] Run database migrations
- [ ] Configure authentication
- [ ] Create storage buckets
- [ ] Set up admin account
- [ ] Configure M-Pesa payment settings (Admin > Payment Settings)
- [ ] Create product categories (Admin > Categories)
- [ ] Import initial products (Admin > Products > Import)
- [ ] Customize site content (Admin > Content)
- [ ] Test order flow end-to-end

## 🎨 Customization

### Theming

The app supports dynamic theming through:
- `src/index.css` - CSS variables for colors
- `tailwind.config.ts` - Tailwind theme configuration
- Admin panel - Custom CSS field for on-the-fly styling

### Color Schemes

Three built-in schemes:
1. **Classic Gold** (Default): Purple/blue primary with coral accents
2. **Forest Green**: Nature-inspired green tones
3. **African Heritage**: Green, gold, and orange Pan-African colors

### Custom Styling

Admins can add custom CSS through:
Admin Dashboard > Settings > Custom CSS

## 📱 Features Configuration

### M-Pesa Integration

Configure in Admin > Payment Settings:
- Paybill/Till Number
- Business Name
- Account Number (optional)

Orders require manual verification with transaction screenshots.

### Rewards Program

Automatic calculation: 1 point per 100 KES spent
Configure tiers by modifying the `award_points_on_order()` database function.

### Email Notifications

Edge functions are set up for:
- Order confirmation
- Order status updates

Configure SMTP or use Supabase's email service.

## 🧪 Testing

```bash
# Run tests (if configured)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🐛 Troubleshooting

### Build Errors

1. Clear cache: `rm -rf node_modules dist .vite && npm install`
2. Check Node version: `node -v` (should be 18+)
3. Verify environment variables are set

### Database Connection Issues

1. Verify Supabase URL and keys in `.env`
2. Check RLS policies aren't blocking access
3. Ensure migrations have run successfully

### Authentication Problems

1. Verify email provider is enabled in Supabase
2. Check auto-confirm settings for development
3. Review user_roles table for proper role assignment

## 📄 License

[Your License Here]

## 🤝 Contributing

[Your Contributing Guidelines]

## 📞 Support

[Your Support Information]

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Tailwind CSS](https://tailwindcss.com) - Styling framework
- [Lucide](https://lucide.dev) - Icons
