import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { getFontClass } from '../../lib/fontUtils';
import config from '../../config/admin.json';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('adminToken', data.token);
        router.push('/admin');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <>
      <Head>
        <title>Admin Login - {config.app.name}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${config.app.colors.primary} 0%, #2d2d2d 100%)`,
        fontFamily: "'Nunito', sans-serif",
        padding: '20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '450px',
          padding: isMobile ? '30px 20px' : '40px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          borderTop: `4px solid ${config.app.colors.secondary}`
        }}>
          {/* Header with Icon */}
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <div style={{ marginBottom: '15px', fontSize: isMobile ? '3rem' : '4rem' }}>
              {config.adminLogin.icon}
            </div>
            <h1 style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: 'bold',
              color: config.app.colors.primary,
              margin: '0 0 10px 0'
            }}>
              {config.adminLogin.title}
            </h1>
            <p style={{
              marginTop: '10px',
              fontSize: isMobile ? '0.9rem' : '1rem',
              color: config.app.colors.secondary,
              fontWeight: '600'
            }}>
              {config.adminLogin.subtitle}
            </p>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              color: '#c00',
              background: '#fee',
              border: `1px solid #fcc`,
              borderRadius: '8px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: isMobile ? '0.9rem' : '0.95rem',
                fontWeight: '600',
                color: config.app.colors.primary
              }}>
                {config.adminLogin.username_label}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid #e0e0e0`,
                  borderRadius: '8px',
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '16px',
                  minHeight: '44px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = config.app.colors.secondary}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                placeholder={config.adminLogin.username_placeholder}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: isMobile ? '0.9rem' : '0.95rem',
                fontWeight: '600',
                color: config.app.colors.primary
              }}>
                {config.adminLogin.password_label}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid #e0e0e0`,
                  borderRadius: '8px',
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '16px',
                  minHeight: '44px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = config.app.colors.secondary}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                placeholder={config.adminLogin.password_placeholder}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 20px',
                minHeight: '50px',
                fontWeight: '700',
                fontSize: isMobile ? '0.95rem' : '1rem',
                color: config.app.colors.primary,
                background: `linear-gradient(135deg, ${config.app.colors.secondary} 0%, #C99A2D 100%)`,
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                fontFamily: "'Nunito', sans-serif"
              }}
              onMouseEnter={(e) => !loading && !isMobile && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.5)')}
              onMouseLeave={(e) => !loading && !isMobile && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)')}
            >
              {loading ? 'Logging in...' : config.adminLogin.login_btn}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            paddingTop: '20px',
            marginTop: '30px',
            textAlign: 'center',
            borderTop: `1px solid #e0e0e0`
          }}>
            <p style={{
              fontSize: isMobile ? '0.75rem' : '0.8rem',
              color: '#999',
              margin: 0
            }}>
              {config.adminLogin.footer}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
