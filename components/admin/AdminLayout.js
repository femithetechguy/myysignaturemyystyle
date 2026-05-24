import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminDashboard from './tabs/AdminDashboard';
import AdminPages from './tabs/AdminPages';
import AdminSettings from './tabs/AdminSettings';
import AdminUsers from './tabs/AdminUsers';
import AdminProducts from './tabs/AdminProducts';
import AdminCustomers from './tabs/AdminCustomers';
import AdminServices from './tabs/AdminServices';
import AdminAppointments from './tabs/AdminAppointments';
import AdminStaff from './tabs/AdminStaff';
import AdminApplications from './tabs/AdminApplications';
import AdminReviews from './tabs/AdminReviews';
import AdminGallery from './tabs/AdminGallery';
import AdminContacts from './tabs/AdminContacts';
import AdminPolicies from './tabs/AdminPolicies';
import staticConfig from '../../config/admin.json';
import { colors, button, sidebar, fonts } from './AdminThemeProvider';

// Helper to convert hex to RGB values for rgba()
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '212, 175, 55'; // fallback
}

/**
 * DYNAMIC TABS SYSTEM
 * 
 * To add/remove/modify tabs:
 * 1. Edit the tabs array in config/admin.json under "admin.tabs"
 * 2. Each tab requires:
 *    - id: unique identifier
 *    - label: display name
 *    - icon: emoji or icon
 *    - component: React component name (must match TAB_COMPONENTS key)
 *    - table: database table this tab references
 *    - description: brief description
 * 
 * 3. For new tabs, create component file and add to TAB_COMPONENTS below
 * 4. Tab will automatically appear in sidebar navigation
 * 
 * Example new tab in config:
 * {
 *   "id": "products",
 *   "label": "Products",
 *   "icon": "🛍️",
 *   "component": "AdminProducts",
 *   "table": "products",
 *   "description": "Manage product catalog"
 * }
 */

// Component map - add new components here as you create them
const TAB_COMPONENTS = {
  AdminDashboard,
  AdminPages,
  AdminSettings,
  AdminUsers,
  AdminProducts,
  AdminCustomers,
  AdminServices,
  AdminAppointments,
  AdminStaff,
  AdminApplications,
  AdminReviews,
  AdminGallery,
  AdminContacts,
  AdminPolicies,
};

export default function AdminLayout() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarClosed, setSidebarClosed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [config, setConfig] = useState(staticConfig);
  
  // Load fresh config on mount to pick up any JSON file changes
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      fetch('/api/config', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.admin?.tabs) {
            setConfig(data);
          }
        })
        .catch(err => console.error('Failed to load config:', err));
    }
  }, []);

  // Read tab from URL on initial load and when URL changes
  useEffect(() => {
    if (router.isReady) {
      const tabFromUrl = router.query.tab;
      if (tabFromUrl && tabs.some(t => t.id === tabFromUrl)) {
        setActiveTab(tabFromUrl);
      }
    }
  }, [router.isReady, router.query.tab]);

  // Update URL when tab changes (without full page reload)
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    router.push(`/admin?tab=${tabId}`, undefined, { shallow: true });
    setMobileMenuOpen(false);
  };
  
  // Dynamically load tabs from config
  const tabs = config.admin.tabs;

  const activeTabConfig = tabs.find((tab) => tab.id === activeTab);
  const ComponentToRender = TAB_COMPONENTS[activeTabConfig?.component];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
  };

  return (
    <div className="adminContainer">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarClosed ? 'closed' : ''}`}>
        <div className="sidebarHeader">
          <h2 className="logo">{config.app.name}</h2>
          <button
            className="hamburgerBtn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
          <button
            className="toggleBtn"
            onClick={() => setSidebarClosed(!sidebarClosed)}
            title={sidebarClosed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{
              fontSize: '1.5rem',
              padding: '10px 14px',
              background: `rgba(${hexToRgb(colors.secondary)}, 0.3)`,
              color: colors.secondary,
              border: `2px solid rgba(${hexToRgb(colors.secondary)}, 0.5)`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: 'bold'
            }}
          >
            {sidebarClosed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`navItem ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="icon">{tab.icon}</span>
              <span className="label">{tab.label}</span>
            </button>
          ))}
          {/* Logout — only visible in mobile dropdown */}
          <button onClick={handleLogout} className="navItem logoutNavItem">
            <span className="icon">🔒</span>
            <span className="label">Logout</span>
          </button>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="logoutBtn"
          title="Logout"
          style={{
            margin: '20px 10px 0',
            width: 'calc(100% - 20px)',
            padding: '12px 15px',
            background: `linear-gradient(135deg, ${button.primaryBg} 0%, ${button.primaryHover} 100%)`,
            color: button.primaryText,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            fontFamily: "'Nunito', sans-serif",
            transition: 'all 0.3s ease',
            boxShadow: `0 2px 8px rgba(${hexToRgb(button.primaryBg)}, 0.3)`
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = `0 4px 15px rgba(${hexToRgb(button.primaryBg)}, 0.5)`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = `0 2px 8px rgba(${hexToRgb(button.primaryBg)}, 0.3)`;
          }}
        >
          🔒 {!sidebarClosed && 'Logout'}
        </button>
      </aside>

      {/* Main Content */}
      <div className={`mainContent ${sidebarClosed ? 'sidebar-closed' : ''}`}>
        {/* Header */}
        <div className="header">
          <h1>{config.app.name} - {config.admin.header.admin_suffix}</h1>
        </div>

        {/* Tab Description */}
        {activeTabConfig && (
          <div className="info">
            <p><strong>{activeTabConfig.label}</strong> - {activeTabConfig.description}</p>
          </div>
        )}

        {/* Tab Content */}
        <div className="content">
          {ComponentToRender && activeTab === 'dashboard' ? (
            <ComponentToRender onNavigate={handleTabChange} />
          ) : ComponentToRender ? (
            <ComponentToRender />
          ) : null}
        </div>
      </div>
    </div>
  );
}
