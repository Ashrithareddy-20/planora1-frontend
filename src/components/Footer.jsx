import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid var(--border)',
      padding: '3rem 0 2rem',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={18} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e1b4b' }}>
                Planora
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              AI-powered event planning and vendor recommendation platform. Organize dream weddings, birthdays, corporate summits, and parties effortlessly.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-main)', marginBottom: '1rem' }}>
              Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li><Link to="/events" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Event Management</Link></li>
              <li><Link to="/vendors" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Vendor Explorer</Link></li>
              <li><Link to="/recommendations" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>AI Matchmaker</Link></li>
              <li><Link to="/bookings" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Booking Requests</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-main)', marginBottom: '1rem' }}>
              Categories
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li><Link to="/vendors?category=VENUE" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Venues & Resorts</Link></li>
              <li><Link to="/vendors?category=CATERING" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Gourmet Catering</Link></li>
              <li><Link to="/vendors?category=DECORATION" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Floral & Stage Decor</Link></li>
              <li><Link to="/vendors?category=PHOTOGRAPHY" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Photography & Cinema</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-main)', marginBottom: '1rem' }}>
              Demo Accounts
            </h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div><strong>Admin:</strong> admin@planora.com / password123</div>
              <div style={{ marginTop: '0.25rem' }}><strong>Vendor:</strong> vendor@planora.com / password123</div>
              <div style={{ marginTop: '0.25rem' }}><strong>User:</strong> user@planora.com / password123</div>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}>
          <div>
            © 2026 Planora Technologies. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Built with Spring Boot 3 & React
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
