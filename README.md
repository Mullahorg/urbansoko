# Male Afrique E-Commerce Platform

A modern, full-featured e-commerce platform for African fashion built with React, TypeScript, and Supabase. This platform offers a complete shopping experience with multi-language support, dynamic theming, vendor management, gamification features, and comprehensive admin controls.

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

### Gamification Features
- **Welcome Popup**: First-time visitor discount popup with confetti
- **Flash Sale Banner**: Animated countdown sale banner with real products
- **Social Proof Toasts**: "X just purchased..." notifications
- **Product Badges**: NEW, HOT, SALE, TRENDING, LOW STOCK badges
- **Floating Cart Button**: Mobile floating cart with total
- **Scroll to Top**: Smooth scroll button
- **Confetti Animations**: On add-to-cart and purchase

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
- **Content Management**: Edit hero section, features, testimonials, and footer
- **Gamification Settings**: Control all gamification features
- **Custom CSS**: Apply custom styling through admin panel
- **Newsletter Management**: Manage subscribers with export functionality
- **Payment Settings**: Configure M-Pesa details

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, Auth, Storage, Edge Functions)
- **State Management**: React Context API, TanStack Query
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Animations**: Framer Motion, Canvas Confetti
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or bun
- Supabase account (for backend services)

---

## 🚀 Self-Hosting Guide (Complete Independence from Lovable)

This section provides complete instructions for hosting this application on your own infrastructure without any dependency on Lovable's services.

### Step 1: Export Your Code

1. Connect your Lovable project to GitHub (if not already done)
2. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

### Step 2: Set Up Your Own Supabase Project

1. Create a new project at [supabase.com](https://supabase.com)
2. Note down your project credentials:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: Found in Project Settings > API
   - **Service Role Key**: Found in Project Settings > API (keep this secret!)

### Step 3: Run Database Migrations

Navigate to your Supabase SQL Editor and run the migrations in order:

1. Go to the `supabase/migrations/` directory in your code
2. Run each `.sql` file in chronological order (sorted by timestamp)

Or use the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your_project_id

# Push migrations
supabase db push
```

### Step 4: Configure Storage Buckets

Create these storage buckets in Supabase Dashboard > Storage:

1. **product-images** (Public)
   - Go to Policies and add: "Allow public access for viewing"
   
2. **transaction-screenshots** (Public or Authenticated)
   - Add appropriate policies for uploads

### Step 5: Configure Authentication

In Supabase Dashboard > Authentication > Settings:

1. Enable Email provider
2. **For Production**: Disable "Enable email confirmations" or set up proper SMTP
3. **For Development**: Enable "Confirm email" auto-confirm

### Step 6: Set Up Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Step 7: Update Supabase Client

The `src/integrations/supabase/client.ts` file should automatically use these environment variables. Verify it looks like:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Step 8: Deploy Edge Functions (If Needed)

If you use edge functions for M-Pesa or email:

```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy mpesa-stk-push

# Set secrets for edge functions
supabase secrets set MPESA_CONSUMER_KEY=your_key
supabase secrets set MPESA_CONSUMER_SECRET=your_secret
```

### Step 9: Create Admin Account

After migrations are complete:

1. Sign up through your app's auth page
2. Run this SQL in Supabase SQL Editor:

```sql
-- Get your user ID first
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then assign admin role (replace YOUR_USER_ID)
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin');
```

---

## 📦 Deployment Options

### Option A: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
4. Deploy

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Option B: Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and import your repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables in Netlify dashboard
6. Deploy

```bash
# Or use Netlify CLI
npm i -g netlify-cli
netlify deploy --prod
```

### Option C: Cloudflare Pages

1. Push your code to GitHub
2. Go to Cloudflare Pages and connect your repository
3. Set:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add environment variables
5. Deploy

### Option D: Docker (Self-Hosted VPS)

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build with environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

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

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Build and run:

```bash
# Build image
docker build \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key \
  --build-arg VITE_SUPABASE_PROJECT_ID=your_project_id \
  -t male-afrique .

# Run container
docker run -d -p 80:80 --name male-afrique male-afrique
```

### Option E: Docker Compose (with SSL)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      args:
        - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
        - VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
        - VITE_SUPABASE_PROJECT_ID=${VITE_SUPABASE_PROJECT_ID}
    restart: unless-stopped
    networks:
      - web

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - web
    depends_on:
      - app

networks:
  web:

volumes:
  caddy_data:
  caddy_config:
```

Create `Caddyfile`:

```
yourdomain.com {
    reverse_proxy app:80
}
```

Run:

```bash
docker-compose up -d
```

---

## 🔐 Security Best Practices

### Environment Variables
- Never commit `.env` files to git
- Use different keys for development and production
- Rotate keys periodically

### Supabase RLS Policies
All tables have Row Level Security enabled. Verify policies:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View policies
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### API Security
- Use the anon key only on the client
- Keep the service_role key secret (server-side only)
- Implement rate limiting on your hosting provider

---

## 📊 Initial Setup Checklist

After deployment, complete this checklist in the admin panel:

- [ ] Configure M-Pesa payment settings (Admin > Payment Settings)
- [ ] Create product categories (Admin > Categories)
- [ ] Import or add initial products (Admin > Products)
- [ ] Customize site content (Admin > Content)
- [ ] Configure gamification settings (Admin > Gamification)
- [ ] Set up flash sales if needed
- [ ] Add language packs (Admin > Languages)
- [ ] Test complete order flow

---

## 🎨 Customization

### Theming

Edit these files for theme customization:
- `src/index.css` - CSS variables for colors
- `tailwind.config.ts` - Tailwind theme configuration
- Admin Panel > Content > Custom Styles - Runtime CSS

### Color Schemes

Three built-in schemes:
1. **Classic Gold**: Purple/blue primary with coral accents
2. **Forest Green**: Nature-inspired green tones
3. **African Heritage**: Green, gold, and orange Pan-African colors

---

## 🧪 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type checking
npx tsc --noEmit

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🐛 Troubleshooting

### Build Errors
```bash
rm -rf node_modules dist .vite
npm install
npm run build
```

### Database Connection Issues
1. Verify Supabase URL and keys in `.env`
2. Check RLS policies aren't blocking access
3. Ensure migrations have run successfully

### Authentication Problems
1. Verify email provider is enabled in Supabase
2. Check auto-confirm settings
3. Review user_roles table for proper role assignment

### Edge Functions Not Working
1. Check function logs in Supabase Dashboard
2. Verify all secrets are set
3. Ensure CORS headers are configured

---

## 📄 License

[Your License Here]

## 🤝 Contributing

[Your Contributing Guidelines]

## 📞 Support

[Your Support Information]

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Tailwind CSS](https://tailwindcss.com) - Styling framework
- [Lucide](https://lucide.dev) - Icons
- [Framer Motion](https://www.framer.com/motion/) - Animations
