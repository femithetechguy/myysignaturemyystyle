import { useState } from 'react';
import config from '../../../config/admin.json';
import { text, button } from '../AdminThemeProvider';

export default function AdminSettings() {
  const [appConfig, setAppConfig] = useState(config.app);
  const settingsConfig = config.admin.settings;

  const handleColorChange = (colorKey, newValue) => {
    setAppConfig({
      ...appConfig,
      colors: {
        ...appConfig.colors,
        [colorKey]: newValue,
      },
    });
  };

  const handleFontChange = (fontKey, newValue) => {
    setAppConfig({
      ...appConfig,
      fonts: {
        ...appConfig.fonts,
        [fontKey]: newValue,
      },
    });
  };

  return (
    <div className="dashboardContainer">
      <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: text.primary }}>{settingsConfig.title}</h2>

      {/* App Name */}
      <div className="quickActions" style={{ marginBottom: '30px' }}>
        <h3>{settingsConfig.app_name_label}</h3>
        <div>
          <input
            type="text"
            value={appConfig.name}
            onChange={(e) => setAppConfig({ ...appConfig, name: e.target.value })}
            className="filterSelect"
            style={{ width: '100%', marginTop: '10px' }}
          />
        </div>
      </div>

      {/* Colors Section */}
      <div className="quickActions" style={{ marginBottom: '30px' }}>
        <h3>{settingsConfig.colors_title}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
          {Object.entries(appConfig.colors).map(([colorKey, colorValue]) => (
            <div key={colorKey}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px', textTransform: 'capitalize' }}>
                {colorKey}
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={colorValue}
                  onChange={(e) => handleColorChange(colorKey, e.target.value)}
                  style={{ width: '50px', height: '40px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={colorValue}
                  onChange={(e) => handleColorChange(colorKey, e.target.value)}
                  className="filterSelect"
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fonts Section */}
      <div className="quickActions">
        <h3>{settingsConfig.fonts_title}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
          {Object.entries(appConfig.fonts).map(([fontKey, fontValue]) => (
            <div key={fontKey}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px', textTransform: 'capitalize' }}>
                {fontKey}
              </label>
              <input
                type="text"
                value={fontValue}
                onChange={(e) => handleFontChange(fontKey, e.target.value)}
                className="filterSelect"
              />
            </div>
          ))}
        </div>
      </div>

      <button className="actionBtn" style={{ marginTop: '30px' }}>{settingsConfig.save_btn}</button>
    </div>
  );
}
