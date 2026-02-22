# Full-Stack Next.js App - Frontend + Admin Panel

A production-ready Next.js application with **dual routing architecture**: App Router for the frontend and Pages Router for the admin panel. Both systems are fully configurable via JSON files.

## 🏗️ Architecture

| Route | Router | Config | Purpose |
|-------|--------|--------|---------|  
| `localhost:3000/` | App Router | `app.json` | **Frontend** - Customer-facing website |
| `localhost:3000/admin` | Pages Router | `config/admin.json` | **Admin Panel** - Database management |

**Key Innovation:** App Router and Pages Router coexist in the same Next.js app, each serving different purposes with independent configurations.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set environment (copy example and update)
cp .env.example .env.local

# Run development server
npm run dev

# Open frontend: http://localhost:3000
# Open admin panel: http://localhost:3000/admin
```

## ✨ Key Features

### � Frontend (App Router - `/`)
- **TypeScript + React Server Components**: Modern Next.js 14 App Router
- **Configuration-Driven**: `app.json` for all content and settings
- **Dynamic Content**: Services, gallery, staff, booking system
- **Responsive Design**: Mobile-first Tailwind CSS styling
- **Image Optimization**: Next.js Image component with lazy loading

### 🎛️ Admin Panel (Pages Router - `/admin`)
- **Single Config File**: `config/admin.json` controls all admin functionality
- **Runtime Theme Injection**: Complete UI customization via CSS variables
- **Dynamic Fonts**: Google Fonts loaded from config at runtime
- **Database Table Mapping**: Map logical names to actual DB tables
- **Dynamic Tabs**: Add/remove admin tabs via config array
- **Column Visibility**: Users can select which columns to display
- **CRUD Operations**: Built-in create, read, update, delete for all tables

### 🔐 Built-In Authentication
- **JWT Tokens**: Secure token-based admin access (7-day expiry)
- **Protected Routes**: All admin APIs require authentication
- **Auto Token Validation**: Redirects to login on token expiry
- **Session Management**: Client-side localStorage token storage

### 📊 Admin Dashboard Features
- **Products Management**: Full CRUD with column selector
- **Customers Management**: Dynamic table rendering
- **Orders Management**: View and manage orders
- **Admin Users**: Manage admin accounts

## 📁 Project Structure

```
starter_app/
├── src/                        # 🎨 FRONTEND (App Router)
│   ├── app/
│   │   ├── page.tsx            # Homepage (localhost:3000)
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Frontend styles
│   ├── components/
│   │   ├── Gallery.tsx         # Gallery component
│   │   └── BookingForm.tsx     # Booking form
│   └── lib/
│       └── config.ts           # Frontend config reader (reads app.json)
├── pages/                      # 🔧 ADMIN PANEL (Pages Router)
│   ├── admin/
│   │   ├── index.js            # Admin dashboard (localhost:3000/admin)
│   │   └── login.js            # Admin login
│   ├── api/
│   │   ├── admin/
│   │   │   ├── login.js        # Authentication endpoint
│   │   │   ├── products.js     # Products CRUD API
│   │   │   ├── customers.js    # Customers CRUD API
│   │   │   ├── orders.js       # Orders CRUD API
│   │   │   └── users.js        # Admin users API
│   │   ├── config.js           # Config read/write API
│   │   └── health.js           # Health check endpoint
│   └── _app.js                 # Wraps admin pages with ThemeProvider
├── components/admin/           # Admin panel components
│   ├── AdminLayout.js          # 🔑 Dynamic tab renderer
│   ├── AdminThemeProvider.js   # 🎨 Runtime theme/font injection
│   └── tabs/
│       ├── AdminDashboard.js
│       ├── AdminProducts.js
│       ├── AdminCustomers.js
│       ├── AdminOrders.js
│       └── AdminUsers.js
├── config/
│   └── admin.json              # 🎛️ Admin panel configuration
├── app.json                    # 🎨 Frontend configuration
├── hooks/
│   ├── useAdminConfig.js       # Access admin configuration
│   ├── useAdminAuth.js         # Admin auth state
│   └── useAdminFonts.js        # Font loading utilities
├── lib/
│   ├── fontUtils.js            # Font helper functions
│   └── jwtMiddleware.js        # JWT utilities
├── styles/
│   ├── globals.css             # Shared styles
│   └── admin.css               # Admin panel styles (uses CSS vars)
├── public/                     # Static assets
│   ├── assets/                 # Frontend images
│   └── favicon.svg
└── dbqueries/                  # SQL scripts for database setup
```

## 🔑 Admin Configuration

### The Admin Config: `config/admin.json`

The admin panel is fully configurable via this single JSON file. It controls:
- **App settings** - Name, colors, fonts
- **Database mapping** - Logical table names to actual DB table names
- **Admin tabs** - Which tabs appear in the sidebar
- **Theme** - Complete UI styling (colors, text, buttons, etc.)

```json
{
  "app": {
    "name": "Company Name",
    "colors": {
      "primary": "#1B1B1B",
      "secondary": "#D4AF37",
      "accent": "#C99A2D"
    },
    "fonts": {
      "primary": "Source Sans Pro",
      "heading": "Source Sans Pro",
      "googleFonts": ["Nunito:wght@400;600;700;800", "Source+Sans+Pro:wght@400;600;700"]
    }
  },
  "database": {
    "tables": {
      "products": "products",
      "customers": "customers", 
      "orders": "orders",
      "admins": "admins"
    }
  },
  "admin": {
    "tabs": [
      {
        "id": "dashboard",
        "label": "Dashboard",
        "icon": "📊",
        "component": "AdminDashboard"
      },
      {
        "id": "products",
        "label": "Products",
        "icon": "⚙️",
        "component": "AdminProducts",
        "table": "products",
        "editable": true,
        "showRefresh": true
      },
      {
        "id": "customers",
        "label": "Customers",
        "icon": "🧑‍💼",
        "component": "AdminCustomers",
        "table": "customers",
        "editable": true
      }
    ]
  }
}
```

### Adding a New Admin Tab

1. **Add tab to config** (`config/admin.json`):
```json
{
  "id": "inventory",
  "label": "Inventory",
  "icon": "📦",
  "component": "AdminInventory",
  "table": "inventory",
  "editable": true,
  "showRefresh": true
}
```

2. **Create component** (`components/admin/tabs/AdminInventory.js`)

3. **Register in AdminLayout.js**:
```javascript
import AdminInventory from './tabs/AdminInventory';

const TAB_COMPONENTS = {
  // ... existing
  AdminInventory,
};
```

### 🎨 Theme Configuration

The `admin.theme` section provides complete UI customization. All values are injected as CSS variables at runtime via `AdminThemeProvider`.

```json
{
  "admin": {
    "theme": {
      "colors": {
        "primary": "#1B1B1B",
        "secondary": "#D4AF37",
        "accent": "#C99A2D",
        "success": "#6B9E7F",
        "error": "#C1666B",
        "warning": "#D4A373"
      },
      "text": {
        "primary": "#1B1B1B",
        "secondary": "#666666",
        "muted": "#999999",
        "light": "#f5f5f5",
        "inverse": "#ffffff"
      },
      "sidebar": {
        "background": "#1B1B1B",
        "text": "#f5f5f5",
        "activeText": "#D4AF37",
        "hoverBg": "rgba(212, 175, 55, 0.1)"
      },
      "table": {
        "headerBg": "#f5f5f5",
        "headerText": "#1B1B1B",
        "border": "#eeeeee",
        "rowHover": "#fafafa"
      },
      "button": {
        "primaryBg": "#D4AF37",
        "primaryText": "#1B1B1B",
        "primaryHover": "#C99A2D",
        "secondaryBg": "#f5f5f5",
        "secondaryText": "#1B1B1B",
        "secondaryBorder": "#ddd"
      },
      "input": {
        "background": "#ffffff",
        "text": "#1B1B1B",
        "border": "#cccccc",
        "focusBorder": "#D4AF37",
        "placeholder": "#999999"
      },
      "modal": {
        "background": "#ffffff",
        "overlay": "rgba(0, 0, 0, 0.5)"
      }
    }
  }
}
```

**How it works:**
- `AdminThemeProvider` reads `admin.theme` from config
- Converts all values to CSS variables (e.g., `--color-primary`, `--sidebar-background`)
- Injects variables into `:root` at runtime
- `admin.css` uses these variables for all styling

### 🔤 Font Configuration

Fonts are configured in `app.fonts` and loaded dynamically from Google Fonts:

```json
{
  "app": {
    "fonts": {
      "primary": "Source Sans Pro",
      "heading": "Source Sans Pro", 
      "googleFonts": [
        "Nunito:wght@400;600;700;800",
        "Playfair+Display:wght@700",
        "Source+Sans+Pro:wght@400;600;700"
      ]
    }
  }
}
```

| Property | Description |
|----------|-------------|
| `primary` | Main body font |
| `heading` | Font for headings |
| `googleFonts` | Array of Google Font specs to load (with weights) |

**Changing fonts:**
1. Update `googleFonts` array with new font(s)
2. Set `primary` and/or `heading` to the new font name
3. Fonts load automatically on page load

### 🗄️ Database Table Mapping

Map logical table names to actual database table names:

```json
{
  "database": {
    "tables": {
      "products": "my_products_table",
      "customers": "customer_accounts",
      "orders": "order_history",
      "admins": "admin_users"
    }
  }
}
```

This allows you to:
- Use existing database tables without renaming
- Switch between different database schemas
- Keep the admin UI independent of actual table names

## 🔐 Admin Access

```
URL: http://localhost:3000/admin/login

Demo Credentials:
- Username: admin
- Password: admin
```

## 🗄️ Database Setup

### Environment Variables (.env.local)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=your-secret-key-here
```

### Required Tables

Create tables using scripts in `dbqueries/`:

```bash
# Products table
psql $DATABASE_URL -f dbqueries/products.sql

# Customers table  
psql $DATABASE_URL -f dbqueries/customers.sql

# Orders table
psql $DATABASE_URL -f dbqueries/orders.sql

# Admins table
psql $DATABASE_URL -f dbqueries/admins.sql
```

## 📡 API Endpoints

### Authentication
- `POST /api/admin/login` - Login and get JWT token

### Data APIs (require auth)
- `GET /api/admin/products?table=products` - Get all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products?id=1` - Update product
- `DELETE /api/admin/products?id=1` - Delete product

Same pattern for `/api/admin/customers`, `/api/admin/orders`, `/api/admin/users`

### Config API
- `GET /api/config` - Read admin config
- `PUT /api/config` - Update admin config

## 🎨 Customizing the Frontend

The frontend (`src/app/`) uses Next.js App Router with TypeScript. Edit `app.json` to customize:

### Frontend Config: `app.json`

```json
{
  "business": {
    "name": "Your Business Name",
    "address": "123 Main St",
    "phone": "555-1234",
    "email": "info@business.com"
  },
  "services": {
    "default_services": [
      {
        "id": "service_001",
        "name": "Haircut",
        "description": "Professional haircut",
        "price": 50,
        "duration": 30
      }
    ]
  },
  "content": {
    "gallery": {
      "items": [...]
    }
  },
  "branding": {
    "colors": {
      "primary": "#1B1B1B",
      "secondary": "#D4AF37"
    }
  }
}
```

The frontend reads from `app.json` via `src/lib/config.ts`:
```typescript
import appConfig from '../../app.json'

export const getAppConfig = () => appConfig
export const getServices = () => appConfig.services.default_services
export const getBranding = () => appConfig.branding
```

### Customizing Frontend Pages

- **Homepage**: Edit `src/app/page.tsx`
- **Layout**: Edit `src/app/layout.tsx`
- **Styles**: Edit `src/app/globals.css`
- **Components**: Add to `src/components/`

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Documentation

- [APPTOOLS.md](./APPTOOLS.md) - Complete technology guide
- [API_DOCS.md](./API_DOCS.md) - API documentation

## License

MIT
