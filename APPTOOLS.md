# APPTOOLS.md - Full-Stack App Technical Guide

Technical documentation for the dual-architecture Next.js application with App Router frontend and Pages Router admin panel.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Configuration](#frontend-configuration)
3. [Admin Configuration System](#admin-configuration-system)
4. [Theme System](#theme-system)
5. [Font Configuration](#font-configuration)
6. [Database Table Mapping](#database-table-mapping)
7. [Admin Panel](#admin-panel)
8. [API Routes](#api-routes)
9. [Authentication](#authentication)
10. [Database Integration](#database-integration)
11. [Adding New Features](#adding-new-features)

---

## Architecture Overview

### Design Philosophy

This application uses **dual routing architecture** to separate concerns:

**Frontend (App Router):**
- `src/app/` - Customer-facing pages using React Server Components
- `app.json` - Frontend content configuration
- `src/lib/config.ts` - Config reader utilities

**Admin Panel (Pages Router):**
- `pages/admin/` - Admin dashboard and login
- `config/admin.json` - Controls admin structure, tabs, and database mappings
- `pages/api/admin/` - Protected API routes for CRUD operations

```
┌─────────────────────────────────────────────────┐
│         Next.js 14 Application                  │
├─────────────────────┬───────────────────────────┤
│   App Router (/)    │  Pages Router (/admin)    │
├─────────────────────┼───────────────────────────┤
│ src/app/page.tsx    │  pages/admin/index.js     │
│ app.json config     │  config/admin.json        │
│ Frontend content    │  Database management      │
└─────────────────────┴───────────────────────────┘
```

### Why Dual Routers?

| Aspect | App Router (Frontend) | Pages Router (Admin) |
|--------|----------------------|---------------------|
| **Purpose** | Customer-facing pages | Internal admin dashboard |
| **Rendering** | React Server Components | Client-side React |
| **Config** | `app.json` | `config/admin.json` |
| **Auth** | Public access | JWT-protected |
| **Data** | Static/config-based | Database CRUD |

### Technology Stack

- **Next.js 14.2** - Dual router support (App + Pages)
- **TypeScript** - Type-safe frontend code
- **PostgreSQL** - Database (via `pg` package)
- **JWT** - Authentication tokens (`jsonwebtoken`)
- **Tailwind CSS** - Styling for both frontend and admin
- **React Icons** - Icon library

---

## Frontend Configuration

### app.json Structure

The frontend is driven by `app.json`:

```json
{
  "business": {
    "name": "Business Name",
    "address": "123 Main St",
    "phone": "555-1234",
    "email": "info@business.com"
  },
  "services": {
    "default_services": [...]
  },
  "content": {
    "gallery": {...}
  },
  "branding": {
    "colors": {
      "primary": "#1B1B1B",
      "secondary": "#D4AF37"
    }
  }
}
```

### Config Reader: `src/lib/config.ts`

```typescript
import appConfig from '../../app.json'

export const getAppConfig = () => appConfig
export const getBusinessInfo = () => appConfig.business
export const getServices = () => appConfig.services.default_services
export const getBranding = () => appConfig.branding
export const getGallery = () => appConfig.content.gallery
```

### Using Config in Frontend

```tsx
// src/app/page.tsx
import { getAppConfig, getServices } from '@/lib/config'

export default function Home() {
  const appConfig = getAppConfig()
  const services = getServices()
  
  return (
    <div>
      <h1>{appConfig.business.name}</h1>
      {services.map(service => (
        <div key={service.id}>{service.name}</div>
      ))}
    </div>
  )
}
```

---

## Admin Configuration System

### config/admin.json Structure

```json
{
  "app": {
    "name": "Company Name",
    "description": "Admin panel for managing application data",
    "colors": {
      "primary": "#1B1B1B",
      "secondary": "#D4AF37",
      "accent": "#C99A2D"
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
  "adminLogin": {
    "title": "Admin Panel",
    "icon": "🛡️",
    "subtitle": "Company Name"
  },
  "admin": {
    "tabs": [...],
    "dashboard": {...},
    "products": {...},
    "customers": {...},
    "orders": {...},
    "theme": {...}
  }
}
```

### Tab Configuration

Each tab in `admin.tabs` defines:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier |
| `label` | string | Display name in sidebar |
| `icon` | string | Emoji or icon |
| `component` | string | React component name |
| `table` | string | Database table name |
| `editable` | boolean | Allow edit/delete operations |
| `showRefresh` | boolean | Show refresh button |
| `sort` | boolean | Enable column sorting |

Example:
```json
{
  "id": "products",
  "label": "Products",
  "icon": "⚙️",
  "component": "AdminProducts",
  "table": "products",
  "editable": true,
  "showRefresh": true,
  "refreshBtn": "🔄 Refresh",
  "loadingBtn": "🔄 Loading...",
  "sort": true,
  "description": "Manage product catalog"
}
```

### Using Admin Config in Components

```javascript
import config from '../../../config/admin.json';

// Or use the hook
import { useAdminConfig } from '../../../hooks/useAdminConfig';

function MyComponent() {
  const adminConfig = useAdminConfig();
  const tabs = adminConfig.admin.tabs;
  // ...
}
```

---

## Theme System

### Overview

The admin panel uses **runtime CSS variable injection** via `AdminThemeProvider`. All theme values in `admin.json` are converted to CSS variables and injected into `:root`, allowing complete UI customization without code changes.

### AdminThemeProvider Component

Located at `components/admin/AdminThemeProvider.js`:

```javascript
// Wraps admin pages in _app.js
import AdminThemeProvider from '../components/admin/AdminThemeProvider';

function MyApp({ Component, pageProps }) {
  const isAdminPage = router.pathname.startsWith('/admin');
  
  if (isAdminPage) {
    return (
      <AdminThemeProvider>
        <Component {...pageProps} />
      </AdminThemeProvider>
    );
  }
  return <Component {...pageProps} />;
}
```

### Theme Configuration Structure

Full theme configuration in `config/admin.json`:

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

### CSS Variable Naming Convention

Theme values are converted to CSS variables using this pattern:

| Config Path | CSS Variable |
|-------------|--------------|
| `theme.colors.primary` | `--color-primary` |
| `theme.text.secondary` | `--text-secondary` |
| `theme.sidebar.background` | `--sidebar-background` |
| `theme.button.primaryBg` | `--button-primaryBg` |

### Using Theme Variables in CSS

In `styles/admin.css`:

```css
/* Sidebar uses theme variables */
.admin-sidebar {
  background-color: var(--sidebar-background);
  color: var(--sidebar-text);
}

.admin-sidebar li.active {
  color: var(--sidebar-activeText);
}

/* Buttons use theme variables */
.admin-btn-primary {
  background-color: var(--button-primaryBg);
  color: var(--button-primaryText);
}

.admin-btn-primary:hover {
  background-color: var(--button-primaryHover);
}
```

### Accessing Theme in JavaScript

```javascript
import { colors, text, button, sidebar } from '../AdminThemeProvider';

// Use exported theme objects
const primaryColor = colors.primary;
const buttonBg = button.primaryBg;
```

---

## Font Configuration

### Overview

Fonts are configured in `app.fonts` and loaded dynamically from Google Fonts at runtime.

### Font Configuration Structure

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

### Font Properties

| Property | Description | Example |
|----------|-------------|---------|
| `primary` | Main body font | `"Source Sans Pro"` |
| `heading` | Font for h1-h6 headings | `"Playfair Display"` |
| `googleFonts` | Array of Google Font specs to load | `["Nunito:wght@400;600;700"]` |

### Google Font Spec Format

```
FontName:wght@weight1;weight2;weight3
```

Examples:
- `"Roboto:wght@400;700"` - Roboto regular and bold
- `"Open+Sans:wght@300;400;600;700"` - Open Sans with 4 weights
- `"Playfair+Display:ital,wght@0,700;1,700"` - Playfair with italic

### How Fonts Load

1. `AdminThemeProvider` reads `app.fonts.googleFonts` from config
2. Constructs Google Fonts URL with all specified fonts
3. Injects `<link>` tag into document head on mount
4. Sets CSS variables `--font-primary` and `--font-heading`

```javascript
// In AdminThemeProvider.js
useEffect(() => {
  const googleFonts = config.app?.fonts?.googleFonts || [];
  if (googleFonts.length > 0) {
    const fontUrl = `https://fonts.googleapis.com/css2?${googleFonts.map(f => `family=${f}`).join('&')}&display=swap`;
    
    const link = document.createElement('link');
    link.href = fontUrl;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
}, []);
```

### Changing Fonts

1. Find font on [fonts.google.com](https://fonts.google.com)
2. Add to `googleFonts` array with desired weights
3. Update `primary` or `heading` to the font name
4. Refresh the page - fonts load automatically

---

## Database Table Mapping

### Overview

The `database.tables` config maps **logical table names** to **actual database table names**. This allows the admin panel to work with any database schema without code changes.

### Configuration

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

### How It Works

Each API route uses `getTableMapping()` to resolve the actual table name:

```javascript
// In pages/api/admin/products.js

async function getTableMapping(tableKey) {
  const configPath = path.join(process.cwd(), 'config', 'admin.json');
  const fileContent = await fs.readFile(configPath, 'utf-8');
  const config = JSON.parse(fileContent);
  
  // Return mapped name or fallback to key itself
  return config.database?.tables?.[tableKey] || tableKey;
}

export default async function handler(req, res) {
  // Get the actual database table name
  const tableKey = req.query.table || 'products';
  const actualTableName = await getTableMapping(tableKey);
  
  // Query uses actual database table name
  const result = await pool.query(`SELECT * FROM ${actualTableName}`);
}
```

### Use Cases

| Scenario | Config | Result |
|----------|--------|--------|
| Table names match | `"products": "products"` | Uses `products` table |
| Different table name | `"products": "inventory_items"` | Uses `inventory_items` table |
| Legacy database | `"customers": "tbl_cust_master"` | Uses `tbl_cust_master` table |

### Security Note

Table names are validated against the config whitelist before execution. Only tables defined in `database.tables` can be queried.

---

## Admin Panel

### File Structure

```
components/admin/
├── AdminLayout.js          # Main layout with sidebar
└── tabs/
    ├── AdminDashboard.js   # Overview stats
    ├── AdminProducts.js    # Products CRUD
    ├── AdminCustomers.js   # Customers CRUD
    ├── AdminOrders.js      # Orders CRUD
    └── AdminUsers.js       # Admin users management
```

### AdminLayout.js - Dynamic Tab System

The core component that renders tabs dynamically:

```javascript
// TAB_COMPONENTS maps config component names to actual components
const TAB_COMPONENTS = {
  AdminDashboard,
  AdminProducts,
  AdminCustomers,
  AdminOrders,
  AdminUsers,
  // Add new components here
};

// Renders the active tab component
const ActiveComponent = TAB_COMPONENTS[activeTab.component];
return <ActiveComponent />;
```

### Column Selector Feature

Admin tables support showing/hiding columns:

```javascript
const [visibleColumns, setVisibleColumns] = useState([
  'id', 'name', 'email', 'status', 'created_at'
]);

// Toggle column visibility
const toggleColumn = (col) => {
  setVisibleColumns(prev => 
    prev.includes(col) 
      ? prev.filter(c => c !== col)
      : [...prev, col]
  );
};
```

---

## API Routes

### Endpoint Pattern

All admin API routes follow a similar pattern:

```javascript
// pages/api/admin/[resource].js

import { verifyAdminRequest } from '../../../lib/jwtMiddleware';
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Read allowed tables from config
async function getAllowedTables() {
  const configPath = path.join(process.cwd(), 'config', 'admin.json');
  const fileContent = await fs.readFile(configPath, 'utf-8');
  const config = JSON.parse(fileContent);
  return config.admin?.tabs?.map(tab => tab.table).filter(Boolean) || [];
}

export default async function handler(req, res) {
  // 1. Verify authentication
  const adminVerification = verifyAdminRequest(req);
  if (!adminVerification.valid) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // 2. Validate table name from config
  const table = req.query.table;
  const allowedTables = await getAllowedTables();
  if (!allowedTables.includes(table)) {
    return res.status(400).json({ message: 'Invalid table' });
  }

  // 3. Handle CRUD operations
  switch (req.method) {
    case 'GET':
      // Fetch records
    case 'POST':
      // Create record
    case 'PUT':
      // Update record
    case 'DELETE':
      // Delete record
  }
}
```

### Available Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/admin/login` | POST | Authenticate admin |
| `/api/admin/products` | GET, POST, PUT, DELETE | Products CRUD |
| `/api/admin/customers` | GET, PUT, DELETE | Customers CRUD |
| `/api/admin/orders` | GET, PUT, DELETE | Orders CRUD |
| `/api/admin/users` | GET | List admin users |
| `/api/config` | GET, PUT | Read/write admin config |
| `/api/health` | GET | Health check |

---

## Authentication

### JWT Flow

1. Admin logs in via `/api/admin/login`
2. Server validates credentials against `admins` table
3. JWT token generated and returned
4. Client stores token in `localStorage`
5. All API requests include token in `Authorization` header

### Token Verification

```javascript
// lib/jwtMiddleware.js

import jwt from 'jsonwebtoken';

export function verifyAdminRequest(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return { valid: false, message: 'No token provided' };
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, admin: decoded };
  } catch (error) {
    return { valid: false, message: 'Invalid token' };
  }
}
```

### Protected Client Routes

```javascript
// pages/admin/index.js

useEffect(() => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    router.push('/admin/login');
  } else {
    setIsAuthorized(true);
  }
}, []);
```

---

## Database Integration

### Connection Setup

```javascript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

### Table Existence Check

All API routes verify the table exists before querying:

```javascript
const tableExistsQuery = `
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  );
`;
const result = await pool.query(tableExistsQuery, [tableName]);
if (!result.rows[0].exists) {
  return res.status(404).json({ error: 'Table does not exist' });
}
```

### Dynamic Column Detection

Tables render columns dynamically based on data:

```javascript
// Get column names from first row
const columns = data.length > 0 ? Object.keys(data[0]) : [];

// Render table headers
columns.filter(col => visibleColumns.includes(col)).map(col => (
  <th key={col}>{formatColumnName(col)}</th>
))
```

---

## Adding New Features

### Adding a New Admin Tab

1. **Update config/admin.json**:
```json
{
  "id": "reports",
  "label": "Reports",
  "icon": "📈",
  "component": "AdminReports",
  "table": "reports",
  "editable": false,
  "showRefresh": true
}
```

2. **Create component** (`components/admin/tabs/AdminReports.js`):
```javascript
import { useState, useEffect } from 'react';
import staticConfig from '../../../config/admin.json';

export default function AdminReports() {
  const [data, setData] = useState([]);
  const reportsConfig = staticConfig.admin.reports;
  
  // Fetch data, render table...
}
```

3. **Register in AdminLayout.js**:
```javascript
import AdminReports from './tabs/AdminReports';

const TAB_COMPONENTS = {
  // existing...
  AdminReports,
};
```

4. **Create API route** (if needed):
```javascript
// pages/api/admin/reports.js
// Follow existing pattern
```

### Adding a New API Endpoint

1. Create file in `pages/api/admin/`
2. Import and use `verifyAdminRequest` for auth
3. Read config from `admin.json` for table validation
4. Implement CRUD operations

---

## Environment Variables

Required in `.env.local`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Authentication
JWT_SECRET=your-secure-secret-key-minimum-32-characters

# Optional
NODE_ENV=development
```

---

## Deployment Notes

### Vercel

- Set environment variables in Vercel dashboard
- PostgreSQL should be externally hosted (Supabase, Neon, etc.)

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

### Database Migrations

Run SQL scripts in `dbqueries/` folder to create required tables.
