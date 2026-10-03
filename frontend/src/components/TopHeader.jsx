import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ChevronDown } from 'lucide-react';

export default function TopHeader({ onProfileClick }) {
  const { user } = useAuth();
  const userName = user?.name || 'Ravi Kumar';
  const userRole = user?.role === 'admin' ? 'Admin' : 'User';

  return (
    <header className="app-topheader">
      <div className="topheader-spacer"></div>
      
      <div className="topheader-user-badge" onClick={onProfileClick}>
        <div className="topheader-avatar">
          <User size={18} color="#2563EB" />
        </div>
        <div className="topheader-user-info">
          <span className="topheader-user-name">{userName}</span>
          <span className="topheader-user-role">{userRole}</span>
        </div>
        <ChevronDown size={15} className="topheader-chevron" />
      </div>
    </header>
  );
}
