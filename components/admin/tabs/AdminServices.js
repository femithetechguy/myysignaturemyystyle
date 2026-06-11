import { useState, useEffect } from 'react';
import ColumnSelector from '../ColumnSelector';
import staticConfig from '../../../config/admin.json';

const AUTO_GENERATED_FIELDS = ['id', 'created_at', 'updated_at', 'service_id'];

export default function AdminServices({ refreshKey = 0 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableName, setTableName] = useState('services');
  const [isEditable, setIsEditable] = useState(true);
  const [showRefresh, setShowRefresh] = useState(true);
  const [refreshBtn, setRefreshBtn] = useState('🔄 Refresh');
  const [loadingBtn, setLoadingBtn] = useState('🔄 Loading...');
  const [sortEnabled, setSortEnabled] = useState(true);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const config = staticConfig.admin.services || {};
  const actions = config.actions || { edit_icon: "✏️", delete_icon: "🗑️", separator: "|" };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  useEffect(() => {
    const anyOpen = showModal || !!viewingItem;
    document.body.style.overflow = anyOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal, viewingItem]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      let currentTableName = 'services';
      try {
        const configRes = await fetch('/api/config', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (configRes.ok) {
          const freshConfig = await configRes.json();
          const tab = freshConfig.admin?.tabs?.find(t => t.id === 'services');
          currentTableName = tab?.table || 'services';
          setTableName(currentTableName);
          setIsEditable(tab?.editable !== false);
          setShowRefresh(tab?.showRefresh !== false);
          setRefreshBtn(tab?.refreshBtn || '🔄 Refresh');
          setLoadingBtn(tab?.loadingBtn || '🔄 Loading...');
          setSortEnabled(tab?.sort === true);
        }
      } catch (configErr) {
        console.error('Config load failed:', configErr);
      }

      const response = await fetch(`/api/admin/users?table=${currentTableName}&t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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
    if (!sortEnabled) return '';
    if (sortColumn !== column) return ' ↕';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    let aVal = a[sortColumn] ?? '';
    let bVal = b[sortColumn] ?? '';
    if (sortColumn.includes('created') || sortColumn.includes('date') || sortColumn.includes('updated')) {
      aVal = new Date(aVal || 0).getTime();
      bVal = new Date(bVal || 0).getTime();
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    const comparison = String(aVal).localeCompare(String(bVal));
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const allColumns = data.length > 0 ? Object.keys(data[0]).filter(col => !col.startsWith('_')) : [];
  
  useEffect(() => {
    if (allColumns.length > 0 && visibleColumns.length === 0) {
      setVisibleColumns(allColumns.slice(0, Math.min(6, allColumns.length)));
    }
  }, [allColumns.length]);

  const columns = visibleColumns.length > 0 ? visibleColumns : allColumns;

  const toggleColumn = (col) => {
    if (visibleColumns.includes(col)) {
      if (visibleColumns.length > 1) {
        setVisibleColumns(visibleColumns.filter(c => c !== col));
      }
    } else {
      setVisibleColumns([...visibleColumns, col]);
    }
  };

  const selectAllColumns = () => setVisibleColumns([...allColumns]);
  const selectMinColumns = () => setVisibleColumns(allColumns.slice(0, Math.min(3, allColumns.length)));
  const formatColumnName = (col) => col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const headerStyle = (column) => ({
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#1B1B1B',
    borderBottom: '2px solid #ddd',
    cursor: sortEnabled ? 'pointer' : 'default',
    userSelect: 'none'
  });

  return (
    <div className="dashboardContainer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#1B1B1B', flex: 1, minWidth: '150px' }}>{config.title || 'Manage Services'}</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
          {allColumns.length > 0 && (
            <ColumnSelector
              allColumns={allColumns}
              visibleColumns={visibleColumns}
              onToggle={toggleColumn}
              onSelectAll={selectAllColumns}
              onSelectMin={selectMinColumns}
              formatColumnName={formatColumnName}
            />
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
        <div className="quickActions" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
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
                <tr key={item.service_id || idx} style={{ borderBottom: '1px solid #eee' }}>
                  {columns.map(col => (
                    <td key={col} data-label={formatColumnName(col)} style={{ padding: '12px', color: '#666' }}>
                      {item[col] != null ? String(item[col]) : '-'}
                    </td>
                  ))}
                  {isEditable && (
                    <td data-label="Actions" style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => setViewingItem(item)}
                          style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.1rem', padding: '2px 4px' }}
                          title="View"
                        >
                          {actions.view_icon || '👁️'}
                        </button>
                        <span style={{ color: '#ddd' }}>|</span>
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={deleting}
                          style={{ cursor: deleting ? 'not-allowed' : 'pointer', background: 'none', border: 'none', fontSize: '1.1rem', padding: '2px 4px', opacity: deleting ? 0.6 : 1 }}
                          title="Delete"
                        >
                          {actions.delete_icon}
                        </button>
                      </div>
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
      {/* View Modal */}
      {viewingItem && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={(e) => e.target === e.currentTarget && setViewingItem(null)}
        >
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px 16px', width: '90%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1B1B1B' }}>👁️ View Record</h3>
              <button onClick={() => setViewingItem(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#666', padding: '0 4px', lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {allColumns.map(col => (
                <div key={col} style={{ display: 'flex', gap: '12px', padding: '6px 10px', background: AUTO_GENERATED_FIELDS.includes(col.toLowerCase()) ? '#f9f9f9' : '#fff', borderRadius: '6px', border: '1px solid #eee' }}>
                  <span style={{ minWidth: '130px', fontWeight: 'bold', color: '#D4AF37', fontSize: '0.78rem', flexShrink: 0 }}>{formatColumnName(col)}</span>
                  <span style={{ color: '#333', wordBreak: 'break-word', fontSize: '0.85rem' }}>{viewingItem[col] != null ? String(viewingItem[col]) : '—'}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={() => { setViewingItem(null); handleEdit(viewingItem); }}
                style={{ padding: '8px 16px', background: '#D4AF37', color: '#1B1B1B', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => setViewingItem(null)}
                style={{ padding: '8px 16px', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
            padding: '20px 16px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#1B1B1B' }}>✏️ Edit Item</h3>
            
            {/* Show auto-generated fields as read-only */}
            {allColumns.filter(col => AUTO_GENERATED_FIELDS.includes(col.toLowerCase())).length > 0 && (
              <div style={{ 
                marginBottom: '12px', 
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {visibleColumns
                .filter(col => !AUTO_GENERATED_FIELDS.includes(col.toLowerCase()))
                .map(col => {
                  const isTextArea = col === 'description' || col === 'notes' || col === 'comments' || col === 'message' || col === 'bio';
                  const isEmail = col.includes('email');
                  const isNumber = col.includes('price') || col.includes('amount') || col.includes('duration') || col.includes('rating') || col.includes('quantity');
                  const isBoolean = col.includes('is_') || col.includes('active') || col.includes('featured');
                  
                  return (
                    <div key={col}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '2px', color: '#1B1B1B' }}>
                        {formatColumnName(col)}
                      </label>
                      {isBoolean ? (
                        <select
                          value={editingItem[col] ? 'true' : 'false'}
                          onChange={(e) => handleInputChange(col, e.target.value === 'true')}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', color: '#1B1B1B' }}
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      ) : isTextArea ? (
                        <textarea
                          value={editingItem[col] || ''}
                          onChange={(e) => handleInputChange(col, e.target.value)}
                          rows={2}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical', color: '#1B1B1B' }}
                        />
                      ) : (
                        <input
                          type={isEmail ? 'email' : isNumber ? 'number' : 'text'}
                          step={isNumber ? '0.01' : undefined}
                          value={editingItem[col] || ''}
                          onChange={(e) => handleInputChange(col, isNumber ? parseFloat(e.target.value) || '' : e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', color: '#1B1B1B' }}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
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
