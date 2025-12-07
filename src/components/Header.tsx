import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, LogIn, LogOut, Shield, Users } from 'lucide-react';
import { SleepLogo } from './SleepLogo';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isSuperAdmin, isOrgAdmin, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (link: any) => {
    if (link.path) {
      navigate(link.path);
    } else if (location.pathname === '/' && link.id) {
      const element = document.getElementById(link.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (link.id === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (link.id) {
      navigate('/', { state: { scrollTo: link.id } });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about-section' },
    { name: 'Analysis', path: '/analysis' },
    { name: 'Contact', id: 'contact-section' }
  ];

  const isAnalysisPage = location.pathname === '/analysis';
  const isAdminPage = location.pathname === '/admin' || location.pathname === '/super-admin';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-md border-b border-white/10 shadow-lg' 
          : 'bg-transparent'
      }`}
      style={{
        background: isScrolled 
          ? 'linear-gradient(135deg, hsl(227, 74%, 42%), hsl(220, 48%, 82%), rgb(156, 163, 175))' 
          : 'transparent'
      }}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300 group"
          >
            <SleepLogo size="md" className="group-hover:animate-float" />
            <span className="text-white font-semibold text-xl font-brockmann">
              Sleep Report AI
            </span>
          </button>

          {/* Navigation and Auth */}
          <div className="flex items-center space-x-6">
            {/* Navigation Links */}
            {!isAnalysisPage && !isAdminPage && navLinks.map((link) => (
              <button
                key={link.id || link.path}
                onClick={() => handleNavigation(link)}
                className={`text-white/90 hover:text-white transition-colors duration-300 font-medium relative group ${
                  (link.path && location.pathname === link.path) ? 'text-white' : ''
                }`}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </button>
            ))}
            
            {/* Back Arrow for Analysis/Admin Pages */}
            {(isAnalysisPage || isAdminPage) && (
              <button
                onClick={() => navigate('/')}
                className="text-white/90 hover:text-white transition-colors duration-300 p-2 hover:bg-white/10 rounded-lg"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            )}

            {/* Auth Buttons */}
            {!isLoading && (
              <div className="flex items-center space-x-3">
                {user ? (
                  <>
                    {/* Admin Links */}
                    {isSuperAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/super-admin')}
                        className="text-white/90 hover:text-white hover:bg-white/10"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Super Admin
                      </Button>
                    )}
                    {isOrgAdmin && !isSuperAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/admin')}
                        className="text-white/90 hover:text-white hover:bg-white/10"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    )}
                    {/* Sign Out */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="text-white/90 hover:text-white hover:bg-white/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/auth')}
                    className="text-white/90 hover:text-white hover:bg-white/10"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
