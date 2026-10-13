import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Store, 
  ArrowRight,
  TrendingUp,
  Plus
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#f43f5e'];

const Dashboard = ({ onOpenAiChat }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getDashboard()
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading your event dashboard...</div>
      </div>
    );
  }

  const categoryChartData = data?.categoryBudgets ? 
    Object.entries(data.categoryBudgets).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        borderRadius: '20px',
        color: '#ffffff',
        padding: '2.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
      }}>
        <div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.25rem', fontWeight: 600 }}>
            Welcome back, {user?.name}! 👋
          </div>
          <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.5rem' }}>
            Event Command Center
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.95rem', maxWidth: '520px', lineHeight: 1.5 }}>
            You have {data?.upcomingEvents || 0} upcoming celebrations in progress. Your overall milestone completion is {data?.overallChecklistProgress || 0}%.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/events?new=true" className="btn btn-secondary" style={{ background: '#fff', color: '#4338ca', fontWeight: 700 }}>
            <Plus size={18} />
            Create Event
          </Link>
          <button 
            onClick={onOpenAiChat}
            className="btn btn-secondary" 
            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
          >
            <Sparkles size={18} />
            Ask Planora AI
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Events</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{data?.totalEvents || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{data?.upcomingEvents || 0} Upcoming</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Planned Budget</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>₹{(data?.totalBudget || 0).toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
              ₹{(data?.remainingBudget || 0).toLocaleString('en-IN')} Unallocated
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Checklist Progress</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{data?.overallChecklistProgress || 0}%</div>
            <div style={{
              width: '100px',
              height: '6px',
              background: '#e2e8f0',
              borderRadius: '9999px',
              marginTop: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${data?.overallChecklistProgress || 0}%`,
                height: '100%',
                background: 'var(--success)',
                borderRadius: '9999px'
              }} />
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fce7f3', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Bookings</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{data?.pendingBookings || 0}</div>
            <Link to="/bookings" style={{ fontSize: '0.75rem', color: 'var(--secondary)', textDecoration: 'none', fontWeight: 600 }}>
              Review Requests →
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Upcoming Events Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Budget Allocation Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#1e1b4b' }}>Category Budget Distribution</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aggregated expenses across your active events</p>
            </div>
            <span className="badge badge-primary">Expense Split</span>
          </div>

          {categoryChartData.length > 0 ? (
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No budget items yet. Create an event to generate budget allocations!
            </div>
          )}
        </div>

        {/* Upcoming Events List */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#1e1b4b' }}>Your Events</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upcoming & in-progress</p>
            </div>
            <Link to="/events" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              View All
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {data?.recentEvents && data.recentEvents.length > 0 ? (
              data.recentEvents.map(event => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'background 0.15s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e1b4b' }}>{event.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      📍 {event.location} • 📅 {event.eventDate} • 👥 {event.guestCount} Guests
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-primary">{event.eventType}</span>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>
                      {event.checklistProgress}% Done
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                No events found. Start by creating one!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Vendors Recommended For You */}
      {data?.recommendedVendors && data.recommendedVendors.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#1e1b4b' }}>Curated Vendors For Your Events</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top matches based on location & guest capacity</p>
            </div>
            <Link to="/recommendations" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              AI Matchmaker Hub <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid-4">
            {data.recommendedVendors.map(v => (
              <div key={v.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <img src={v.imageUrl} alt={v.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                <div style={{ padding: '0.875rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{v.category}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e1b4b', margin: '2px 0 6px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {v.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{v.priceStarting?.toLocaleString('en-IN')}</span>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>★ {v.rating}</span>
                  </div>
                  <Link to={`/vendors?id=${v.id}`} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.75rem' }}>
                    View & Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
