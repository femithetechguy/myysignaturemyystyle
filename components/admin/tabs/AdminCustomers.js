import { useState, useEffect } from 'react';
import ColumnSelector from '../ColumnSelector';
import staticConfig from '../../../config/admin.json';

const AUTO_GENERATED_FIELDS = ['id', 'created_at', 'updated_at', 'customer_id'];

export default function AdminCustomers({ refreshKey = 0 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableName, setTableName] = useState('customers');
  const [config, setConfig] = useState(staticConfig.admin.customers || {});
  const actions = config.actions || { view_icon: '👁️', delete_icon: '🗑️', separator: '|' };
  const [isEditable, setIsEditable] = useState(true);
  const [sortEnabled, setSortEnabled] = useState(true);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      if (!token) { setError('No authentication token.'); setLoading(false); return; }

      try {
        const configRes = await fetch('/api/config', { headers: { Authorization: `Bearer ${token}` } });
        if (configRes.ok) {
          const freshConfig = await configRes.json();
          const tab = freshConfig.admin?.tabs?.find(t => t.id === 'customers');
          setTableName(tab?.table || 'customers');
          setConfig(freshConfig.admin?.customers || {});
          setIsEditable(tab?.editable !== false);
          setSortEnabled(tab?.sort === true);
        }
      } catch (e) { console.error('Config load failed:', e); }

      const res = await fetch(`/api/admin/customers?table=${tableName}&t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to fetch customers: ${res.status}`);
      }
      const result = await res.json();
      setData(result.customers || result || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => { setEditingItem({ ...item }); setShowModal(true); };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/customers?table=${tableName}&id=${editingItem.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem)
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to update'); }
      setShowModal(false); setEditingItem(null); await fetchData();
    } catch (err) { console.error('Save error:', err); alert('Error saving: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    const displayName = item.first_name || item.email || item.id;
    if (!confirm(`Delete "${displayName}"?`)) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/customers?table=${tableName}&id=${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to delete'); }
      await fetchData();
    } catch (err) { console.error('Delete error:', err); alert('Error deleting: ' + err.message); }
    finally { setDeleting(false); }
  };

  const handleInputChange = (field, value) => setEditingItem({ ...editingItem, [field]: value });

  const handleSort = (col) => {
    if (!sortEnabled) return;
    if (sortColumn === col) setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortColumn(col); setSortDirection('asc'); }
  };

  const getSortIndicator = (col) => {
    if (!sortEnabled || sortColumn !== col) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortEnabled || !sortColumn) return 0;
    const aVal = a[sortColumn]; const bVal = b[sortColumn];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1; if (bVal == null) return -1;
    const mult = sortDirection === 'asc' ? 1 : -1;
    if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * mult;
    return String(aVal).localeCompare(String(bVal)) * mult;
  });

  const allColumns = data.length > 0 ? Object.keys(data[0]) : [];
  const columns = visibleColumns.length > 0 ? visibleColumns : allColumns;

  useEffect(() => {
    if (data.length > 0 && visibleColumns.length === 0) {
      setVisibleColumns(Object.keys(data[0]).slice(0, Math.min(6, Object.keys(data[0]).length)));
    }
  }, [data]);

  const toggleColumn = (col) => setVisibleColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
  const selectAllColumns = () => setVisibleColumns(allColumns);
  const selectMinColumns = () => setVisibleColumns(allColumns.slice(0, Math.min(6, allColumns.length)));
  const formatColumnName = (col) => col.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const headerStyle = (col) => ({
    padding: '12px', textAlign: 'left', fontWeight: 'bold',
    cursor: sortEnabled ? 'pointer' : 'default', userSelect: 'none',
    color: '#1B1B1B', background: sortColumn === col ? '#e8e8e8' : '#f5f5f5'
  });

  return (
    <div className="dashboardContainer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#1B1B1B', flex: 1, minWidth: '150px' }}>{config.title || 'Manage Customers'}</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
          {allColumns.length > 0 && (
            <ColumnSelector allColumns={allColumns} visibleColumns={visibleColumns} onToggle={toggleColumn} onSelectAll={selectAllColumns} onSelectMin={selectMinColumns} formatColumnName={formatColumnName} />
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
        <p style={{ margin: 0, fontSize: '0.95rem' }}>🧑‍💼 Total Customers: <strong>{data.length}</strong> | 📁 Table: <strong>{tableName}</strong></p>
      </div>

      {error && (
        <div style={{ padding: '20px', background: '#fff3f3', border: '2px solid #ff6b6b', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ margin: 0, color: '#d32f2f', fontWeight: 'bold' }}>⚠️ Error</p>
          <p style={{ margin: '10px 0 0 0', color: '#333' }}>{error}</p>
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading customers...</div>}

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
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1B1B1B', background: '#f5f5f5' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, idx) => (
                <tr key={item.id || idx} style={{ borderBottom: '1px solid #eee' }}>
                  {columns.map(col => (
                    <td key={col} data-label={formatColumnName(col)} style={{ padding: '12px', color: '#666' }}>
                      {item[col] != null ? String(item[col]) : '-'}
                    </td>
                  ))}
                  <td data-label="Actions" style={{ padding: '12px' }}>
                    <button onClick={() => setViewingItem(item)} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.1rem', padding: 0 }} title="View">
                      {actions.view_icon || '👁️'}
                    </button>
                    <span style={{ margin: '0 8px', color: '#ccc' }}>|</span>
                    <button onClick={() => handleDelete(item)} disabled={deleting} style={{ cursor: deleting ? 'not-allowed' : 'pointer', background: 'none', border: 'none', fontSize: '1.1rem', padding: 0, opacity: deleting ? 0.6 : 1 }} title="Delete">
                      {actions.delete_icon || '🗑️'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && data.length === 0 && !error && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666', background: '#f9f9f9', borderRadius: '4px' }}>
          No customers yet. Customers are created automatically when a booking is made.
        </div>
      )}

      {/* View Modal */}
      {viewingItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={(e) => e.target === e.currentTarget && setViewingItem(null)}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px 16px', width: '90%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#1B1B1B' }}>👁️ View Customer</h3>
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
              {isEditable && (
                <button onClick={() => { setViewingItem(null); handleEdit(viewingItem); }} style={{ padding: '8px 16px', background: '#D4AF37', color: '#1B1B1B', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  ✏️ Edit
                </button>
              )}
              <button onClick={() => setViewingItem(null)} style={{ padding: '8px 16px', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && editingItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px 16px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#1B1B1B' }}>✏️ Edit Customer</h3>
            {allColumns.filter(col => AUTO_GENERATED_FIELDS.includes(col.toLowerCase())).length > 0 && (
              <div style={{ marginBottom: '12px', padding: '12px', background: '#f9f9f9', borderRadius: '6px', fontSize: '0.9rem', color: '#666' }}>
                {allColumns.filter(col => AUTO_GENERATED_FIELDS.includes(col.toLowerCase())).map(col => (
                  <span key={col} style={{ marginRight: '20px', display: 'inline-block' }}>
                    <strong>{formatColumnName(col)}:</strong> {editingItem[col] || '-'}
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allColumns.filter(col => !AUTO_GENERATED_FIELDS.includes(col.toLowerCase())).map(col => {
                const isTextArea = col === 'notes' || col === 'address';
                const isEmail = col.includes('email');
                const isNumber = col.includes('total') || col.includes('points') || col.includes('spent');
                const isBoolean = col === 'marketing_consent';
                return (
                  <div key={col}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '2px', color: '#1B1B1B' }}>{formatColumnName(col)}</label>
                    {isBoolean ? (
                      <select value={editingItem[col] ? 'true' : 'false'} onChange={(e) => handleInputChange(col, e.target.value === 'true')}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', color: '#1B1B1B' }}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : isTextArea ? (
                      <textarea value={editingItem[col] || ''} onChange={(e) => handleInputChange(col, e.target.value)} rows={2}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical', color: '#1B1B1B' }} />
                    ) : (
                      <input type={isEmail ? 'email' : isNumber ? 'number' : 'text'} step={isNumber ? '1' : undefined}
                        value={editingItem[col] || ''} onChange={(e) => handleInputChange(col, isNumber ? parseInt(e.target.value) || '' : e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', color: '#1B1B1B' }} />
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
              <button onClick={() => { setShowModal(false); setEditingItem(null); }} style={{ padding: '8px 16px', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '8px 16px', background: saving ? '#ccc' : '#D4AF37', color: '#1B1B1B', border: 'none', borderRadius: '6px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                {saving ? 'Saving...' : '💾 Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
