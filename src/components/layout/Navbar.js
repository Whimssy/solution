import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsMobileMenuOpen(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Find Cleaners' },
    { path: '/how-it-works', label: 'How It Works'},
   
  ];

 const userMenuItems = user ? 
  [
    { path: '/bookings', label: 'My Bookings', icon: '📋' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
    { type: 'divider' },
    { action: handleLogout, label: 'Sign Out', icon: '🚪' },
  ] : [
    { path: '/login', label: 'Sign In', icon: '🔑' },
    { path: '/register', label: 'Sign Up', icon: '👥' }
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="logo-icon">✨</div>
          <span className="logo-text">MADEASY</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-menu">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActiveRoute(link.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop User Section */}
        <div className="nav-user-section">
          {user ? (
            <div className="user-menu-container">
              <button 
                className="user-menu-trigger"
                onClick={toggleUserMenu}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className="user-avatar">
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} />
                  ) : (
                    <span className="avatar-fallback">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <span className="user-name">{user.name?.split(' ')[0]}</span>
                <span className={`dropdown-arrow ${isUserMenuOpen ? 'open' : ''}`}>▼</span>
              </button>

              {isUserMenuOpen && (
                <div className="user-menu">
                  <div className="user-info">
                    <div className="user-avatar large">
                      {user.photo ? (
                        <img src={user.photo} alt={user.name} />
                      ) : (
                        <span className="avatar-fallback">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="user-details">
                      <div className="user-name-full">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>

                  <div className="user-menu-items">
                    {userMenuItems.map((item, index) => (
                      <React.Fragment key={index}>
                        {item.type === 'divider' ? (
                          <div className="menu-divider" />
                        ) : item.path ? (
                          <Link
                            to={item.path}
                            className="user-menu-item"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <span className="menu-icon">{item.icon}</span>
                            {item.label}
                          </Link>
                        ) : (
                          <button
                            onClick={item.action}
                            className="user-menu-item"
                          >
                            <span className="menu-icon">{item.icon}</span>
                            {item.label}
                          </button>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}

          {/* Book Now Button */}
          <Link to="/search" className="btn btn-book-now">
            <span className="btn-icon">✨</span>
            Book Now
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <div className="nav-logo">
                <div className="logo-icon">✨</div>
                <span className="logo-text">MADEASY</span>
              </div>
              <button 
                className="close-menu-btn"
                onClick={toggleMobileMenu}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="mobile-nav-links">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`mobile-nav-link ${isActiveRoute(link.path) ? 'active' : ''}`}
                  onClick={toggleMobileMenu}
                >
                  <span className="nav-icon">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mobile-user-section">
              {user ? (
                <div className="mobile-user-info">
                  <div className="user-avatar">
                    {user.photo ? (
                      <img src={user.photo} alt={user.name} />
                    ) : (
                      <span className="avatar-fallback">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </div>
              ) : null}

              <div className="mobile-auth-buttons">
                {user ? (
                  <>
                    {userMenuItems.map((item, index) => (
                      <React.Fragment key={index}>
                        {item.type === 'divider' ? (
                          <div className="menu-divider" />
                        ) : item.path ? (
                          <Link
                            to={item.path}
                            className="mobile-user-menu-item"
                            onClick={toggleMobileMenu}
                          >
                            <span className="menu-icon">{item.icon}</span>
                            {item.label}
                          </Link>
                        ) : (
                          <button
                            onClick={() => {
                              item.action();
                              toggleMobileMenu();
                            }}
                            className="mobile-user-menu-item"
                          >
                            <span className="menu-icon">{item.icon}</span>
                            {item.label}
                          </button>
                        )}
                      </React.Fragment>
                    ))}
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="btn btn-outline full-width"
                      onClick={toggleMobileMenu}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-primary full-width"
                      onClick={toggleMobileMenu}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>

              <Link
                to="/search"
                className="btn btn-book-now full-width"
                onClick={toggleMobileMenu}
              >
                <span className="btn-icon">✨</span>
                Book Cleaning
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-backdrop"
          onClick={toggleMobileMenu}
        />
      )}
    </nav>
  );
};

export default Navbar;