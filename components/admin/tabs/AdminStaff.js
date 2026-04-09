import { useState, useEffect } from 'react';
import staticConfig from '../../../config/admin.json';

const AUTO_GENERATED_FIELDS = ['id', 'created_at', 'updated_at', 'staff_id'];

const AVAIL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const AVAIL_DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

function formatTime12(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${(m || 0).toString().padStart(2, '0')} ${ampm}`;
}

const TIME_OPTIONS = [];
for (let h = 6; h <= 22; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  }
}

function parseDay(dayVal) {
  if (!dayVal || dayVal === 'closed') return { open: false, start: '09:00', end: '18:00' };
  const [start, end] = dayVal.split('-');
  return { open: true, start: start || '09:00', end: end || '18:00' };
}

function AvailabilityEditor({ value, onChange }) {
  const schedule = (value && typeof value === 'object') ? value : {};

  const updateDay = (day, changes) => {
    const current = parseDay(schedule[day]);
    const updated = { ...current, ...changes };
    const newSchedule = { ...schedule };
    newSchedule[day] = updated.open ? `${updated.start}-${updated.end}` : 'closed';
    onChange(newSchedule);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {AVAIL_DAYS.map(day => {
        const { open, start, end } = parseDay(schedule[day]);
        return (
          <div key={day} style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
            background: open ? '#f0f7f0' : '#f5f5f5',
            borderRadius: '6px', border: `1px solid ${open ? '#a8d5a2' : '#e0e0e0'}`
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '70px', cursor: 'pointer', flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={open}
                onChange={(e) => updateDay(day, { open: e.target.checked })}
                style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#2d6a2d' }}
              />
              <span style={{ fontWeight: open ? '700' : '400', color: open ? '#2d6a2d' : '#999', fontSize: '0.82rem', textTransform: 'capitalize' }}>
                {AVAIL_DAY_LABELS[day]}
              </span>
            </label>
            {open ? (
              <>
                <select
                  value={start}
                  onChange={(e) => updateDay(day, { start: e.target.value })}
                  style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #ccc', color: '#1B1B1B', fontSize: '0.82rem', flex: 1 }}
                >
                  {TIME_OPTIONS.map(t => <option key={t} value={t}>{formatTime12(t)}</option>)}
                </select>
                <span style={{ color: '#666', fontSize: '0.8rem', flexShrink: 0 }}>to</span>
                <select
                  value={end}
                  onChange={(e) => updateDay(day, { end: e.target.value })}
                  style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #ccc', color: '#1B1B1B', fontSize: '0.82rem', flex: 1 }}
                >
                  {TIME_OPTIONS.map(t => <option key={t} value={t}>{formatTime12(t)}</option>)}
                </select>
              </>
            ) : (
              <span style={{ color: '#aaa', fontSize: '0.78rem', fontStyle: 'italic' }}>Closed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminStaff() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableName, setTableName] = useState('staff');
  const [config, setConfig] = useState(staticConfig.admin.staff || {});
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
          const tab = freshConfig.admin?.tabs?.find(t => t.id === 'staff');
          setTableName(tab?.table || 'staff');
          setConfig(freshConfig.admin?.staff || {});
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
    // Stringify any JSONB object/array values so they're editable as text,
    // but keep `availability` as a plain object for the structured editor
    const normalized = { ...item };
    Object.keys(normalized).forEach(k => {
      if (k === 'availability') return;
      if (normalized[k] !== null && typeof normalized[k] === 'object') {
        normalized[k] = JSON.stringify(normalized[k], null, 2);
      }
    });
    setEditingItem(normalized);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const idField = Object.keys(editingItem).find(k => k.endsWith('_id') || k === 'id');
      const itemId = editingItem[idField];

      // Parse any JSONB fields that were edited as JSON strings
      const payload = { ...editingItem };
      Object.keys(payload).forEach(k => {
        if (typeof payload[k] === 'string') {
          const trimmed = payload[k].trim();
          if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            try { payload[k] = JSON.parse(trimmed); } catch (_) {}
          }
        }
      });
      
      const response = await fetch(`/api/admin/users?table=${tableName}&id=${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
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
        <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#1B1B1B', flex: 1, minWidth: '150px' }}>{config.title || 'Manage Staff'}</h2>
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
                <div style={{
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
                <tr key={item.staff_id || idx} style={{ borderBottom: '1px solid #eee' }}>
                  {columns.map(col => (
                    <td key={col} style={{ padding: '12px', color: '#666', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item[col] == null
                        ? '-'
                        : typeof item[col] === 'object'
                          ? JSON.stringify(item[col])
                          : String(item[col])}
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
                  const isJsonb = col === 'specialties' || col === 'availability' || col === 'metadata' || col === 'staff_ids' ||
                    (typeof editingItem[col] === 'string' && (editingItem[col].trim().startsWith('[') || editingItem[col].trim().startsWith('{')));
                  const isEmail = col.includes('email');
                  const isNumber = col.includes('price') || col.includes('amount') || col.includes('duration') || col.includes('rating') || col.includes('quantity') || col.includes('order');
                  const isBoolean = col.includes('is_') || col === 'active' || col === 'featured' || col === 'is_bookable';
                  
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
                      ) : col === 'availability' ? (
                        <AvailabilityEditor
                          value={editingItem[col] || {}}
                          onChange={(val) => handleInputChange(col, val)}
                        />
                      ) : isJsonb || isTextArea ? (
                        <>
                          <textarea
                            value={editingItem[col] || ''}
                            onChange={(e) => handleInputChange(col, e.target.value)}
                            rows={isJsonb ? 4 : 3}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical', color: '#1B1B1B', fontFamily: isJsonb ? 'monospace' : 'inherit', fontSize: isJsonb ? '0.85rem' : 'inherit' }}
                          />
                          {isJsonb && <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#999' }}>JSON array or object</p>}
                        </>
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
