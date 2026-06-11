import { useState, useRef, useEffect } from 'react';

export default function ColumnSelector({ allColumns, visibleColumns, onToggle, onSelectAll, onSelectMin, formatColumnName }) {
  const [open, setOpen] = useState(false);
  const [fixedStyle, setFixedStyle] = useState(null);
  const btnRef = useRef(null);

  const handleToggle = () => {
    if (!open && btnRef.current && typeof window !== 'undefined' && window.innerWidth < 768) {
      const rect = btnRef.current.getBoundingClientRect();
      setFixedStyle({ top: rect.bottom + 4 });
    } else {
      setFixedStyle(null);
    }
    setOpen(o => !o);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (btnRef.current && !btnRef.current.closest('[data-col-selector]')?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);

  const dropdownStyle = fixedStyle ? {
    position: 'fixed',
    top: fixedStyle.top,
    left: 8,
    right: 8,
    width: 'auto',
    marginTop: 0,
  } : {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '5px',
    minWidth: '220px',
  };

  return (
    <div style={{ position: 'relative', display: 'flex' }} data-col-selector>
      <button
        ref={btnRef}
        onClick={handleToggle}
        style={{
          padding: '7px 12px',
          background: '#f5f5f5',
          color: '#1B1B1B',
          border: '1px solid #ddd',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        📊 Columns ({visibleColumns.length}/{allColumns.length})
      </button>

      {open && (
        <div style={{
          ...dropdownStyle,
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxHeight: '60vh',
          overflowY: 'auto',
        }}>
          <div style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', gap: '8px' }}>
            <button onClick={onSelectAll} style={{ flex: 1, padding: '6px', fontSize: '0.8rem', background: '#D4AF37', color: '#1B1B1B', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>All</button>
            <button onClick={onSelectMin} style={{ flex: 1, padding: '6px', fontSize: '0.8rem', background: '#f5f5f5', color: '#1B1B1B', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>Min</button>
          </div>
          {allColumns.map(col => (
            <label key={col} style={{ display: 'block', padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', color: '#1B1B1B', fontSize: '0.9rem', lineHeight: '1.4', textAlign: 'left' }}>
              <input type="checkbox" checked={visibleColumns.includes(col)} onChange={() => onToggle(col)} style={{ width: 18, height: 18, marginRight: 10, verticalAlign: 'middle', cursor: 'pointer' }} />
              <span style={{ verticalAlign: 'middle' }}>{formatColumnName(col)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
