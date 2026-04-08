import { useState, useEffect } from 'react';
import staticConfig from '../../../config/admin.json';

const POLICY_SECTIONS = [
  { key: 'booking',          label: 'Booking Policy',          type: 'points' },
  { key: 'confirmation',     label: 'Appointment Confirmation', type: 'points' },
  { key: 'cancellation',     label: 'Cancellation Policy',      type: 'points' },
  { key: 'deposits',         label: 'Deposits',                 type: 'points' },
  { key: 'late_arrival',     label: 'Late Policy',              type: 'points' },
  { key: 'payment',          label: 'Payment Policy',           type: 'points' },
  { key: 'salon_experience', label: 'Salon Experience',         type: 'points' },
  { key: 'service_guarantee',label: 'Service Guarantee',        type: 'text'   },
  { key: 'promise',          label: 'Our Promise',              type: 'text'   },
];

const DISCLAIMER_FIELDS = [
  { key: 'deposit_note',      label: 'Deposit Note' },
  { key: 'cancellation_note', label: 'Cancellation Note' },
  { key: 'late_policy',       label: 'Late Policy Note' },
  { key: 'confirmation_note', label: 'Confirmation / Consent Note' },
];

export default function AdminPolicies() {
  const config = staticConfig.admin.policies || {};

  const [policies, setPolicies]             = useState(null);
  const [disclaimer, setDisclaimer]         = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [saving, setSaving]                 = useState(null); // 'policies' | 'disclaimer' | null
  const [successMsg, setSuccessMsg]         = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/policies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load');
      const data = await res.json();
      setPolicies(data.salon_policies?.value || null);
      setDisclaimer(data.booking_disclaimer?.value || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const save = async (settingKey, value) => {
    try {
      setSaving(settingKey);
      setSuccessMsg(null);
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/policies', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ setting_key: settingKey, setting_value: value }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save');
      setSuccessMsg(`${settingKey === 'salon_policies' ? 'Policies' : 'Booking disclaimer'} saved!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(null);
    }
  };

  // --- helpers for editing points arrays ---
  const updatePoint = (sectionKey, idx, newVal) => {
    setPolicies(prev => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], points: prev[sectionKey].points.map((p, i) => i === idx ? newVal : p) },
    }));
  };

  const addPoint = (sectionKey) => {
    setPolicies(prev => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], points: [...(prev[sectionKey].points || []), ''] },
    }));
  };

  const removePoint = (sectionKey, idx) => {
    setPolicies(prev => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], points: prev[sectionKey].points.filter((_, i) => i !== idx) },
    }));
  };

  const updateTextField = (sectionKey, newVal) => {
    setPolicies(prev => ({ ...prev, [sectionKey]: { ...prev[sectionKey], text: newVal } }));
  };

  const updateDisclaimerField = (fieldKey, newVal) => {
    setDisclaimer(prev => ({ ...prev, [fieldKey]: newVal }));
  };

  // ---- render ----
  if (loading) return <div className="dashboardContainer"><p>Loading policies...</p></div>;
  if (error)   return <div className="dashboardContainer"><p style={{ color: '#C1666B' }}>Error: {error}</p><button className="actionBtn" onClick={fetchData}>Retry</button></div>;
  if (!policies || !disclaimer) return <div className="dashboardContainer"><p>No policy data found. Run <code>dbquries/business_settings.sql</code> first.</p></div>;

  return (
    <div className="dashboardContainer">
      <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{config.title || 'Salon Policies'}</h2>
      <p style={{ color: '#666', marginBottom: '30px', fontSize: '0.95rem' }}>{config.description}</p>

      {successMsg && (
        <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', color: '#2e7d32', padding: '10px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          ✅ {successMsg}
        </div>
      )}

      {/* ── Booking Disclaimer (modal text) ─────────────────────────── */}
      <div className="quickActions" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '4px' }}>📋 Booking Modal Disclaimer</h3>
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '16px' }}>Shown to customers inside the booking modal before they confirm.</p>
        {DISCLAIMER_FIELDS.map(({ key, label }) => (
          <div key={key} style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '5px' }}>{label}</label>
            <textarea
              value={disclaimer[key] || ''}
              onChange={e => updateDisclaimerField(key, e.target.value)}
              rows={2}
              className="filterSelect"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
        ))}
        <button
          className="actionBtn"
          disabled={saving === 'booking_disclaimer'}
          onClick={() => save('booking_disclaimer', disclaimer)}
          style={{ marginTop: '8px' }}
        >
          {saving === 'booking_disclaimer' ? config.saving_btn || 'Saving...' : config.save_btn || '💾 Save Changes'}
        </button>
      </div>

      {/* ── Full Salon Policies ──────────────────────────────────────── */}
      <div className="quickActions">
        <h3 style={{ marginBottom: '4px' }}>🏛️ Full Salon Policies</h3>
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '20px' }}>Displayed on the website policies page / modal.</p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '5px' }}>Page Title</label>
          <input
            type="text"
            value={policies.title || ''}
            onChange={e => setPolicies(prev => ({ ...prev, title: e.target.value }))}
            className="filterSelect"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '5px' }}>Intro Paragraph</label>
          <textarea
            value={policies.intro || ''}
            onChange={e => setPolicies(prev => ({ ...prev, intro: e.target.value }))}
            rows={3}
            className="filterSelect"
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>

        {POLICY_SECTIONS.map(({ key, label, type }) => {
          const section = policies[key] || {};
          return (
            <div key={key} style={{ borderTop: '1px solid #eee', paddingTop: '18px', marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '12px', color: '#1B1B1B' }}>{label}</h4>

              {type === 'points' && (
                <>
                  {(section.points || []).map((point, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                      <input
                        type="text"
                        value={point}
                        onChange={e => updatePoint(key, idx, e.target.value)}
                        className="filterSelect"
                        style={{ flex: 1 }}
                      />
                      <button
                        onClick={() => removePoint(key, idx)}
                        style={{ background: '#C1666B', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', flexShrink: 0 }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addPoint(key)}
                    style={{ background: '#f5f5f5', border: '1px dashed #ccc', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem', marginTop: '4px' }}
                  >
                    + Add Point
                  </button>
                </>
              )}

              {type === 'text' && (
                <textarea
                  value={section.text || ''}
                  onChange={e => updateTextField(key, e.target.value)}
                  rows={3}
                  className="filterSelect"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              )}
            </div>
          );
        })}

        <button
          className="actionBtn"
          disabled={saving === 'salon_policies'}
          onClick={() => save('salon_policies', policies)}
          style={{ marginTop: '12px' }}
        >
          {saving === 'salon_policies' ? config.saving_btn || 'Saving...' : config.save_btn || '💾 Save Changes'}
        </button>
      </div>
    </div>
  );
}
