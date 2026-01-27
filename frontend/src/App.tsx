import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureCards from './components/FeatureCards';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleNavigateDashboard = () => {
    if (isLoggedIn) {
      setView('dashboard');
    } else {
      handleOpenAuth('login');
    }
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-black">
      <Navbar
        isLoggedIn={isLoggedIn}
        onOpenAuth={handleOpenAuth}
        onNavigateDashboard={handleNavigateDashboard}
        onNavigateHome={() => setView('landing')}
      />

      <main>
        {view === 'landing' ? (
          <>
            <Hero
              onOpenAuth={() => handleOpenAuth('signup')}
              isLoggedIn={isLoggedIn}
              onNavigateDashboard={handleNavigateDashboard}
            />
            <FeatureCards />
          </>
        ) : (
          <Dashboard />
        )}

        {/* Footer Area Spacer */}
        <div className="h-20" />
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
        }}
        initialMode={authMode}
      />
    </div>
  );
}

export default App;
