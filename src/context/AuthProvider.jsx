import { useState } from 'react';
import { AuthContext } from './AuthContext';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function authenticate(action, credentials) {
    const response = await fetch(`${API_BASE_URL}/api/auth/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || `Authentication failed (${response.status}).`);
    }
    if (!result.user || !Number.isInteger(result.user.id)) {
      throw new Error('The authentication API returned an invalid user response.');
    }

    setUser(result.user);
    return result.user;
  }

  function login(credentials) {
    return authenticate('login', credentials);
  }

  function register(credentials) {
    return authenticate('register', credentials);
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
