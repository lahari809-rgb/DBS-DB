import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEMO_USERS = {
  user: {
    _id: "650c82f91a2b3c4d5e6f7081",
    name: "Ravi Kumar",
    email: "ravi.kumar@example.com",
    role: "user",
    createdAt: "2026-09-17T08:14:33.334842"
  },
  admin: {
    _id: "650c82f91a2b3c4d5e6f7080",
    name: "Admin System",
    email: "admin@signlang.ai",
    role: "admin",
    createdAt: "2026-08-30T08:14:33.334842"
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('signvox_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('signvox_token') || null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('signvox_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('signvox_user');
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('signvox_token', data.token);
        return { success: true, user: data.user };
      }
    } catch (err) {
      console.warn("Backend auth fetch failed, falling back to local demo state", err);
    }

    // Local fallback matching
    const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
    const fallbackUser = {
      _id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: email.split('@')[0].toUpperCase(),
      email: email,
      role: role,
      createdAt: new Date().toISOString()
    };
    setUser(fallbackUser);
    setToken('jwt_' + fallbackUser._id);
    return { success: true, user: fallbackUser };
  };

  const register = async (name, email, role) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        return { success: true, user: data.user };
      }
    } catch (err) {
      console.warn("Backend register fetch failed, falling back to local", err);
    }
    const newUser = {
      _id: "usr_" + Math.random().toString(36).substring(2, 9),
      name,
      email,
      role,
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const loginAsDemo = (type) => {
    const demo = DEMO_USERS[type] || DEMO_USERS.user;
    setUser(demo);
    setToken('jwt_' + demo._id);
    localStorage.setItem('signvox_token', 'jwt_' + demo._id);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('signvox_token');
    localStorage.removeItem('signvox_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      loginAsDemo,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
