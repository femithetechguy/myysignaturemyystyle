import { useState } from 'react';
import config from '../../../config/admin.json';
import { colors, text } from '../AdminThemeProvider';

export default function AdminPages() {
  const [selectedPage, setSelectedPage] = useState(null);
  const pagesConfig = config.admin.pages;

  return (
    <div className="productsSection">
      <div className="productsHeader">
        <h3>{pagesConfig.title}</h3>
        <p>{pagesConfig.description}</p>
      </div>
      
      <div className="productsGrid">
        {Object.entries(config.pages).map(([pageKey, pageData]) => (
          <div
            key={pageKey}
            onClick={() => setSelectedPage(pageKey)}
            className={`productCard ${selectedPage === pageKey ? 'border-2 border-yellow-400' : ''}`}
          >
            <div className="productImage" style={{ background: colors.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '3rem' }}>📄</span>
            </div>
            <div className="productInfo">
              <h4 className="capitalize">{pageKey}</h4>
              <p className="category">{pageData.title}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedPage && (
        <div className="info" style={{ marginTop: '30px' }}>
          <h3 style={{ marginBottom: '15px' }}>{pagesConfig.edit_title}: <strong className="capitalize">{selectedPage}</strong></h3>
          <pre style={{ background: colors.primary, color: colors.secondary, padding: '15px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.85rem' }}>
            {JSON.stringify(config.pages[selectedPage], null, 2)}
          </pre>
          <button className="actionBtn" style={{ marginTop: '15px' }}>{pagesConfig.save_btn}</button>
        </div>
      )}
    </div>
  );
}
