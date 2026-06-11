import { useState, useEffect, useMemo } from 'react';
import staticConfig from '../../../config/admin.json';

const AUTO_GENERATED_FIELDS = ['id', 'created_at', 'updated_at', 'appointment_id'];

const STATUS_STYLES = {
  pending:   { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  confirmed: { bg: '#DBEAFE', color: '#1E40AF', label: 'Confirmed' },
  completed: { bg: '#D1FAE5', color: '#065F46', label: 'Completed' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
  no_show:   { bg: '#F3F4F6', color: '#374151', label: 'No Show' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: '#F3F4F6', color: '#374151', label: status || 'Unknown' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: 700,
      background: s.bg,
      color: s.color,
      textTransform: 'capitalize',
      whiteSpace: 'nowrap',
    }}>{s.label}</span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function toDateKey(dateStr) {
  if (!dateStr) return '';
  return String(dateStr).split('T')[0];
}

function isSameDay(dateStr, date) {
  return toDateKey(dateStr) === date.toISOString().split('T')[0];
}

// ── Card used in List and Week views ──────────────────────────────────────────
function ApptCard({ appt, onEdit, onDelete, onView, compact = false }) {
  const s = STATUS_STYLES[appt.status] || STATUS_STYLES.pending;
  return (
    <div style={{
      background: 'white',
      border: `1px solid ${s.bg}`,
      borderLeft: `4px solid ${s.color}`,
      borderRadius: '8px',
      padding: compact ? '8px 10px' : '14px 16px',
      marginBottom: compact ? '6px' : '10px',
      display: 'flex',
      flexDirection: compact ? 'row' : 'column',
      gap: compact ? '8px' : '6px',
      alignItems: compact ? 'center' : 'flex-start',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1B1B1B', fontFamily: 'monospace' }}>
          #{appt.appointment_id || appt.id}
        </span>
        <StatusBadge status={appt.status} />
        {!compact && appt.appointment_time && (
          <span style={{ fontSize: '0.8rem', color: '#666' }}>
            🕐 {formatTime(appt.appointment_time)}
            {appt.duration ? ` · ${appt.duration} min` : ''}
          </span>
        )}
        {compact && (
          <span style={{ fontSize: '0.78rem', color: '#888' }}>
            {formatTime(appt.appointment_time)}
          </span>
        )}
      </div>

      {!compact && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#555' }}>
          {appt.appointment_date && (
            <span>📅 {formatDate(appt.appointment_date)}</span>
          )}
          {appt.total_amount && (
            <span>💰 ${parseFloat(appt.total_amount).toFixed(2)}</span>
          )}
          {appt.payment_status && (
            <span style={{ textTransform: 'capitalize' }}>💳 {appt.payment_status}</span>
          )}
          {appt.notes && (
            <span style={{ color: '#888', fontStyle: 'italic' }}>"{appt.notes}"</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexShrink: 0 }}>
        <button onClick={() => onView && onView(appt)} title="View"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '2px 4px' }}>👁️</button>
        <button onClick={() => onDelete(appt)} title="Delete"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '2px 4px' }}>🗑️</button>
      </div>
    </div>
  );
}

// ── Month calendar view ───────────────────────────────────────────────────────
function MonthView({ appointmentsByDate, calendarDate, setCalendarDate, onDayClick }) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button onClick={prevMonth} style={navBtnStyle}>‹</button>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1B1B1B' }}>
          {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={nextMonth} style={navBtnStyle}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#999', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const appts = appointmentsByDate[dateKey] || [];
          const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

          return (
            <div key={day} onClick={() => appts.length > 0 && onDayClick(dateKey, appts)}
              style={{
                minHeight: '70px',
                background: isToday ? '#FEF9EC' : 'white',
                border: isToday ? '2px solid #D4AF37' : '1px solid #eee',
                borderRadius: '8px',
                padding: '6px',
                cursor: appts.length > 0 ? 'pointer' : 'default',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => appts.length > 0 && (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ fontWeight: isToday ? 800 : 500, fontSize: '0.85rem', color: isToday ? '#D4AF37' : '#1B1B1B', marginBottom: '4px' }}>{day}</div>
              {appts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {appts.slice(0, 2).map(a => {
                    const s = STATUS_STYLES[a.status] || STATUS_STYLES.pending;
                    return (
                      <div key={a.id} style={{
                        background: s.bg,
                        color: s.color,
                        borderRadius: '4px',
                        padding: '1px 5px',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {formatTime(a.appointment_time)} {a.appointment_id || `#${a.id}`}
                      </div>
                    );
                  })}
                  {appts.length > 2 && (
                    <div style={{ fontSize: '0.65rem', color: '#888', paddingLeft: '5px' }}>+{appts.length - 2} more</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Week view ─────────────────────────────────────────────────────────────────
function WeekView({ appointmentsByDate, calendarDate, setCalendarDate, onEdit, onDelete, onView }) {
  // Get Monday of current week
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const weekStart = getWeekStart(calendarDate);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const prevWeek = () => { const d = new Date(calendarDate); d.setDate(d.getDate() - 7); setCalendarDate(d); };
  const nextWeek = () => { const d = new Date(calendarDate); d.setDate(d.getDate() + 7); setCalendarDate(d); };
  const today = new Date();

  const weekLabel = `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div>
      {/* Week nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button onClick={prevWeek} style={navBtnStyle}>‹</button>
        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1B1B1B' }}>{weekLabel}</span>
        <button onClick={nextWeek} style={navBtnStyle}>›</button>
      </div>

      <div className="weekViewOuter">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', minWidth: '560px' }}>
        {days.map((day, i) => {
          const dateKey = day.toISOString().split('T')[0];
          const appts = (appointmentsByDate[dateKey] || []).sort((a, b) =>
            (a.appointment_time || '').localeCompare(b.appointment_time || '')
          );
          const isToday = isSameDay(day.toISOString(), today);

          return (
            <div key={i} style={{
              background: isToday ? '#FEF9EC' : '#fafafa',
              border: isToday ? '2px solid #D4AF37' : '1px solid #eee',
              borderRadius: '10px',
              padding: '10px 8px',
              minHeight: '140px',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#999', textTransform: 'uppercase' }}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div style={{
                  fontSize: '1.2rem', fontWeight: 800,
                  color: isToday ? '#D4AF37' : '#1B1B1B',
                  lineHeight: 1.2,
                }}>{day.getDate()}</div>
              </div>

              {appts.length === 0 ? (
                <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#ccc', marginTop: '16px' }}>—</div>
              ) : (
                appts.map(a => <ApptCard key={a.id} appt={a} onEdit={onEdit} onDelete={onDelete} onView={onView} compact />)
              )}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

const navBtnStyle = {
  background: '#f5f5f5',
  border: '1px solid #ddd',
  borderRadius: '6px',
  padding: '6px 14px',
  cursor: 'pointer',
  fontSize: '1.2rem',
  color: '#1B1B1B',
  fontWeight: 700,
  lineHeight: 1,
};

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminAppointments({ refreshKey = 0 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableName, setTableName] = useState('appointments');
  const [config, setConfig] = useState(staticConfig.admin?.appointments || {});
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // View & filter state
  const [view, setView] = useState('list'); // 'list' | 'week' | 'month'
  const [filterPeriod, setFilterPeriod] = useState('upcoming'); // 'today' | 'week' | 'month' | 'upcoming' | 'all'
  const [filterStatus, setFilterStatus] = useState('all');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [drillDay, setDrillDay] = useState(null); // { dateKey, appts } for month drill-down

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) { setError('No authentication token.'); setLoading(false); return; }

      try {
        const configRes = await fetch('/api/config', { headers: { Authorization: `Bearer ${token}` } });
        if (configRes.ok) {
          const freshConfig = await configRes.json();
          const tab = freshConfig.admin?.tabs?.find(t => t.id === 'appointments');
          setTableName(tab?.table || 'appointments');
          setConfig(freshConfig.admin?.appointments || {});
        }
      } catch (e) { console.error('Config load failed:', e); }

      const res = await fetch(`/api/admin/users?table=${tableName}&t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to fetch');
      const result = await res.json();
      setData(Array.isArray(result) ? result : result.orders || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => { setEditingItem({ ...item }); setShowModal(true); };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const idField = Object.keys(editingItem).find(k => k === 'id' || k.endsWith('_id'));
      const res = await fetch(`/api/admin/users?table=${tableName}&id=${editingItem[idField]}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      setShowModal(false); setEditingItem(null); await fetchData();
    } catch (err) { alert('Error saving: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    const idField = Object.keys(item).find(k => k === 'id' || k.endsWith('_id'));
    if (!confirm(`Delete appointment ${item.appointment_id || item[idField]}?`)) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/users?table=${tableName}&id=${item[idField]}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed');
      await fetchData();
    } catch (err) { alert('Error deleting: ' + err.message); }
    finally { setDeleting(false); }
  };

  // ── Filter + stats ──────────────────────────────────────────────────────────
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const filteredData = useMemo(() => {
    let r = [...data];

    if (filterStatus !== 'all') r = r.filter(a => a.status === filterStatus);

    if (filterPeriod === 'today') {
      r = r.filter(a => { const d = new Date(toDateKey(a.appointment_date)); d.setHours(0,0,0,0); return d.getTime() === today.getTime(); });
    } else if (filterPeriod === 'week') {
      const end = new Date(today); end.setDate(today.getDate() + 7);
      r = r.filter(a => { const d = new Date(toDateKey(a.appointment_date)); return d >= today && d <= end; });
    } else if (filterPeriod === 'month') {
      r = r.filter(a => { const d = new Date(toDateKey(a.appointment_date)); return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(); });
    } else if (filterPeriod === 'upcoming') {
      r = r.filter(a => new Date(toDateKey(a.appointment_date)) >= today);
    }

    return r.sort((a, b) => new Date(toDateKey(a.appointment_date)) - new Date(toDateKey(b.appointment_date)));
  }, [data, filterStatus, filterPeriod, today]);

  const appointmentsByDate = useMemo(() => {
    const map = {};
    // Use all data (unfiltered by period) so calendar shows everything
    const base = filterStatus !== 'all' ? data.filter(a => a.status === filterStatus) : data;
    base.forEach(a => {
      const k = toDateKey(a.appointment_date);
      if (!map[k]) map[k] = [];
      map[k].push(a);
    });
    return map;
  }, [data, filterStatus]);

  const stats = useMemo(() => {
    const todayKey = today.toISOString().split('T')[0];
    const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);
    return {
      today: data.filter(a => toDateKey(a.appointment_date) === todayKey).length,
      week: data.filter(a => { const d = new Date(toDateKey(a.appointment_date)); return d >= today && d <= weekEnd; }).length,
      upcoming: data.filter(a => new Date(toDateKey(a.appointment_date)) >= today).length,
      total: data.length,
    };
  }, [data, today]);

  const allColumns = data.length > 0 ? Object.keys(data[0]) : [];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="dashboardContainer">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#1B1B1B' }}>Appointments</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '8px', padding: '3px', border: '1px solid #ddd' }}>
            {[['list','☰ List'],['week','⬜ Week'],['month','📅 Month']].map(([v, label]) => (
              <button key={v} onClick={() => { setView(v); setDrillDay(null); }}
                style={{
                  padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.85rem',
                  background: view === v ? '#D4AF37' : 'transparent',
                  color: view === v ? '#1B1B1B' : '#666',
                  transition: 'all 0.15s',
                }}>{label}</button>
            ))}
          </div>

          <button onClick={fetchData} disabled={loading}
            style={{ padding: '8px 18px', background: '#D4AF37', color: '#1B1B1B', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: loading ? 0.6 : 1 }}>
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="apptStatsGrid">
        {[
          { label: 'Today', value: stats.today, accent: '#D4AF37' },
          { label: 'This Week', value: stats.week, accent: '#3B82F6' },
          { label: 'Upcoming', value: stats.upcoming, accent: '#10B981' },
          { label: 'Total', value: stats.total, accent: '#6B7280' },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: accent, lineHeight: 1.2, marginTop: '4px' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters (list view only) */}
      {view === 'list' && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
          {/* Period filter */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[['today','Today'],['week','This Week'],['month','This Month'],['upcoming','Upcoming'],['all','All']].map(([v, label]) => (
              <button key={v} onClick={() => setFilterPeriod(v)}
                style={{
                  padding: '5px 14px', borderRadius: '999px', border: '1px solid', cursor: 'pointer',
                  fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.15s',
                  background: filterPeriod === v ? '#1B1B1B' : 'white',
                  color: filterPeriod === v ? 'white' : '#555',
                  borderColor: filterPeriod === v ? '#1B1B1B' : '#ddd',
                }}>{label}</button>
            ))}
          </div>

          <div style={{ width: '1px', background: '#ddd', height: '24px', margin: '0 4px' }} />

          {/* Status filter */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[['all','All'], ...Object.entries(STATUS_STYLES).map(([k, v]) => [k, v.label])].map(([v, label]) => {
              const s = STATUS_STYLES[v];
              return (
                <button key={v} onClick={() => setFilterStatus(v)}
                  style={{
                    padding: '5px 14px', borderRadius: '999px', border: '1px solid', cursor: 'pointer',
                    fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.15s',
                    background: filterStatus === v ? (s?.bg || '#1B1B1B') : 'white',
                    color: filterStatus === v ? (s?.color || 'white') : '#555',
                    borderColor: filterStatus === v ? (s?.color || '#1B1B1B') : '#ddd',
                  }}>{label}</button>
              );
            })}
          </div>
        </div>
      )}

      {/* Status filter for calendar views */}
      {view !== 'list' && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {[['all','All'], ...Object.entries(STATUS_STYLES).map(([k, v]) => [k, v.label])].map(([v, label]) => {
            const s = STATUS_STYLES[v];
            return (
              <button key={v} onClick={() => setFilterStatus(v)}
                style={{
                  padding: '4px 12px', borderRadius: '999px', border: '1px solid', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 600,
                  background: filterStatus === v ? (s?.bg || '#1B1B1B') : 'white',
                  color: filterStatus === v ? (s?.color || 'white') : '#555',
                  borderColor: filterStatus === v ? (s?.color || '#1B1B1B') : '#ddd',
                }}>{label}</button>
            );
          })}
        </div>
      )}

      {error && (
        <div style={{ padding: '16px', background: '#fff3f3', border: '1px solid #ffcdd2', borderRadius: '8px', marginBottom: '16px', color: '#c62828' }}>
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>Loading appointments…</div>
      )}

      {/* ── LIST VIEW ── */}
      {!loading && view === 'list' && (
        <div>
          {filteredData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999', background: '#fafafa', borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📅</div>
              <p style={{ margin: 0, fontWeight: 600 }}>No appointments found</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>Try adjusting the filters above</p>
            </div>
          ) : (
            (() => {
              // Group by date
              const groups = {};
              filteredData.forEach(a => {
                const k = toDateKey(a.appointment_date);
                if (!groups[k]) groups[k] = [];
                groups[k].push(a);
              });
              return Object.entries(groups).map(([dateKey, appts]) => (
                <div key={dateKey} style={{ marginBottom: '20px' }}>
                  <div style={{
                    padding: '6px 12px',
                    background: '#f5f5f5',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#555',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span>{formatDate(dateKey + 'T12:00:00')}</span>
                    <span style={{ background: '#D4AF37', color: '#1B1B1B', borderRadius: '999px', padding: '1px 8px', fontSize: '0.72rem' }}>
                      {appts.length} appt{appts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {appts.map(a => <ApptCard key={a.id} appt={a} onEdit={handleEdit} onDelete={handleDelete} onView={setViewingItem} />)}
                </div>
              ));
            })()
          )}
        </div>
      )}

      {/* ── WEEK VIEW ── */}
      {!loading && view === 'week' && (
        <WeekView
          appointmentsByDate={appointmentsByDate}
          calendarDate={calendarDate}
          setCalendarDate={setCalendarDate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={setViewingItem}
        />
      )}

      {/* ── MONTH VIEW ── */}
      {!loading && view === 'month' && !drillDay && (
        <MonthView
          appointmentsByDate={appointmentsByDate}
          calendarDate={calendarDate}
          setCalendarDate={setCalendarDate}
          onDayClick={(dateKey, appts) => setDrillDay({ dateKey, appts })}
        />
      )}

      {/* Month drill-down */}
      {!loading && view === 'month' && drillDay && (
        <div>
          <button onClick={() => setDrillDay(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#D4AF37', fontWeight: 700, marginBottom: '16px', fontSize: '0.9rem' }}>
            ← Back to {new Date(calendarDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </button>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1B1B1B', marginBottom: '12px' }}>
            📅 {formatDate(drillDay.dateKey + 'T12:00:00')}
            <span style={{ marginLeft: '10px', fontSize: '0.85rem', color: '#999', fontWeight: 400 }}>
              {drillDay.appts.length} appointment{drillDay.appts.length !== 1 ? 's' : ''}
            </span>
          </div>
          {drillDay.appts
            .sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''))
            .map(a => <ApptCard key={a.id} appt={a} onEdit={handleEdit} onDelete={handleDelete} onView={setViewingItem} />)}
        </div>
      )}

      {/* ── VIEW MODAL ── */}
      {viewingItem && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={(e) => e.target === e.currentTarget && setViewingItem(null)}
        >
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', width: '90%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, color: '#1B1B1B' }}>👁️ Appointment</h3>
                <StatusBadge status={viewingItem.status} />
              </div>
              <button onClick={() => setViewingItem(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#666', padding: '0 4px', lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.keys(viewingItem).map(col => {
                let val = viewingItem[col];
                if (val == null) val = '—';
                else if (col.includes('date')) val = formatDate(val);
                else if (col.includes('time') && !col.includes('created')) val = formatTime(val);
                else val = String(val);
                const isAuto = AUTO_GENERATED_FIELDS.includes(col.toLowerCase());
                return (
                  <div key={col} style={{ display: 'flex', gap: '12px', padding: '9px 12px', background: isAuto ? '#f9f9f9' : '#fff', borderRadius: '6px', border: '1px solid #eee' }}>
                    <span style={{ minWidth: '140px', fontWeight: 'bold', color: '#D4AF37', fontSize: '0.82rem', flexShrink: 0, textTransform: 'capitalize' }}>{col.replace(/_/g, ' ')}</span>
                    <span style={{ color: '#333', wordBreak: 'break-word', fontSize: '0.88rem' }}>{val}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => { setViewingItem(null); handleEdit(viewingItem); }}
                style={{ padding: '10px 20px', background: '#D4AF37', color: '#1B1B1B', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => setViewingItem(null)}
                style={{ padding: '10px 20px', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {showModal && editingItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '28px', width: '90%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1B1B1B' }}>✏️ Edit Appointment</h3>
              <div style={{ background: '#f5f5f5', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: '#666', fontFamily: 'monospace' }}>
                {editingItem.appointment_id || `#${editingItem.id}`}
              </div>
            </div>

            {/* Read-only meta */}
            <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '10px 14px', marginBottom: '18px', fontSize: '0.82rem', color: '#666', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span><strong>ID:</strong> {editingItem.id}</span>
              <span><strong>Created:</strong> {editingItem.created_at ? new Date(editingItem.created_at).toLocaleDateString() : '—'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {allColumns
                .filter(col => !AUTO_GENERATED_FIELDS.includes(col.toLowerCase()))
                .map(col => {
                  const isDate = col.includes('date');
                  const isTime = col.includes('time');
                  const isNumber = col.includes('amount') || col.includes('duration') || col.includes('deposit');
                  const isBoolean = col.startsWith('is_') || ['deposit_required', 'deposit_paid', 'reminder_sent', 'confirmation_sent'].includes(col);
                  const isSelect = col === 'status';
                  const isTextArea = col.includes('notes') || col.includes('reason');

                  return (
                    <div key={col}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '0.85rem', color: '#1B1B1B', textTransform: 'capitalize' }}>
                        {col.replace(/_/g, ' ')}
                      </label>
                      {isSelect ? (
                        <select value={editingItem[col] || ''} onChange={e => setEditingItem({ ...editingItem, [col]: e.target.value })}
                          style={{ width: '100%', padding: '9px', border: '1px solid #ddd', borderRadius: '6px', color: '#1B1B1B', fontSize: '0.9rem' }}>
                          {['pending','confirmed','completed','cancelled','no_show'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : isBoolean ? (
                        <select value={editingItem[col] ? 'true' : 'false'} onChange={e => setEditingItem({ ...editingItem, [col]: e.target.value === 'true' })}
                          style={{ width: '100%', padding: '9px', border: '1px solid #ddd', borderRadius: '6px', color: '#1B1B1B', fontSize: '0.9rem' }}>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      ) : isTextArea ? (
                        <textarea value={editingItem[col] || ''} rows={2} onChange={e => setEditingItem({ ...editingItem, [col]: e.target.value })}
                          style={{ width: '100%', padding: '9px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical', color: '#1B1B1B', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                      ) : (
                        <input type={isDate ? 'date' : isTime ? 'time' : isNumber ? 'number' : 'text'}
                          value={isDate ? toDateKey(editingItem[col]) : (editingItem[col] || '')}
                          onChange={e => setEditingItem({ ...editingItem, [col]: isNumber ? parseFloat(e.target.value) || '' : e.target.value })}
                          style={{ width: '100%', padding: '9px', border: '1px solid #ddd', borderRadius: '6px', color: '#1B1B1B', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                      )}
                    </div>
                  );
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
              <button onClick={() => { setShowModal(false); setEditingItem(null); }}
                style={{ padding: '9px 20px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding: '9px 20px', background: saving ? '#ccc' : '#D4AF37', border: 'none', borderRadius: '6px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, color: '#1B1B1B' }}>
                {saving ? 'Saving…' : '💾 Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
