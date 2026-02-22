import { useState } from 'react';

export function useAdminAuth() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [adminName, setAdminName] = useState(null);

  const login = async (username, password) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('adminToken', data.token);
        setIsAuthed(true);
        setAdminName(username);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthed(false);
    setAdminName(null);
  };

  return { isAuthed, adminName, login, logout };
}
