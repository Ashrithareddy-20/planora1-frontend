import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Calendar, 
  Store, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Star,
  Users,
  Compass,
  PieChart
} from 'lucide-react';
import { vendorApi } from '../services/api';

const Home = ({ onOpenAiChat }) => {
  const [featuredVendors, setFeaturedVendors] = useState([]);

  useEffect(() => {
    vendorApi.getAll({ maxPrice: 500000 }).then(res => {
      setFeaturedVendors(res.data.slice(0, 3));
    }).catch(() => {});
  }, []);

  const eventTypes = [
    { title: 'Weddings & Receptions', icon: '💍', desc: 'From royal heritage lawns to intimate beach mandaps.', count: '50+ Venues' },
    { title: 'Birthday Parties', icon: '🎂', desc: 'Theme decor, custom cake artists, and lively DJs.', count: '40+ Partners' },
    { title: 'Corporate Summits', icon: '💼', desc: 'Audio-visual conference banquets & business lunches.', count: '30+ Spaces' },
    { title: 'Engagements & Sangeet', icon: '✨', desc: 'Vibrant stage lighting, choreographed sound & photography.', count: '45+ Vendors' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%)',
        padding: '5rem 0 4rem',
        borderBottom: '1px solid var(--border-light)',
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '880px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <Sparkles size={16} />
            Next-Generation Event Intelligence
          </div>

          <h1 className="hero-serif" style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 800,
            color: '#1e1b4b',
            lineHeight: 1.15,
            marginBottom: '1.25rem'
          }}>
            Plan Unforgettable Events with <span style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>AI Precision</span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            marginBottom: '2.25rem',
            maxWidth: '720px',
            margin: '0 auto 2.25rem auto'
          }}>
            Planora seamlessly coordinates venues, gourmet catering, decor, photography, and entertainment. Allocate budgets smartly, track milestones, and receive data-driven vendor recommendations.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/events" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
              <Calendar size={18} />
              Start Planning Free
            </Link>
            <button 
              onClick={onOpenAiChat}
              className="btn btn-secondary" 
              style={{ padding: '0.75rem 1.75rem', fontSize: '1rem', color: '#6366f1', borderColor: '#c7d2fe' }}
            >
              <Sparkles size={18} />
              Consult Planora AI
            </button>
            <Link to="/vendors" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              <Store size={18} />
              Browse Vendors
            </Link>
          </div>

          {/* Key Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            marginTop: '4rem',
            paddingTop: '2.5rem',
            borderTop: '1px solid var(--border)'
          }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e1b4b' }}>1,500+</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Events Planned</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>300+</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Vendors</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>98%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Budget Accuracy</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>4.9★</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Types Grid */}
      <section style={{ padding: '4.5rem 0', background: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem', color: '#1e1b4b' }}>
              Every Celebration, Thoughtfully Curated
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
              Whether you are hosting 50 close friends or 1,500 grand wedding guests, Planora adapts your budget and tasks automatically.
            </p>
          </div>

          <div className="grid-4">
            {eventTypes.map((item, index) => (
              <div key={index} className="card" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: '#1e1b4b' }}>{item.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
                <span className="badge badge-primary">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / Core Modules */}
      <section style={{ padding: '4.5rem 0', background: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="badge badge-secondary" style={{ marginBottom: '0.75rem' }}>Workflow</span>
            <h2 style={{ fontSize: '2.2rem', color: '#1e1b4b' }}>How Planora Powers Your Event</h2>
          </div>

          <div className="grid-4">
            <div className="card">
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#e0e7ff',
                color: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Calendar size={22} />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>1. Create & Define</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Enter date, city, guest count and budget. Planora instantly initializes custom checklists and allocations.
              </p>
            </div>

            <div className="card">
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#fce7f3',
                color: '#db2777',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <PieChart size={22} />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>2. Smart Budgeting</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Track venue, catering, decor and photo allocations with charts. Real-time alerts prevent overspending.
              </p>
            </div>

            <div className="card">
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#ede9fe',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Sparkles size={22} />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>3. AI Recommendations</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Our RAG-based matching engine ranks vendors by city, capacity, pricing and real user reviews.
              </p>
            </div>

            <div className="card">
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <CheckCircle2 size={22} />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>4. Book & Coordinate</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Submit booking requests, converse with Planora AI concierge, and mark checklist milestones as you go.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vendors Showcase */}
      {featuredVendors.length > 0 && (
        <section style={{ padding: '4.5rem 0', background: '#ffffff' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Top Rated</span>
                <h2 style={{ fontSize: '2rem', color: '#1e1b4b' }}>Premier Venues & Vendors</h2>
              </div>
              <Link to="/vendors" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View all vendors <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid-3">
              {featuredVendors.map((vendor) => (
                <div key={vendor.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
                    <img 
                      src={vendor.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'} 
                      alt={vendor.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(255,255,255,0.92)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--primary)'
                    }}>
                      {vendor.category}
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(15,23,42,0.85)',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Star size={12} fill="#f59e0b" color="#f59e0b" />
                      {vendor.rating}
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: '#1e1b4b' }}>{vendor.name}</h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem', minHeight: '38px', lineHeight: 1.4 }}>
                      {vendor.description?.length > 90 ? vendor.description.substring(0, 90) + '...' : vendor.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '0.875rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Starting from</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{vendor.priceStarting?.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <Link to={`/vendors?id=${vendor.id}`} className="btn btn-secondary btn-sm">
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        color: '#ffffff',
        padding: '4.5rem 0',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{ fontSize: '2.4rem', color: '#ffffff', marginBottom: '1rem' }}>
            Ready to plan your milestone celebration?
          </h2>
          <p style={{ color: '#c7d2fe', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Join thousands of event organizers, couples, and corporate hosts creating seamless experiences with Planora.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
              Create Account Free
            </Link>
            <Link to="/events" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1rem', background: 'transparent', color: '#fff', borderColor: '#4338ca' }}>
              Explore Demo Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
