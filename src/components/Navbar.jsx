import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Calendar, 
  Store, 
  Heart, 
  BookmarkCheck, 
  User, 
  LogOut, 
  ShieldAlert, 
  Menu, 
  X,
  Bot
} from 'lucide-react';

const Navbar = ({ onOpenAiChat }) => {
  const { user, isAuthenticated, isAdmin, isVendor, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            color: '#fff',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e1b4b', letterSpacing: '-0.02em' }}>
              Planora
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '-2px' }}>
              AI Event Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
          <Link to="/events" style={{
            padding: '0.5rem 0.875rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: isActive('/events') ? 'var(--primary)' : 'var(--text-main)',
            backgroundColor: isActive('/events') ? 'var(--primary-light)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem'
          }}>
            <Calendar size={18} />
            My Events
          </Link>

          <Link to="/vendors" style={{
            padding: '0.5rem 0.875rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: isActive('/vendors') ? 'var(--primary)' : 'var(--text-main)',
            backgroundColor: isActive('/vendors') ? 'var(--primary-light)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem'
          }}>
            <Store size={18} />
            Vendors & Venues
          </Link>

          <Link to="/recommendations" style={{
            padding: '0.5rem 0.875rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: isActive('/recommendations') ? 'var(--primary)' : 'var(--text-main)',
            backgroundColor: isActive('/recommendations') ? 'var(--primary-light)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem'
          }}>
            <Sparkles size={18} color="#ec4899" />
            AI Recommendations
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/bookings" style={{
                padding: '0.5rem 0.875rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive('/bookings') ? 'var(--primary)' : 'var(--text-main)',
                backgroundColor: isActive('/bookings') ? 'var(--primary-light)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}>
                <BookmarkCheck size={18} />
                Bookings
              </Link>

              <Link to="/favorites" style={{
                padding: '0.5rem 0.875rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive('/favorites') ? 'var(--primary)' : 'var(--text-main)',
                backgroundColor: isActive('/favorites') ? 'var(--primary-light)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}>
                <Heart size={18} />
                Saved
              </Link>
            </>
          )}

          {isAdmin && (
            <Link to="/admin" style={{
              padding: '0.5rem 0.875rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/admin') ? '#dc2626' : '#b91c1c',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}>
              <ShieldAlert size={18} />
              Admin
            </Link>
          )}
        </nav>

        {/* Right CTA & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* AI Concierge quick button */}
          <button 
            onClick={onOpenAiChat}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
              border: '1px solid #f0abfc',
              color: '#a21caf',
              padding: '0.5rem 0.875rem',
              borderRadius: '9999px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Bot size={18} />
            <span>Planora AI</span>
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/dashboard" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                fontWeight: 600,
                background: 'var(--bg-main)',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <User size={16} color="var(--primary)" />
                <span>{user?.name?.split(' ')[0]}</span>
              </Link>
              <button 
                onClick={handleLogout}
                title="Log out"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.4rem',
                  borderRadius: '6px'
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
