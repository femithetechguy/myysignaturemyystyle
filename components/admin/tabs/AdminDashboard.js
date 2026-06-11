import { useState, useEffect } from 'react';
import config from '../../../config/admin.json';

export default function AdminDashboard({ onNavigate }) {
  const adminConfig = config.admin.dashboard;
  const [stats, setStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.stats) setStats(data.stats); })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  return (
    <div className="dashboard">
      <div className="stats">
        {statsLoading ? (
          <p style={{ color: '#666', padding: '20px', gridColumn: '1 / -1' }}>Loading stats...</p>
        ) : stats.map(({ key, label, icon, count }) => (
          <div key={key} className="statCard" onClick={() => onNavigate && onNavigate(key)} style={{ cursor: 'pointer' }}>
            <div className="statIcon">{icon}</div>
            <p className="statNumber">{count === null ? '—' : count}</p>
            <h3>{label}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
