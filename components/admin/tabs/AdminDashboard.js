import { useState, useEffect } from 'react';
import config from '../../../config/admin.json';

export default function AdminDashboard({ onNavigate }) {
  const adminConfig = config.admin.dashboard;
  const tabs = config.admin.tabs.filter(tab => tab.id !== 'dashboard');
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
      <div className="welcome">
        <h2>{adminConfig.welcome_title}</h2>
        <p>{adminConfig.welcome_text}</p>
      </div>

      <div className="stats">
        {statsLoading ? (
          <p style={{ color: '#666', padding: '20px' }}>Loading stats...</p>
        ) : stats.map(({ key, label, icon, count }) => (
          <div key={key} className="statCard" onClick={() => onNavigate && onNavigate(key)} style={{ cursor: 'pointer' }}>
            <div className="statIcon">{icon}</div>
            <h3>{label}</h3>
            <p className="statNumber">{count === null ? '—' : count}</p>
            <p className="statDesc">Total records</p>
          </div>
        ))}
      </div>

      {/* Dynamic Tab Navigation Cards */}
      <div className="quickActions">
        <h3>📋 Admin Sections</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginTop: '20px'
        }}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => onNavigate && onNavigate(tab.id)}
              style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = '#D4AF37';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(212, 175, 55, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '10px', textAlign: 'center' }}>
                {tab.icon}
              </div>
              <h4 style={{ 
                margin: '0 0 8px 0', 
                color: '#1B1B1B', 
                fontSize: '1.2rem',
                textAlign: 'center'
              }}>
                {tab.label}
              </h4>
              <p style={{ 
                margin: 0, 
                color: '#666', 
                fontSize: '0.9rem',
                textAlign: 'center',
                lineHeight: '1.4'
              }}>
                {tab.description}
              </p>
              {tab.table && (
                <p style={{
                  margin: '10px 0 0 0',
                  fontSize: '0.8rem',
                  color: '#999',
                  textAlign: 'center'
                }}>
                  📁 Table: {tab.table}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="quickActions" style={{ marginTop: '30px' }}>
        <h3>{adminConfig.quick_tips_title}</h3>
        <div className="info">
          {adminConfig.quick_tips.map((tip, idx) => (
            <p key={idx}><strong>{tip.icon} {tip.title}:</strong> {tip.description}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
