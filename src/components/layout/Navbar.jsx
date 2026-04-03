import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Roles', href: '#roles' },
    { name: 'Pricing', href: '#pricing' },
  ];

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      left: '0',
      right: '0',
      display: 'flex',
      justifyContent: 'center',
      zIndex: 1000,
      pointerEvents: 'none',
    }}>
      <nav style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        width: '90%',
        maxWidth: '1200px',
        borderRadius: '50px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: scrolled ? 'var(--bg-card)' : 'rgba(255, 255, 255, 0.4)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid var(--border-default)',
        transition: 'all 0.3s var(--smooth)',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <svg viewBox="0 0 100 100" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 15 L20 75 L38 75 L50 48 L62 75 L80 75 Z" fill="#FFC800" />
            <polygon points="50,60 42,75 58,75" fill="#FFC800" />
          </svg>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}>Edubase</span>
        </Link>

        {/* Desktop Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
        }} className="nav-links-desktop">
          {navLinks.map(link => (
            <a key={link.name} href={link.href} style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'color 0.3s',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >{link.name}</a>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-gradient" style={{ padding: '8px 20px', fontSize: '0.85rem', textDecoration: 'none', borderRadius: '50px' }}>
              <span>Dashboard →</span>
            </Link>
          ) : (
            <>
              <Link to="/login" style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                fontWeight: 500,
                padding: '8px 16px',
                transition: 'color 0.3s',
                textDecoration: 'none',
              }} className="hide-mobile">Login</Link>
              <Link to="/register" className="btn-gradient" style={{ padding: '8px 20px', fontSize: '0.85rem', textDecoration: 'none', borderRadius: '50px' }}>
                <span>Get Started</span>
              </Link>
            </>
          )}

          {/* Mobile menu without emoji */}
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{
            display: 'none',
            width: 40, height: 40,
            borderRadius: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }} className="mobile-menu-btn">
            {mobileOpen ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            left: '24px', right: '24px',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            border: '1px solid var(--border-default)',
            animation: 'fadeIn 0.3s ease',
          }}>
            {navLinks.map(link => (
              <a key={link.name} href={link.href} style={{
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                padding: '8px 0',
                textDecoration: 'none',
              }}>{link.name}</a>
            ))}
          </div>
        )}

        <style>{`
          @media (max-width: 768px) {
            .nav-links-desktop { display: none !important; }
            .mobile-menu-btn { display: flex !important; }
            .hide-mobile { display: none !important; }
          }
        `}</style>
      </nav>
    </div>
  );
}
