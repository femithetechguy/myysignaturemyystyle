import { useState, useEffect } from 'react';
import staticConfig from '../../../config/admin.json';
import { colors, text, button, styles as themeStyles, primaryButtonHover } from '../AdminThemeProvider';

export default function AdminUsers({ refreshKey = 0 }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableName, setTableName] = useState('admins');
  const [isEditable, setIsEditable] = useState(false);
  const [showRefresh, setShowRefresh] = useState(true);
  const [refreshBtn, setRefreshBtn] = useState('🔄 Refresh');
  const [loadingBtn, setLoadingBtn] = useState('🔄 Loading...');
  const [sortEnabled, setSortEnabled] = useState(true);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Get UI config from static import (these don't need to be dynamic)
  const usersConfig = staticConfig.admin.users;

  useEffect(() => {
    fetchWithFreshConfig();
  }, []);

  const fetchWithFreshConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      // Step 1: Load fresh config from API
      let currentTableName = 'admins'; // default
      try {
        const configRes = await fetch('/api/config', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (configRes.ok) {
          const freshConfig = await configRes.json();
          const usersTab = freshConfig.admin?.tabs?.find(tab => tab.id === 'users');
          currentTableName = usersTab?.table || 'admins';
          setTableName(currentTableName);
          setIsEditable(usersTab?.editable !== false);
          setShowRefresh(usersTab?.showRefresh !== false);
          setRefreshBtn(usersTab?.refreshBtn || '🔄 Refresh');
          setLoadingBtn(usersTab?.loadingBtn || '🔄 Loading...');
          setSortEnabled(usersTab?.sort === true);
          console.log('Fresh config loaded, table:', currentTableName);
        }
      } catch (configErr) {
        console.error('Config load failed, using default:', configErr);
      }

      // Step 2: Fetch users with the table name
      const url = `/api/admin/users?table=${currentTableName}&t=${Date.now()}`;
      console.log('Fetching users from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || 'Unknown error';
        const hint = errorData.hint ? `\n💡 Hint: ${errorData.hint}` : '';
        throw new Error(`${errorMsg}${hint}`);
      }
      
      const data = await response.json();
      console.log('Fetched users:', data.length);
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (!sortEnabled) return;
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (column) => {
    if (!sortEnabled) return '';
    if (sortColumn !== column) return ' ↕';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortColumn) return 0;
    let aVal = a[sortColumn] ?? '';
    let bVal = b[sortColumn] ?? '';
    if (sortColumn === 'created_at') {
      aVal = new Date(aVal || 0).getTime();
      bVal = new Date(bVal || 0).getTime();
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    const comparison = String(aVal).localeCompare(String(bVal));
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const headerStyle = (column) => ({
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#1B1B1B',
    cursor: sortEnabled ? 'pointer' : 'default',
    userSelect: 'none'
  });

  return (
    <div className="dashboardContainer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#1B1B1B', flex: 1, minWidth: '150px' }}>{usersConfig.title}</h2>
        {showRefresh && (
          <button
            onClick={fetchWithFreshConfig}
            disabled={loading}
            className="refreshBtn"
            style={{
              padding: '10px 20px',
              background: '#D4AF37',
              color: '#1B1B1B',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.6 : 1,
              whiteSpace: 'nowrap',
              minHeight: '44px'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#C99A2D')}
            onMouseLeave={(e) => !loading && (e.target.style.background = '#D4AF37')}
            title="Refresh user data"
          >
            {loading ? loadingBtn : refreshBtn}
          </button>
        )}
      </div>
      
      <div className="info" style={{ marginBottom: '30px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
        <p style={{ margin: 0, fontSize: '0.95rem' }}>📊 Total Users: <strong>{users.length}</strong> | 📁 Table: <strong>{tableName}</strong></p>
      </div>

      {error && (
        <div style={{ 
          padding: '20px', 
          background: '#fff3f3', 
          border: '2px solid #ff6b6b', 
          borderRadius: '8px', 
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(255, 107, 107, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <strong style={{ color: '#c00', display: 'block', marginBottom: '8px' }}>Configuration Error</strong>
              <p style={{ margin: 0, color: '#333', whiteSpace: 'pre-wrap' }}>{error}</p>
              <p style={{ margin: '10px 0 0', fontSize: '0.9rem', color: '#666' }}>
                📁 Configured table: <code style={{ background: '#eee', padding: '2px 6px', borderRadius: '3px' }}>{tableName}</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Loading users...
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="quickActions">
          <h3>{usersConfig.title}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={headerStyle('username')} onClick={() => handleSort('username')}>Username{getSortIndicator('username')}</th>
                <th style={headerStyle('email')} onClick={() => handleSort('email')}>Email{getSortIndicator('email')}</th>
                <th style={headerStyle('is_active')} onClick={() => handleSort('is_active')}>Status{getSortIndicator('is_active')}</th>
                <th style={headerStyle('created_at')} onClick={() => handleSort('created_at')}>Created{getSortIndicator('created_at')}</th>
                {isEditable && (
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1B1B1B' }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', color: '#1B1B1B', fontWeight: 'bold' }}>{user.username}</td>
                  <td style={{ padding: '12px', color: '#666' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      background: user.is_active ? '#D4AF37' : '#ccc', 
                      color: '#1B1B1B', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.9rem', 
                      fontWeight: 'bold' 
                    }}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#666', fontSize: '0.9rem' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  {isEditable && (
                    <td style={{ padding: '12px' }}>
                      <button style={{ color: '#D4AF37', cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' }}>{usersConfig.edit_btn}</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && users.length === 0 && !error && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666', background: '#f9f9f9', borderRadius: '4px' }}>
          No users found in the database
        </div>
      )}

      {isEditable && (
        <button className="actionBtn" style={{ marginTop: '30px' }}>
          + {usersConfig.add_btn}
        </button>
      )}
    </div>
  );
}
