import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LiveTranslatePage from './pages/LiveTranslatePage';
import PracticePage from './pages/PracticeModePage';
import VocabularyPage from './pages/VocabPage';
import HistoryPage from './pages/TranslationHistoryPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';

function MainApp() {
  const [page, setPage] = useState('home');
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setPage('home')} />;
  }

  // Home page is full-width (no sidebar)
  if (page === 'home') {
    return <HomePage onNavigate={setPage} />;
  }

  return (
    <div className="app-layout-container">
      <Sidebar activeTab={page} setActiveTab={setPage} />
      <div className="app-main-viewport">
        <TopHeader onProfileClick={() => setPage('profile')} />
        <main className="app-content-body">
          {page === 'translate' && <LiveTranslatePage />}
          {page === 'practice' && <PracticePage />}
          {page === 'vocabulary' && <VocabPage />}
          {page === 'history' && <HistoryPage />}
          {page === 'profile' && <ProfilePage />}
        </main>
      </div>
    </div>
  );
}

function VocabPage() {
  return <VocabularyPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
