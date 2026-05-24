import { useState, useEffect } from 'react';
import staticConfig from '../../../config/admin.json';

const AUTO_GENERATED_FIELDS = ['id', 'created_at', 'updated_at', 'gallery_id'];

export default function AdminGallery() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableName, setTableName] = useState('gallery');
  const [config, setConfig] = useState(staticConfig.admin.gallery || {});
  const actions = config.actions || { edit_icon: "✏️", delete_icon: "🗑️", separator: "|" };
  const [isEditable, setIsEditable] = useState(false);
  const [showRefresh, setShowRefresh] = useState(true);
  const [refreshBtn, setRefreshBtn] = useState('🔄 Refresh');
  const [loadingBtn, setLoadingBtn] = useState('🔄 Loading...');
  const [sortEnabled, setSortEnabled] = useState(false);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      // Load fresh config
      try {
        const configRes = await fetch('/api/config', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (configRes.ok) {
          const freshConfig = await configRes.json();
          const tab = freshConfig.admin?.tabs?.find(t => t.id === 'gallery');
          setTableName(tab?.table || 'gallery');
          setConfig(freshConfig.admin?.gallery || {});
          setIsEditable(tab?.editable !== false);
          setShowRefresh(tab?.showRefresh !== false);
          setSortEnabled(tab?.sort === true);
          if (tab?.actions) {
            setRefreshBtn(tab.actions.refresh || '🔄 Refresh');
            setLoadingBtn(tab.actions.loading || '🔄 Loading...');
          }
        }
      } catch (configErr) {
        console.error('Config load failed:', configErr);
      }

      // Fetch data
      const response = await fetch(`/api/admin/users?table=${tableName}&t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch data');
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  
  const handleEdit = (item) => {
    setEditingItem({ ...item });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const idField = Object.keys(editingItem).find(k => k.endsWith('_id') || k === 'id');
      const itemId = editingItem[idField];
      
      const response = await fetch(`/api/admin/users?table=${tableName}&id=${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingItem)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update item');
      }

      setShowModal(false);
      setEditingItem(null);
      await fetchData();
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const idField = Object.keys(item).find(k => k.endsWith('_id') || k === 'id');
    const itemId = item[idField];
    const displayName = item.name || item.title || item.email || itemId;
    
    if (!confirm(`Are you sure you want to delete "${displayName}"?`)) {
      return;
    }
    
    try {
      setDeleting(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/users?table=${tableName}&id=${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }

      await fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditingItem({ ...editingItem, [field]: value });
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
    if (!sortEnabled || sortColumn !== column) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortEnabled || !sortColumn) return 0;
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const mult = sortDirection === 'asc' ? 1 : -1;
    if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * mult;
    return String(aVal).localeCompare(String(bVal)) * mult;
  });

  const allColumns = data.length > 0 ? Object.keys(data[0]) : [];
  const columns = visibleColumns.length > 0 ? visibleColumns : allColumns;

  useEffect(() => {
    if (data.length > 0 && visibleColumns.length === 0) {
      const cols = Object.keys(data[0]);
      setVisibleColumns(cols.slice(0, Math.min(6, cols.length)));
    }
  }, [data]);

  const toggleColumn = (col) => {
    setVisibleColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
  };

  const selectAllColumns = () => setVisibleColumns(allColumns);
  const selectMinColumns = () => setVisibleColumns(allColumns.slice(0, Math.min(6, allColumns.length)));

  const formatColumnName = (col) => {
    return col.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const headerStyle = (col) => ({
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold',
    cursor: sortEnabled ? 'pointer' : 'default',
    userSelect: 'none',
    color: '#1B1B1B',
    background: sortColumn === col ? '#e8e8e8' : '#f5f5f5'
  });

  return (
    <div className="dashboardContainer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#1B1B1B', flex: 1, minWidth: '150px' }}>{config.title || 'Manage Gallery'}</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
          {allColumns.length > 0 && (
            <div style={{ position: 'relative', display: 'flex' }}>
              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                style={{
                  padding: '10px 16px',
                  background: '#f5f5f5',
                  color: '#1B1B1B',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                📊 Columns ({visibleColumns.length}/{allColumns.length})
              </button>
              {showColumnSelector && (
                <div className="colSelectorDropdown" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '5px',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  minWidth: '220px',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  <div style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', gap: '8px' }}>
                    <button onClick={selectAllColumns} style={{ flex: 1, padding: '6px', fontSize: '0.8rem', background: '#D4AF37', color: '#1B1B1B', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>All</button>
                    <button onClick={selectMinColumns} style={{ flex: 1, padding: '6px', fontSize: '0.8rem', background: '#f5f5f5', color: '#1B1B1B', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>Min</button>
                  </div>
                  {allColumns.map(col => (
                    <label key={col} style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', color: '#1B1B1B' }}>
                      <input type="checkbox" checked={visibleColumns.includes(col)} onChange={() => toggleColumn(col)} style={{ marginRight: '10px' }} />
                      {formatColumnName(col)}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          {showRefresh && (
            <button
              onClick={fetchData}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: '#D4AF37',
                color: '#1B1B1B',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                opacity: loading ? 0.6 : 1,
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = '#C99A2D')}
              onMouseLeave={(e) => !loading && (e.target.style.background = '#D4AF37')}
            >
              {loading ? loadingBtn : refreshBtn}
            </button>
          )}
        </div>
      </div>
      
      <div style={{ marginBottom: '20px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
        <p style={{ margin: 0, fontSize: '0.95rem' }}>📊 Total: <strong>{data.length}</strong> | 📁 Table: <strong>{tableName}</strong></p>
      </div>

      {error && (
        <div style={{ padding: '20px', background: '#fff3f3', border: '2px solid #ff6b6b', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ margin: 0, color: '#d32f2f', fontWeight: 'bold' }}>⚠️ Error</p>
          <p style={{ margin: '10px 0 0 0', color: '#333' }}>{error}</p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          {config.messages?.loading || 'Loading...'}
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="quickActions">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                {columns.map(col => (
                  <th key={col} style={headerStyle(col)} onClick={() => handleSort(col)}>
                    {formatColumnName(col)}{getSortIndicator(col)}
                  </th>
                ))}
                {isEditable && <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1B1B1B', borderBottom: '2px solid #ddd' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, idx) => (
                <tr key={item.gallery_id || idx} style={{ borderBottom: '1px solid #eee' }}>
                  {columns.map(col => (
                    <td key={col} style={{ padding: '12px', color: '#666' }}>
                      {item[col] != null ? String(item[col]) : '-'}
                    </td>
                  ))}
                  {isEditable && (
                    <td style={{ padding: '12px' }}>
                      <button 
                        onClick={() => handleEdit(item)}
                        style={{ 
                          cursor: 'pointer', 
                          background: 'none', 
                          border: 'none',
                          fontSize: '1.1rem',
                          padding: 0
                        }}
                        title="Edit"
                      >
                        {actions.edit_icon}
                      </button>
                      <span style={{ margin: '0 8px', color: '#ccc' }}>{actions.separator}</span>
                      <button 
                        onClick={() => handleDelete(item)}
                        disabled={deleting}
                        style={{ 
                          cursor: deleting ? 'not-allowed' : 'pointer', 
                          background: 'none', 
                          border: 'none',
                          fontSize: '1.1rem',
                          padding: 0,
                          opacity: deleting ? 0.6 : 1
                        }}
                        title="Delete"
                      >
                        {actions.delete_icon}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && data.length === 0 && !error && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666', background: '#f9f9f9', borderRadius: '4px' }}>
          {config.messages?.empty || 'No data found'}
        </div>
      )}
      {/* Edit Modal */}
      {showModal && editingItem && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1B1B1B' }}>✏️ Edit Item</h3>
            
            {/* Show auto-generated fields as read-only */}
            {allColumns.filter(col => AUTO_GENERATED_FIELDS.includes(col.toLowerCase())).length > 0 && (
              <div style={{ 
                marginBottom: '20px', 
                padding: '12px', 
                background: '#f9f9f9', 
                borderRadius: '6px',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                {allColumns.filter(col => AUTO_GENERATED_FIELDS.includes(col.toLowerCase())).map(col => (
                  <span key={col} style={{ marginRight: '20px', display: 'inline-block' }}>
                    <strong>{formatColumnName(col)}:</strong> {editingItem[col] || '-'}
                  </span>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {visibleColumns
                .filter(col => !AUTO_GENERATED_FIELDS.includes(col.toLowerCase()))
                .map(col => {
                  const isTextArea = col === 'description' || col === 'notes' || col === 'comments' || col === 'message' || col === 'bio';
                  const isEmail = col.includes('email');
                  const isNumber = col.includes('price') || col.includes('amount') || col.includes('duration') || col.includes('rating') || col.includes('quantity');
                  const isBoolean = col.includes('is_') || col.includes('active') || col.includes('featured');
                  
                  return (
                    <div key={col}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#1B1B1B' }}>
                        {formatColumnName(col)}
                      </label>
                      {isBoolean ? (
                        <select
                          value={editingItem[col] ? 'true' : 'false'}
                          onChange={(e) => handleInputChange(col, e.target.value === 'true')}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', color: '#1B1B1B' }}
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      ) : isTextArea ? (
                        <textarea
                          value={editingItem[col] || ''}
                          onChange={(e) => handleInputChange(col, e.target.value)}
                          rows={3}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical', color: '#1B1B1B' }}
                        />
                      ) : (
                        <input
                          type={isEmail ? 'email' : isNumber ? 'number' : 'text'}
                          step={isNumber ? '0.01' : undefined}
                          value={editingItem[col] || ''}
                          onChange={(e) => handleInputChange(col, isNumber ? parseFloat(e.target.value) || '' : e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', color: '#1B1B1B' }}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' }}>
              <button
                onClick={() => { setShowModal(false); setEditingItem(null); }}
                style={{
                  padding: '10px 20px',
                  background: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '10px 20px',
                  background: saving ? '#ccc' : '#D4AF37',
                  color: '#1B1B1B',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {saving ? 'Saving...' : '💾 Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
