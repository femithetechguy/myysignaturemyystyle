import config from '../../../config/admin.json';

export default function AdminDashboard({ onNavigate }) {
  const adminConfig = config.admin.dashboard;
  const tabs = config.admin.tabs.filter(tab => tab.id !== 'dashboard');
  
  return (
    <div className="dashboard">
      <div className="welcome">
        <h2>{adminConfig.welcome_title}</h2>
        <p>{adminConfig.welcome_text}</p>
      </div>

      <div className="stats">
        <div className="statCard">
          <div className="statIcon">{adminConfig.stats[0].icon}</div>
          <h3>{adminConfig.stats[0].title}</h3>
          <p className="statNumber">{Object.keys(config.database?.tables || {}).length}</p>
          <p className="statDesc">{adminConfig.stats[0].description}</p>
        </div>
        
        <div className="statCard">
          <div className="statIcon">{adminConfig.stats[1].icon}</div>
          <h3>{adminConfig.stats[1].title}</h3>
          <p className="statNumber">{config.admin.tabs.length}</p>
          <p className="statDesc">{adminConfig.stats[1].description}</p>
        </div>
        
        <div className="statCard">
          <div className="statIcon">{adminConfig.stats[2].icon}</div>
          <h3>{adminConfig.stats[2].title}</h3>
          <p className="statNumber">Loaded</p>
          <p className="statDesc">{adminConfig.stats[2].description}</p>
        </div>
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
