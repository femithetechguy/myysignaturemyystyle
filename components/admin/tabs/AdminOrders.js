import { useState, useEffect } from 'react';
import ColumnSelector from '../ColumnSelector';
import staticConfig from '../../../config/admin.json';
import { colors, text, button, styles as themeStyles, primaryButtonHover } from '../AdminThemeProvider';

// Auto-generated fields that should not be editable
const AUTO_GENERATED_FIELDS = ['id', 'created_at', 'updated_at', 'created_date', 'updated_date', 'date_created', 'date_updated', 'order_number', 'order_id'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableName, setTableName] = useState('orders');
  const [isEditable, setIsEditable] = useState(true);
  const [showRefresh, setShowRefresh] = useState(true);
  const [refreshBtn, setRefreshBtn] = useState('🔄 Refresh');
  const [loadingBtn, setLoadingBtn] = useState('🔄 Loading...');
  const [editingOrder, setEditingOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sortEnabled, setSortEnabled] = useState(true);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [visibleColumns, setVisibleColumns] = useState([]);

  const ordersConfig = staticConfig.admin.orders || {
    title: "Manage Orders",
    description: "View and manage customer orders",
    actions: {
      edit_icon: "✏️",
      delete_icon: "🗑️",
      separator: "|"
    },
    messages: {
      loading: "Loading orders...",
      empty: "No orders found",
      empty_hint: "Orders will appear here once the table is set up and populated.",
      error_hint: "The orders table may not exist yet. Create it in the database first."
    }
  };
  const actions = ordersConfig.actions || { edit_icon: "✏️", delete_icon: "🗑️", separator: "|" };
  const messages = ordersConfig.messages || {};

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

      // Load fresh config from API
      let currentTableName = 'orders';
      try {
        const configRes = await fetch('/api/config', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (configRes.ok) {
          const freshConfig = await configRes.json();
          const ordersTab = freshConfig.admin?.tabs?.find(tab => tab.id === 'orders');
          currentTableName = ordersTab?.table || 'orders';
          setTableName(currentTableName);
          setIsEditable(ordersTab?.editable !== false);
          setShowRefresh(ordersTab?.showRefresh !== false);
          setRefreshBtn(ordersTab?.refreshBtn || '🔄 Refresh');
          setLoadingBtn(ordersTab?.loadingBtn || '🔄 Loading...');
          setSortEnabled(ordersTab?.sort === true);
        }
      } catch (configErr) {
        console.error('Config load failed, using default:', configErr);
      }

      // Fetch orders
      const url = `/api/admin/orders?table=${currentTableName}&t=${Date.now()}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data.orders || data || []);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order) => {
    setEditingOrder({ ...order });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/orders?table=${tableName}&id=${editingOrder.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingOrder)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order');
      }

      setShowModal(false);
      setEditingOrder(null);
      await fetchWithFreshConfig();
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving order: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (orderId, orderNumber) => {
    if (!confirm(`Are you sure you want to delete order "${orderNumber || orderId}"?`)) {
      return;
    }
    
    try {
      setDeleting(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/orders?table=${tableName}&id=${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete order');
      }

      await fetchWithFreshConfig();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting order: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditingOrder({ ...editingOrder, [field]: value });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: { bg: '#fff3cd', color: '#856404' },
      processing: { bg: '#cce5ff', color: '#004085' },
      shipped: { bg: '#d4edda', color: '#155724' },
      delivered: { bg: '#d1ecf1', color: '#0c5460' },
      cancelled: { bg: '#f8d7da', color: '#721c24' }
    };
    const style = statusColors[status?.toLowerCase()] || { bg: '#e9ecef', color: '#495057' };
    return (
      <span style={{ 
        padding: '4px 10px', 
        borderRadius: '12px', 
        background: style.bg, 
        color: style.color,
        fontSize: '0.85rem',
        fontWeight: '500'
      }}>
        {status || 'unknown'}
      </span>
    );
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

  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortColumn) return 0;
    let aVal = a[sortColumn] ?? '';
    let bVal = b[sortColumn] ?? '';
    // Handle date columns
    if (sortColumn === 'created_at' || sortColumn === 'order_date' || sortColumn === 'date') {
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
    borderBottom: '2px solid #ddd',
    cursor: sortEnabled ? 'pointer' : 'default',
    userSelect: 'none'
  });

  // Get columns dynamically from data
  const allColumns = orders.length > 0 ? Object.keys(orders[0]).filter(col => !col.startsWith('_')) : [];
  
  // Initialize visible columns when data loads
  useEffect(() => {
    if (allColumns.length > 0 && visibleColumns.length === 0) {
      // Default to first 6 columns or all if less than 6
      setVisibleColumns(allColumns.slice(0, Math.min(6, allColumns.length)));
    }
  }, [allColumns.length]);

  // Columns to display in table (filtered by selection)
  const columns = visibleColumns.length > 0 ? visibleColumns : allColumns;

  // Get editable fields (exclude auto-generated)
  const getEditableFields = () => {
    return allColumns.filter(col => !AUTO_GENERATED_FIELDS.includes(col.toLowerCase()));
  };

  const toggleColumn = (col) => {
    if (visibleColumns.includes(col)) {
      // Don't allow removing the last column
      if (visibleColumns.length > 1) {
        setVisibleColumns(visibleColumns.filter(c => c !== col));
      }
    } else {
      setVisibleColumns([...visibleColumns, col]);
    }
  };

  const selectAllColumns = () => {
    setVisibleColumns([...allColumns]);
  };

  const selectMinColumns = () => {
    // Select first 3 columns minimum
    setVisibleColumns(allColumns.slice(0, Math.min(3, allColumns.length)));
  };

  // Format column name for display (snake_case to Title Case)
  const formatColumnName = (col) => {
    return col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Render cell value with special handling
  const renderCellValue = (value, column) => {
    if (value === null || value === undefined) return '-';
    
    // Handle status fields with badge styling
    if (column === 'status') {
      return getStatusBadge(value);
    }
    
    // Handle currency fields
    if (column === 'total' || column === 'amount' || column === 'price') {
      return formatCurrency(value);
    }
    
    // Handle date fields
    if (column.includes('created') || column.includes('date') || column.includes('updated')) {
      return formatDate(value);
    }
    
    // Handle order number/id
    if (column === 'order_number' || column === 'order_id') {
      return `#${value}`;
    }
    
    return String(value);
  };

  return (
    <div className="dashboardContainer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#1B1B1B', flex: 1, minWidth: '150px' }}>{ordersConfig.title}</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
          {/* Column Selector */}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#C99A2D')}
            onMouseLeave={(e) => !loading && (e.target.style.background = '#D4AF37')}
            title="Refresh order data"
          >
            {loading ? loadingBtn : refreshBtn}
          </button>
        )}
        </div>
      </div>
      
      <div className="info" style={{ marginBottom: '30px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
        <p style={{ margin: 0, fontSize: '0.95rem' }}>📦 Total Orders: <strong>{orders.length}</strong> | 📁 Table: <strong>{tableName}</strong></p>
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
          <p style={{ margin: 0, color: '#d32f2f', fontWeight: 'bold', fontSize: '1.1rem' }}>⚠️ Error</p>
          <p style={{ margin: '10px 0 0 0', color: '#333' }}>{error}</p>
          <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
            💡 <strong>Hint:</strong> The orders table may not exist yet. Create it in the database first.
          </p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>Loading orders...</p>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666', background: '#f9f9f9', borderRadius: '8px' }}>
          <p style={{ fontSize: '1.2rem', margin: 0 }}>No orders found</p>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem' }}>Orders will appear here once the table is set up and populated.</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
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
              {sortedOrders.map((order, index) => (
                <tr key={order.id || index} style={{ borderBottom: '1px solid #eee' }}>
                  {columns.map((col, colIndex) => (
                    <td key={col} style={{ 
                      padding: '12px', 
                      color: col === 'id' || colIndex === 0 ? '#666' : '#1B1B1B',
                      fontWeight: col === 'customer_name' || col === 'customer' || colIndex === 1 ? 'bold' : 'normal',
                      fontFamily: col === 'order_number' || col === 'order_id' ? 'monospace' : 'inherit'
                    }}>
                      {renderCellValue(order[col], col)}
                    </td>
                  ))}
                  {isEditable && (
                    <td style={{ padding: '12px' }}>
                      <button 
                        onClick={() => handleEdit(order)}
                        style={{ 
                          cursor: 'pointer', 
                          background: 'none', 
                          border: 'none',
                          fontSize: '1.1rem',
                          padding: 0
                        }}
                        title={`Edit order #${order.order_number || order.id}`}
                      >
                        {actions.edit_icon}
                      </button>
                      <span style={{ margin: '0 8px', color: '#ccc' }}>{actions.separator}</span>
                      <button 
                        onClick={() => handleDelete(order.id, order.order_number)}
                        disabled={deleting}
                        style={{ 
                          cursor: deleting ? 'not-allowed' : 'pointer', 
                          background: 'none', 
                          border: 'none',
                          fontSize: '1.1rem',
                          padding: 0,
                          opacity: deleting ? 0.6 : 1
                        }}
                        title={`Delete order #${order.order_number || order.id}`}
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

      {/* Edit Modal - Dynamic fields based on visible columns */}
      {showModal && editingOrder && (
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
          onClick={(e) => e.target === e.currentTarget && setShowColumnSelector(false)}
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
            <h3 style={{ margin: '0 0 20px 0', color: '#1B1B1B' }}>✏️ Edit Order #{editingOrder.order_number || editingOrder.id}</h3>
            
            {/* Show non-editable fields (auto-generated) as read-only info */}
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
                  <span key={col} style={{ marginRight: '20px' }}>
                    <strong>{formatColumnName(col)}:</strong> {editingOrder[col] || '-'}
                  </span>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Dynamic editable fields - based on visible columns that are editable */}
              {visibleColumns
                .filter(col => !AUTO_GENERATED_FIELDS.includes(col.toLowerCase()))
                .map(col => {
                  const isStatusField = col === 'status';
                  const isNotesField = col === 'notes' || col === 'special_instructions' || col === 'description' || col === 'comments';
                  const isEmailField = col.includes('email');
                  const isNumberField = col.includes('amount') || col.includes('price') || col.includes('total') || col.includes('quantity');
                  
                  return (
                    <div key={col}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#1B1B1B' }}>
                        {formatColumnName(col)}
                      </label>
                      {isStatusField ? (
                        <select
                          value={editingOrder[col] || 'pending'}
                          onChange={(e) => handleInputChange(col, e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', color: '#1B1B1B' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : isNotesField ? (
                        <textarea
                          value={editingOrder[col] || ''}
                          onChange={(e) => handleInputChange(col, e.target.value)}
                          rows={3}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical', color: '#1B1B1B' }}
                        />
                      ) : (
                        <input
                          type={isEmailField ? 'email' : isNumberField ? 'number' : 'text'}
                          step={isNumberField ? '0.01' : undefined}
                          value={editingOrder[col] || ''}
                          onChange={(e) => handleInputChange(col, isNumberField ? parseFloat(e.target.value) || '' : e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', color: '#1B1B1B' }}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' }}>
              <button
                onClick={() => { setShowModal(false); setEditingOrder(null); }}
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
