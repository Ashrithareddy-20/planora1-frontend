import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Store, 
  Calendar, 
  BookmarkCheck, 
  MessageSquare, 
  Trash2, 
  ShieldAlert,
  CheckCircle 
} from 'lucide-react';
import { adminApi } from '../services/api';

const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'bookings' | 'reviews'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, bookingsRes, reviewsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getBookings(),
        adminApi.getReviews()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
      setReviews(reviewsRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load admin panel data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.updateRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Delete this review for platform moderation?')) {
      try {
        await adminApi.deleteReview(reviewId);
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      } catch (err) {
        alert('Failed to delete review');
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading admin console...
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldAlert size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#1e1b4b', marginBottom: '0.2rem' }}>Admin Control Console</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Platform monitoring, role moderation, and review supervision</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Accounts</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{stats?.totalUsers || 0}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Listed Vendors</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)' }}>{stats?.totalVendors || 0}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Events Planned</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{stats?.totalEvents || 0}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Bookings</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>{stats?.totalBookings || 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : '2px solid transparent'
          }}
        >
          User Accounts & Roles ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            color: activeTab === 'bookings' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'bookings' ? '2px solid var(--primary)' : '2px solid transparent'
          }}
        >
          All Platform Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            color: activeTab === 'reviews' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'reviews' ? '2px solid var(--primary)' : '2px solid transparent'
          }}
        >
          Reviews Moderation ({reviews.length})
        </button>
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Name</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Email</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Phone</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Current Role</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Change Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{u.phone || '—'}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`badge ${
                        u.role === 'ROLE_ADMIN' ? 'badge-danger' :
                        u.role === 'ROLE_VENDOR' ? 'badge-primary' : 'badge-secondary'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.8rem' }}
                      >
                        <option value="ROLE_USER">ROLE_USER</option>
                        <option value="ROLE_VENDOR">ROLE_VENDOR</option>
                        <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Vendor</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Client</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Event</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Price</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{b.vendorName}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{b.userName}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{b.eventTitle || 'Direct Booking'}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{b.requestedDate}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>₹{b.estimatedPrice?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`badge ${
                        b.status === 'ACCEPTED' ? 'badge-success' :
                        b.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {reviews.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                    <strong>{r.vendorName}</strong>
                    <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>★ {r.rating} / 5</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By: {r.userName}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>"{r.comment}"</p>
                </div>
                <button
                  onClick={() => handleDeleteReview(r.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--danger)', borderColor: '#fecaca' }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
