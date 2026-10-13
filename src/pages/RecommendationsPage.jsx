import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Star, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { aiApi, eventApi, favoriteApi, bookingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RecommendationsPage = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');

  const [form, setForm] = useState({
    eventType: 'Wedding',
    location: 'Bangalore',
    guestCount: 250,
    budget: 800000,
    preferredCategory: '',
    preferences: ''
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      eventApi.getAll().then(res => {
        setEvents(res.data || []);
      }).catch(() => {});
    }
    // Initial fetch
    fetchRecommendations();
  }, [isAuthenticated]);

  const handleEventSelect = (e) => {
    const evId = e.target.value;
    setSelectedEventId(evId);
    if (evId) {
      const found = events.find(ev => ev.id === Number(evId));
      if (found) {
        setForm({
          eventType: found.eventType,
          location: found.location,
          guestCount: found.guestCount,
          budget: found.totalBudget,
          preferredCategory: '',
          preferences: ''
        });
      }
    }
  };

  const fetchRecommendations = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await aiApi.getRecommendations({
        eventId: selectedEventId ? Number(selectedEventId) : null,
        eventType: form.eventType,
        location: form.location,
        guestCount: Number(form.guestCount),
        budget: Number(form.budget),
        preferredCategory: form.preferredCategory || null,
        preferences: form.preferences
      });
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          padding: '0.35rem 1rem',
          borderRadius: '9999px',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '0.75rem',
          textTransform: 'uppercase'
        }}>
          <Sparkles size={16} />
          AI Matching Engine
        </div>
        <h1 style={{ fontSize: '2.4rem', color: '#1e1b4b', marginBottom: '0.5rem' }}>
          Personalized Vendor Recommendations
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
          Planora synthesizes your celebration scale, budget allocations, and venue locations against database vendors to recommend ideal matches with rationales.
        </p>
      </div>

      {/* Input Parameters Card */}
      <form onSubmit={fetchRecommendations} className="card" style={{ marginBottom: '2.5rem', padding: '1.75rem' }}>
        {events.length > 0 && (
          <div style={{ marginBottom: '1.25rem', padding: '0.875rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <label className="form-label">Auto-populate from Your Saved Events:</label>
            <select className="form-select" value={selectedEventId} onChange={handleEventSelect}>
              <option value="">Custom Criteria (No event selected)</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title} ({ev.eventType} in {ev.location})</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid-4" style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Event Type</label>
            <select
              className="form-select"
              value={form.eventType}
              onChange={(e) => setForm({ ...form, eventType: e.target.value })}
            >
              <option value="Wedding">Wedding</option>
              <option value="Reception">Reception</option>
              <option value="Engagement">Engagement</option>
              <option value="Birthday">Birthday Party</option>
              <option value="Corporate">Corporate Summit</option>
              <option value="Cocktail Party">Cocktail Party</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">City / Destination</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Bangalore"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Guest Count</label>
            <input
              type="number"
              required
              min="1"
              className="form-control"
              value={form.guestCount}
              onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total Event Budget (₹)</label>
            <input
              type="number"
              required
              step="10000"
              className="form-control"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
            />
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Specific Service Category</label>
            <select
              className="form-select"
              value={form.preferredCategory}
              onChange={(e) => setForm({ ...form, preferredCategory: e.target.value })}
            >
              <option value="">All Categories (Comprehensive Match)</option>
              <option value="VENUE">Venues & Resorts</option>
              <option value="CATERING">Catering & Banquets</option>
              <option value="DECORATION">Floral & Stage Decor</option>
              <option value="PHOTOGRAPHY">Photography & Cinema</option>
              <option value="MAKEUP">Makeup & Styling</option>
              <option value="ENTERTAINMENT">DJ & Live Music</option>
              <option value="TRANSPORTATION">Logistics & Cars</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Special Preferences / Keywords</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Open-air lawn, Awadhi cuisine, 4K Drone shoot..."
              value={form.preferences}
              onChange={(e) => setForm({ ...form, preferences: e.target.value })}
            />
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            <Sparkles size={18} />
            {loading ? 'Evaluating matches...' : 'Generate AI Matches'}
          </button>
        </div>
      </form>

      {/* Results Section */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Ranking database service providers according to your requirements...
        </div>
      ) : results.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          No recommendations found for this exact combination. Try broadening your location or budget.
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#1e1b4b' }}>
              Top Matched Recommendations ({results.length})
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Sorted by Planora AI Fit Score
            </span>
          </div>

          <div className="grid-3">
            {results.map((rec, index) => {
              const vendor = rec.vendor;
              return (
                <div key={index} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ height: '190px', position: 'relative' }}>
                      <img src={vendor.imageUrl} alt={vendor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {rec.matchScore}% Fit Score
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(0,0,0,0.75)',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        ★ {vendor.rating}
                      </div>
                    </div>

                    <div style={{ padding: '1.25rem' }}>
                      <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>{vendor.category}</span>
                      <h3 style={{ fontSize: '1.2rem', color: '#1e1b4b', marginBottom: '0.35rem' }}>{vendor.name}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        📍 {vendor.city} {vendor.maxGuestCapacity ? `• Capacity: ${vendor.maxGuestCapacity} guests` : ''}
                      </div>

                      {/* AI Why Statement */}
                      <div style={{
                        background: '#f5f3ff',
                        border: '1px solid #ddd6fe',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        fontSize: '0.8rem',
                        color: '#4338ca',
                        marginBottom: '0.875rem',
                        lineHeight: 1.5
                      }}>
                        <strong>AI Fit Rationale:</strong> {rec.matchReason}
                      </div>

                      {/* Highlights */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.875rem' }}>
                        {rec.highlights?.map((h, i) => (
                          <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Check size={13} color="var(--success)" /> {h}
                          </div>
                        ))}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
                        Budget Status: <strong style={{ color: 'var(--primary)' }}>{rec.budgetFitStatus}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Estimated Price</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                        ₹{vendor.priceStarting?.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <a href={`/vendors?id=${vendor.id}`} className="btn btn-primary btn-sm">
                      View Details
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
