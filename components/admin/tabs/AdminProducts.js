import { useState, useEffect } from 'react';
import staticConfig from '../../../config/admin.json';
import { colors, text, button, styles as themeStyles, primaryButtonHover } from '../AdminThemeProvider';

// Auto-generated fields that should not be editable
const AUTO_GENERATED_FIELDS = ['product_id', 'created_at', 'updated_at', 'created_date', 'updated_date', 'date_created', 'date_updated'];

// All possible columns for products
const ALL_PRODUCT_COLUMNS = ['product_id', 'product_name', 'category', 'price', 'duration_minutes', 'difficulty_level', 'availability_status', 'is_active', 'description', 'staff_required', 'required_materials'];

export default function AdminProducts({ refreshKey = 0 }) {
  const [config, setConfig] = useState(staticConfig);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showRefresh, setShowRefresh] = useState(true);
  const [refreshBtn, setRefreshBtn] = useState('🔄 Refresh');
  const [loadingBtn, setLoadingBtn] = useState('🔄 Loading...');
  const [sortEnabled, setSortEnabled] = useState(true);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [visibleColumns, setVisibleColumns] = useState(['product_id', 'product_name', 'category', 'price', 'availability_status', 'is_active']);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Derived values from config
  const productsConfig = config.admin.products || {
    title: "Manage Products",
    description: "View and manage product catalog",
    edit_btn: "Edit",
    delete_btn: "Delete",
    add_btn: "Add Product"
  };
  const productsTab = config.admin.tabs.find(tab => tab.id === 'products');
  const tableName = productsTab?.table || 'products';
  const isEditable = productsTab?.editable !== false;

  useEffect(() => {
    setIsMounted(true);
    loadConfigAndFetch();
  }, []);

  const loadConfigAndFetch = async () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const configRes = await fetch('/api/config', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (configRes.ok) {
          const freshConfig = await configRes.json();
          setConfig(freshConfig);
          // Fetch products with fresh table name
          const freshTab = freshConfig.admin?.tabs?.find(tab => tab.id === 'products');
          const freshTableName = freshTab?.table || 'products';
          // Set refresh button config
          setShowRefresh(freshTab?.showRefresh !== false);
          setRefreshBtn(freshTab?.refreshBtn || '🔄 Refresh');
          setLoadingBtn(freshTab?.loadingBtn || '🔄 Loading...');
          setSortEnabled(freshTab?.sort === true);
          await fetchProductsWithTable(freshTableName, token);
          return;
        }
      } catch (err) {
        console.error('Failed to load config:', err);
      }
    }
    // Fallback to static config
    fetchProducts();
  };

  const fetchProductsWithTable = async (tableToUse, token) => {
    try {
      setLoading(true);
      const url = `/api/admin/products?table=${tableToUse}&t=${Date.now()}`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || 'Unknown error';
        const hint = errorData.hint ? `\n💡 Hint: ${errorData.hint}` : '';
        throw new Error(`${errorMsg}${hint}`);
      }
      
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('No authentication token. Please login again.');
        setLoading(false);
        return;
      }
      
      const url = `/api/admin/products?table=${tableName}&t=${Date.now()}`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
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
      console.log('Fetched products:', data);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    // Parse JSONB fields properly
    const parsedProduct = {
      ...product,
      price: Array.isArray(product.price) 
        ? product.price 
        : typeof product.price === 'string' 
          ? JSON.parse(product.price) 
          : [{ name: 'Standard', amount: product.price || 0 }],
      required_materials: product.required_materials 
        ? (Array.isArray(product.required_materials) 
            ? product.required_materials 
            : typeof product.required_materials === 'string'
              ? JSON.parse(product.required_materials)
              : [])
        : []
    };
    setEditingProduct(parsedProduct);
    setIsAddingNew(false);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingProduct({
      product_name: '',
      category: 'Cutting',
      description: '',
      price: [{ name: 'Standard', amount: 0 }],
      duration_minutes: 30,
      staff_required: 1,
      difficulty_level: 'Intermediate',
      required_materials: [],
      availability_status: 'Available',
      is_active: true
    });
    setIsAddingNew(true);
    setShowModal(true);
  };

  const handleDelete = async (productId, productName) => {
    const confirmed = window.confirm(`⚠️  Are you sure you want to delete "${productName}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('No authentication token.');
        return;
      }

      const response = await fetch(`/api/admin/products?table=${tableName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'delete',
          table: tableName,
          product_id: productId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Delete failed: ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Product deleted successfully:', data);
      
      // Refresh the products list
      await fetchProducts();
      setError(null);
      
    } catch (err) {
      setError(err.message);
      console.error('Error deleting product:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('No authentication token.');
        return;
      }

      if (!editingProduct.product_name || !editingProduct.category) {
        setError('Product name and category are required.');
        return;
      }

      const payload = {
        ...editingProduct,
        price: JSON.stringify(editingProduct.price),
        required_materials: JSON.stringify(editingProduct.required_materials)
      };

      if (isAddingNew) {
        payload.action = 'create';
      }
      payload.table = tableName;

      const response = await fetch(`/api/admin/products?table=${tableName}`, {
        method: isAddingNew ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`${isAddingNew ? 'Create' : 'Update'} failed: ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log(`Product ${isAddingNew ? 'created' : 'updated'} successfully:`, data);
      
      setShowModal(false);
      setEditingProduct(null);
      setIsAddingNew(false);
      setError(null);
      
      // Refresh the products list
      await fetchProducts();
      
    } catch (err) {
      setError(err.message);
      console.error(`Error ${isAddingNew ? 'creating' : 'updating'} product:`, err);
    }
  };

  // Price tier management
  const addPriceTier = () => {
    const newPrice = [...(editingProduct.price || []), { name: '', amount: 0 }];
    setEditingProduct({ ...editingProduct, price: newPrice });
  };

  const removePriceTier = (index) => {
    const newPrice = editingProduct.price.filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, price: newPrice });
  };

  const updatePriceTier = (index, field, value) => {
    const newPrice = [...editingProduct.price];
    newPrice[index] = { ...newPrice[index], [field]: field === 'amount' ? parseFloat(value) || 0 : value };
    setEditingProduct({ ...editingProduct, price: newPrice });
  };

  // Required materials management
  const addMaterial = () => {
    const newMaterials = [...(editingProduct.required_materials || []), ''];
    setEditingProduct({ ...editingProduct, required_materials: newMaterials });
  };

  const removeMaterial = (index) => {
    const newMaterials = editingProduct.required_materials.filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, required_materials: newMaterials });
  };

  const updateMaterial = (index, value) => {
    const newMaterials = [...editingProduct.required_materials];
    newMaterials[index] = value;
    setEditingProduct({ ...editingProduct, required_materials: newMaterials });
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

  // Format column name for display (snake_case to Title Case)
  const formatColumnName = (col) => {
    const displayNames = {
      product_id: 'ID',
      product_name: 'Product Name',
      duration_minutes: 'Duration',
      difficulty_level: 'Difficulty',
      availability_status: 'Availability',
      is_active: 'Status',
      staff_required: 'Staff Required',
      required_materials: 'Materials'
    };
    return displayNames[col] || col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const toggleColumn = (col) => {
    if (visibleColumns.includes(col)) {
      if (visibleColumns.length > 1) {
        setVisibleColumns(visibleColumns.filter(c => c !== col));
      }
    } else {
      setVisibleColumns([...visibleColumns, col]);
    }
  };

  const selectAllColumns = () => {
    setVisibleColumns([...ALL_PRODUCT_COLUMNS]);
  };

  const selectMinColumns = () => {
    setVisibleColumns(['product_id', 'product_name', 'price']);
  };

  // Render cell value based on column type
  const renderProductCell = (product, col) => {
    const value = product[col];
    
    switch (col) {
      case 'product_id':
        return value;
      
      case 'product_name':
        return (
          <div style={{ fontWeight: 'bold' }}>
            {value}
            {product.description && (
              <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '4px', fontWeight: 'normal' }}>
                {product.description.length > 60 ? product.description.substring(0, 60) + '...' : product.description}
              </div>
            )}
          </div>
        );
      
      case 'category':
        return (
          <span style={{
            background: '#e8f4f8',
            color: '#2c5f7c',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: '500'
          }}>
            {value}
          </span>
        );
      
      case 'price':
        const prices = Array.isArray(value) ? value : 
                       typeof value === 'string' ? (() => { try { return JSON.parse(value); } catch { return [{ name: 'Standard', amount: parseFloat(value) || 0 }]; } })() : 
                       [{ name: 'Standard', amount: value }];
        
        if (prices.length === 1) {
          return <div style={{ fontWeight: 'bold', color: colors.secondary }}>${prices[0].amount}</div>;
        }
        
        const minPrice = Math.min(...prices.map(p => p.amount));
        const maxPrice = Math.max(...prices.map(p => p.amount));
        
        return (
          <div>
            <div style={{ fontWeight: 'bold', color: colors.secondary }}>${minPrice} - ${maxPrice}</div>
            <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>
              {prices.map((p, i) => <div key={i}>{p.name}: ${p.amount}</div>)}
            </div>
          </div>
        );
      
      case 'duration_minutes':
        return (
          <div>
            {value} min
            {product.staff_required > 1 && (
              <div style={{ fontSize: '0.8rem', color: '#999' }}>👥 {product.staff_required} staff</div>
            )}
          </div>
        );
      
      case 'difficulty_level':
        return (
          <span style={{ 
            background: value === 'Beginner' ? '#d4edda' : value === 'Intermediate' ? '#fff3cd' : '#f8d7da',
            color: value === 'Beginner' ? '#155724' : value === 'Intermediate' ? '#856404' : '#721c24',
            padding: '4px 8px', 
            borderRadius: '4px', 
            fontSize: '0.85rem', 
            fontWeight: '500' 
          }}>
            {value}
          </span>
        );
      
      case 'availability_status':
        return (
          <span style={{ 
            background: value === 'Available' ? '#d4edda' : value === 'Unavailable' ? '#f8d7da' : '#fff3cd',
            color: value === 'Available' ? '#155724' : value === 'Unavailable' ? '#721c24' : '#856404',
            padding: '4px 8px', 
            borderRadius: '4px', 
            fontSize: '0.85rem', 
            fontWeight: '500' 
          }}>
            {value}
          </span>
        );
      
      case 'is_active':
        return (
          <span style={{ 
            background: value ? colors.secondary : '#ccc', 
            color: text.primary, 
            padding: '4px 8px', 
            borderRadius: '4px', 
            fontSize: '0.85rem', 
            fontWeight: 'bold' 
          }}>
            {value ? 'Active' : 'Inactive'}
          </span>
        );
      
      case 'description':
        return value ? (value.length > 60 ? value.substring(0, 60) + '...' : value) : '-';
      
      case 'staff_required':
        return value ? `${value} staff` : '-';
      
      case 'required_materials':
        const materials = Array.isArray(value) ? value : 
                         typeof value === 'string' ? (() => { try { return JSON.parse(value); } catch { return []; } })() : [];
        return materials.length > 0 ? materials.join(', ') : '-';
      
      default:
        return value !== null && value !== undefined ? String(value) : '-';
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortColumn) return 0;
    let aVal = a[sortColumn] ?? '';
    let bVal = b[sortColumn] ?? '';
    // Handle price as number
    if (sortColumn === 'price') {
      const getPriceValue = (p) => {
        if (Array.isArray(p)) return Math.min(...p.map(x => x.amount || 0));
        if (typeof p === 'string') {
          try { const parsed = JSON.parse(p); return Math.min(...parsed.map(x => x.amount || 0)); }
          catch { return parseFloat(p) || 0; }
        }
        return parseFloat(p) || 0;
      };
      aVal = getPriceValue(aVal);
      bVal = getPriceValue(bVal);
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
    color: text.primary,
    cursor: sortEnabled ? 'pointer' : 'default',
    userSelect: 'none'
  });

  return (
    <div className="dashboardContainer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.8rem', margin: 0, color: text.primary, flex: 1, minWidth: '150px' }}>{productsConfig.title}</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
          {/* Column Selector */}
          <div style={{ position: 'relative', display: 'flex' }}>
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              style={{
                padding: '7px 12px',
                background: button.secondaryBg,
                color: text.primary,
                border: `1px solid ${button.secondaryBorder}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxSizing: 'border-box'
              }}
            >
              📊 Columns ({visibleColumns.length}/{ALL_PRODUCT_COLUMNS.length})
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
                  <button onClick={selectAllColumns} style={{ flex: 1, padding: '6px', fontSize: '0.8rem', background: button.primaryBg, color: text.primary, border: 'none', borderRadius: '4px', cursor: 'pointer' }}>All</button>
                  <button onClick={selectMinColumns} style={{ flex: 1, padding: '6px', fontSize: '0.8rem', background: button.secondaryBg, color: text.primary, border: `1px solid ${button.secondaryBorder}`, borderRadius: '4px', cursor: 'pointer' }}>Min</button>
                </div>
                {ALL_PRODUCT_COLUMNS.map(col => (
                  <label key={col} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '10px 12px', 
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    color: '#1B1B1B'
                  }}>
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(col)}
                      onChange={() => toggleColumn(col)}
                      style={{ marginRight: '10px' }}
                    />
                    {formatColumnName(col)}
                  </label>
                ))}
              </div>
            )}
          </div>
          {showRefresh && (
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="refreshBtn"
              style={{
                padding: '10px 20px',
                background: button.primaryBg,
                color: button.primaryText,
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
            onMouseEnter={(e) => !loading && (e.target.style.background = button.primaryHover)}
            onMouseLeave={(e) => !loading && (e.target.style.background = button.primaryBg)}
            title="Refresh product data"
          >
            {loading ? loadingBtn : refreshBtn}
          </button>
        )}
        </div>
      </div>
      
      <div className="info" style={{ marginBottom: '30px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
        <p style={{ margin: 0, fontSize: '0.95rem' }}>📦 Total Products: <strong>{products.length}</strong> | 📁 Table: <strong>{tableName}</strong></p>
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
          Loading products...
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="quickActions">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', minWidth: visibleColumns.length > 4 ? '1000px' : '600px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  {visibleColumns.map(col => (
                    <th key={col} style={headerStyle(col)} onClick={() => handleSort(col)}>
                      {formatColumnName(col)}{getSortIndicator(col)}
                    </th>
                  ))}
                  {isEditable && (
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1B1B1B' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => (
                  <tr key={product.product_id} style={{ borderBottom: '1px solid #eee' }}>
                    {visibleColumns.map(col => (
                      <td key={col} style={{ padding: '12px', color: col === 'product_id' ? '#666' : '#1B1B1B' }}>
                        {renderProductCell(product, col)}
                      </td>
                    ))}
                    {isEditable && (
                      <td style={{ padding: '12px' }}>
                        <button 
                          onClick={() => handleEdit(product)}
                          style={{ 
                            cursor: 'pointer', 
                            background: 'none', 
                            border: 'none',
                            fontSize: '1.1rem',
                            padding: 0
                          }}
                          title={`Edit ${product.product_name}`}
                        >
                          ✏️
                        </button>
                        <span style={{ margin: '0 8px', color: '#ccc' }}>|</span>
                        <button 
                          onClick={() => handleDelete(product.product_id, product.product_name)}
                          disabled={deleting}
                          style={{ 
                            cursor: deleting ? 'not-allowed' : 'pointer', 
                            background: 'none', 
                            border: 'none',
                            fontSize: '1.1rem',
                            padding: 0,
                            opacity: deleting ? 0.6 : 1
                          }}
                          title={`Delete ${product.product_name}`}
                        >
                          🗑️
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && products.length === 0 && !error && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666', background: '#f9f9f9', borderRadius: '4px' }}>
          No products found in the database
        </div>
      )}

      {isEditable && (
        <button 
          className="actionBtn" 
          style={{ marginTop: '30px' }}
          onClick={handleAddNew}
        >
          + {productsConfig.add_btn}
        </button>
      )}

      {/* Edit/Add Modal */}
      {showModal && editingProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '700px',
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0, color: '#1B1B1B', marginBottom: '25px', fontSize: '1.5rem' }}>
              {isAddingNew ? '➕ Add New Product' : `✏️ Edit Product: ${editingProduct.product_name}`}
            </h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#1B1B1B' }}>
                Product Name <span style={{ color: 'red' }}>*</span>
              </label>
              <input 
                type="text" 
                value={editingProduct.product_name || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, product_name: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '1rem', color: '#1B1B1B' }}
                placeholder="e.g., Basic Haircut"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#1B1B1B' }}>
                Category <span style={{ color: 'red' }}>*</span>
              </label>
              <select 
                value={editingProduct.category || 'Cutting'}
                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '1rem', color: '#1B1B1B' }}
              >
                <option value="Cutting">Cutting</option>
                <option value="Coloring">Coloring</option>
                <option value="Styling">Styling</option>
                <option value="Treatments">Treatments</option>
                <option value="Extensions">Extensions</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#1B1B1B' }}>Description</label>
              <textarea 
                value={editingProduct.description || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', minHeight: '80px', fontSize: '1rem', color: '#1B1B1B' }}
                placeholder="What's included in this service..."
              />
            </div>

            {/* Price Tiers */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1B1B1B' }}>
                Price Tiers <span style={{ color: 'red' }}>*</span>
              </label>
              {editingProduct.price && editingProduct.price.map((tier, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    value={tier.name || ''}
                    onChange={(e) => updatePriceTier(index, 'name', e.target.value)}
                    placeholder="e.g., Short Hair"
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.95rem', color: '#1B1B1B' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontWeight: 'bold', color: '#1B1B1B' }}>$</span>
                    <input 
                      type="number" 
                      value={tier.amount || 0}
                      onChange={(e) => updatePriceTier(index, 'amount', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      style={{ width: '100px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.95rem', color: '#1B1B1B' }}
                    />
                  </div>
                  {editingProduct.price.length > 1 && (
                    <button 
                      onClick={() => removePriceTier(index)}
                      style={{ 
                        background: '#ff4444', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        padding: '8px 12px', 
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                      title="Remove price tier"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button 
                onClick={addPriceTier}
                style={{ 
                  background: '#D4AF37', 
                  color: '#1B1B1B', 
                  border: 'none', 
                  borderRadius: '4px', 
                  padding: '8px 16px', 
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  marginTop: '5px'
                }}
              >
                + Add Price Tier
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#1B1B1B' }}>
                  Duration (minutes) <span style={{ color: 'red' }}>*</span>
                </label>
                <input 
                  type="number" 
                  value={editingProduct.duration_minutes || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, duration_minutes: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '1rem', color: '#1B1B1B' }}
                  min="1"
                  placeholder="30"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#1B1B1B' }}>
                  Staff Required
                </label>
                <input 
                  type="number" 
                  value={editingProduct.staff_required || 1}
                  onChange={(e) => setEditingProduct({ ...editingProduct, staff_required: parseInt(e.target.value) || 1 })}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '1rem', color: '#1B1B1B' }}
                  min="1"
                  placeholder="1"
                />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#1B1B1B' }}>
                Difficulty Level
              </label>
              <select 
                value={editingProduct.difficulty_level || 'Intermediate'}
                onChange={(e) => setEditingProduct({ ...editingProduct, difficulty_level: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '1rem', color: '#1B1B1B' }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Required Materials */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1B1B1B' }}>
                Required Materials
              </label>
              {editingProduct.required_materials && editingProduct.required_materials.length > 0 ? (
                editingProduct.required_materials.map((material, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      value={material || ''}
                      onChange={(e) => updateMaterial(index, e.target.value)}
                      placeholder="e.g., Hair dye, Developer, Gloves"
                      style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.95rem', color: '#1B1B1B' }}
                    />
                    <button 
                      onClick={() => removeMaterial(index)}
                      style={{ 
                        background: '#ff4444', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        padding: '8px 12px', 
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                      title="Remove material"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ color: '#999', fontSize: '0.9rem', margin: '5px 0' }}>No materials added yet</p>
              )}
              <button 
                onClick={addMaterial}
                style={{ 
                  background: '#D4AF37', 
                  color: '#1B1B1B', 
                  border: 'none', 
                  borderRadius: '4px', 
                  padding: '8px 16px', 
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  marginTop: '5px'
                }}
              >
                + Add Material
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#1B1B1B' }}>
                Availability Status
              </label>
              <select 
                value={editingProduct.availability_status || 'Available'}
                onChange={(e) => setEditingProduct({ ...editingProduct, availability_status: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '1rem', color: '#1B1B1B' }}
              >
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
                <option value="Special Request">Special Request</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={editingProduct.is_active || false}
                  onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 'bold', color: '#1B1B1B', fontSize: '1rem' }}>Active (Show in catalog)</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button 
                onClick={handleSaveEdit}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#D4AF37',
                  color: '#1B1B1B',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                {isAddingNew ? '✅ Create Product' : '💾 Save Changes'}
              </button>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                  setIsAddingNew(false);
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#ccc',
                  color: '#1B1B1B',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
