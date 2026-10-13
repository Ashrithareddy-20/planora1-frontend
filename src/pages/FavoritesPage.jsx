import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Trash2 } from 'lucide-react';
import { favoriteApi } from '../services/api';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = () => {
    setLoading(true);
    favoriteApi.getAll()
      .then(res => setFavorites(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleRemove = async (vendorId) => {
    try {
      await favoriteApi.toggle(vendorId);
      setFavorites(prev => prev.filter(v => v.id !== vendorId));
    } catch (err) {
      alert('Failed to remove from favorites');
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#1e1b4b', marginBottom: '0.25rem' }}>Saved Vendors</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Your shortlisted venues and service providers for quick comparison and booking
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading favorites...</div>
      ) : favorites.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Heart size={40} style={{ margin: '0 auto 1rem auto', color: '#ec4899' }} />
          <h3>No saved vendors yet</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Click the heart icon on any vendor card to save them to your shortlist.
          </p>
          <Link to="/vendors" className="btn btn-primary">Explore Vendors</Link>
        </div>
      ) : (
        <div className="grid-3">
          {favorites.map(vendor => (
            <div key={vendor.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '180px', position: 'relative' }}>
                <img src={vendor.imageUrl} alt={vendor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  onClick={() => handleRemove(vendor.id)}
                  title="Remove from favorites"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={16} color="var(--danger)" />
                </button>
              </div>

              <div style={{ padding: '1.25rem' }}>
                <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>{vendor.category}</span>
                <h3 style={{ fontSize: '1.15rem', color: '#1e1b4b', marginBottom: '0.35rem' }}>{vendor.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  📍 {vendor.city} • ★ {vendor.rating} ({vendor.reviewCount} reviews)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '0.875rem' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{vendor.priceStarting?.toLocaleString('en-IN')}
                  </div>
                  <Link to={`/vendors?id=${vendor.id}`} className="btn btn-secondary btn-sm">
                    View & Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
