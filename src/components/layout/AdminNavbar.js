import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './AdminNavbar.css';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);

  // Get user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('madeasy_user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('madeasy_user');
    localStorage.removeItem('token');
    navigate('/admin/login');
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Find Cleaners' },
    { path: '/how-it-works', label: 'How It Works' },
  ];

  const userMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { type: 'divider' },
    { action: handleLogout, label: 'Sign Out', icon: '🚪' },
  ];

  return (
    <nav className={`admin-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="admin-nav-container">
        {/* Logo */}
        <Link to="/admin/dashboard" className="admin-nav-logo">
          <div className="admin-logo-icon">✨✨</div>
          <span className="admin-logo-text">MADEASY</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="admin-nav-menu">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`admin-nav-link ${isActiveRoute(link.path) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop User Section */}
        <div className="admin-nav-user-section">
          <div className="admin-user-menu-container">
            <button 
              className="admin-user-menu-trigger"
              onClick={toggleUserMenu}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
            >
              <div className="admin-user-avatar">
                <span className="admin-avatar-fallback">S</span>
              </div>
              <span className="admin-user-name">System</span>
              <span className={`admin-dropdown-arrow ${isUserMenuOpen ? 'open' : ''}`}>▼</span>
            </button>

            {isUserMenuOpen && (
              <div className="admin-user-menu">
                <div className="admin-user-info">
                  <div className="admin-user-avatar large">
                    <span className="admin-avatar-fallback">S</span>
                  </div>
                  <div className="admin-user-details">
                    <div className="admin-user-name-full">{user?.name || 'System Admin'}</div>
                    <div className="admin-user-email">{user?.email || 'admin@madeasy.com'}</div>
                  </div>
                </div>

                <div className="admin-user-menu-items">
                  {userMenuItems.map((item, index) => (
                    <React.Fragment key={index}>
                      {item.type === 'divider' ? (
                        <div className="admin-menu-divider" />
                      ) : item.path ? (
                        <Link
                          to={item.path}
                          className="admin-user-menu-item"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <span className="admin-menu-icon">{item.icon}</span>
                          {item.label}
                        </Link>
                      ) : (
                        <button
                          onClick={item.action}
                          className="admin-user-menu-item"
                        >
                          <span className="admin-menu-icon">{item.icon}</span>
                          {item.label}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;

