import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SleepLogo } from './SleepLogo';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (link: any) => {
    if (link.path) {
      // Navigate to different page
      navigate(link.path);
    } else if (location.pathname === '/' && link.id) {
      // Scroll to section on home page
      const element = document.getElementById(link.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (link.id === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (link.id) {
      // Navigate to home page and scroll to section
      navigate('/', { state: { scrollTo: link.id } });
    }
  };

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about-section' },
    { name: 'Analysis', path: '/analysis' },
    { name: 'Contact', id: 'contact-section' }
  ];

  const isAnalysisPage = location.pathname === '/analysis';

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

          {/* Navigation and Back Arrow */}
          <div className="flex items-center space-x-8">
            {/* Navigation Links */}
            {!isAnalysisPage && navLinks.map((link) => (
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
            
            {/* Back Arrow for Analysis Page */}
            {isAnalysisPage && (
              <button
                onClick={() => navigate('/')}
                className="text-white/90 hover:text-white transition-colors duration-300 p-2 hover:bg-white/10 rounded-lg"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};