import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Store, 
  Search, 
  MapPin, 
  Star, 
  Heart, 
  Check, 
  SlidersHorizontal, 
  ArrowLeftRight,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  X,
  Plus
} from 'lucide-react';
import { vendorApi, favoriteApi, reviewApi, bookingApi, eventApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'ALL',
  'VENUE',
  'CATERING',
  'DECORATION',
  'PHOTOGRAPHY',
  'MAKEUP',
  'ENTERTAINMENT',
  'TRANSPORTATION'
];

const VendorsList = () => {
  const { isAuthenticated, isVendor } = useAuth();
  const [searchParams] = useSearchParams();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');
  const [selectedCity, setSelectedCity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorReviews, setVendorReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [userEvents, setUserEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingMsg, setBookingMsg] = useState('');

  useEffect(() => {
    fetchVendors();
    if (isAuthenticated) {
      eventApi.getAll().then(res => {
        setUserEvents(res.data || []);
        if (res.data?.length > 0) {
          setSelectedEventId(res.data[0].id);
        }
      }).catch(() => {});
    }
  }, [selectedCategory, selectedCity, maxPrice]);

  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      vendorApi.getById(idParam).then(res => {
        openVendorDetail(res.data);
      }).catch(() => {});
    }
  }, [searchParams]);

  const fetchVendors = () => {
    setLoading(true);
    const params = {};
    if (selectedCategory && selectedCategory !== 'ALL') params.category = selectedCategory;
    if (selectedCity) params.city = selectedCity;
    if (maxPrice) params.maxPrice = Number(maxPrice);
    if (searchQuery) params.query = searchQuery;

    vendorApi.getAll(params)
      .then(res => setVendors(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVendors();
  };

  const handleToggleFavorite = async (e, vendorId) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in to save favorites');
      return;
    }
    try {
      const res = await favoriteApi.toggle(vendorId);
      setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, isFavorite: res.data.isFavorite } : v));
      if (selectedVendor && selectedVendor.id === vendorId) {
        setSelectedVendor(prev => ({ ...prev, isFavorite: res.data.isFavorite }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openVendorDetail = async (vendor) => {
    setSelectedVendor(vendor);
    try {
      const revRes = await reviewApi.getByVendor(vendor.id);
      setVendorReviews(revRes.data || []);
    } catch (err) {
      setVendorReviews([]);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to leave a review');
      return;
    }
    try {
      await reviewApi.create({
        vendorId: selectedVendor.id,
        rating: Number(newReview.rating),
        comment: newReview.comment
      });
      setNewReview({ rating: 5, comment: '' });
      // reload reviews and vendor info
      const revRes = await reviewApi.getByVendor(selectedVendor.id);
      setVendorReviews(revRes.data || []);
      const updated = await vendorApi.getById(selectedVendor.id);
      setSelectedVendor(updated.data);
      fetchVendors();
    } catch (err) {
      alert('Failed to post review');
    }
  };

  const toggleCompare = (e, vendor) => {
    e.stopPropagation();
    if (compareList.some(v => v.id === vendor.id)) {
      setCompareList(prev => prev.filter(v => v.id !== vendor.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare up to 3 vendors simultaneously');
        return;
      }
      setCompareList(prev => [...prev, vendor]);
    }
  };

  const handleSendBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to submit a booking');
      return;
    }
    try {
      await bookingApi.create({
        vendorId: selectedVendor.id,
        eventId: selectedEventId ? Number(selectedEventId) : null,
        requestedDate: bookingDate,
        estimatedPrice: selectedVendor.priceStarting,
        message: bookingMsg
      });
      alert(`Booking inquiry submitted to ${selectedVendor.name}! Check your Bookings tab.`);
      setShowBookingModal(false);
      setBookingMsg('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit booking');
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#1e1b4b', marginBottom: '0.25rem' }}>Vendors & Venues</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Explore curated service providers, check guest capacities, compare pricing and read verified reviews
        </p>
      </div>

      {/* Categories Bar */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="btn btn-sm"
            style={{
              backgroundColor: selectedCategory === cat ? 'var(--primary)' : '#ffffff',
              color: selectedCategory === cat ? '#ffffff' : 'var(--text-main)',
              border: '1px solid var(--border)',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            {cat === 'ALL' ? 'All Services' : cat}
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <form onSubmit={handleSearchSubmit} className="card" style={{ padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1.5, position: 'relative', minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search vendor name, services or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '38px' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <input
            type="text"
            placeholder="City (e.g. Bangalore)"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="form-control"
          />
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <input
            type="number"
            placeholder="Max Price (₹)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="form-control"
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 1.25rem' }}>
          Filter
        </button>
      </form>

      {/* Floating Compare Bar */}
      {compareList.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e1b4b',
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          zIndex: 900
        }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {compareList.length} Vendor{compareList.length > 1 ? 's' : ''} Selected
          </span>
          <button 
            onClick={() => setShowCompareModal(true)}
            className="btn btn-primary btn-sm"
          >
            Compare Now
          </button>
          <button 
            onClick={() => setCompareList([])}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Vendors Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading verified vendors...</div>
      ) : vendors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>No vendors matched your search criteria</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Try clearing city or budget filters to explore other options.</p>
        </div>
      ) : (
        <div className="grid-3">
          {vendors.map(vendor => {
            const isCompared = compareList.some(v => v.id === vendor.id);
            return (
              <div
                key={vendor.id}
                className="card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onClick={() => openVendorDetail(vendor)}
              >
                <div>
                  <div style={{ height: '200px', position: 'relative' }}>
                    <img src={vendor.imageUrl} alt={vendor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(255,255,255,0.95)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--primary)'
                    }}>
                      {vendor.category}
                    </div>

                    <button
                      onClick={(e) => handleToggleFavorite(e, vendor.id)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(255,255,255,0.95)',
                        border: 'none',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Heart size={18} fill={vendor.isFavorite ? '#ef4444' : 'none'} color={vendor.isFavorite ? '#ef4444' : '#64748b'} />
                    </button>
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {vendor.city}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700 }}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        <span>{vendor.rating}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>({vendor.reviewCount})</span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', color: '#1e1b4b', marginBottom: '0.4rem' }}>{vendor.name}</h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem', minHeight: '38px' }}>
                      {vendor.description?.length > 95 ? vendor.description.substring(0, 95) + '...' : vendor.description}
                    </p>

                    {vendor.maxGuestCapacity && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        👥 Accommodates up to <strong>{vendor.maxGuestCapacity}</strong> guests
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Starting from</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{vendor.priceStarting?.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => toggleCompare(e, vendor)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        backgroundColor: isCompared ? 'var(--primary-light)' : '#fff',
                        borderColor: isCompared ? 'var(--primary)' : 'var(--border)',
                        color: isCompared ? 'var(--primary)' : 'var(--text-main)'
                      }}
                    >
                      <ArrowLeftRight size={14} />
                      {isCompared ? 'Added' : 'Compare'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openVendorDetail(vendor); }}
                      className="btn btn-primary btn-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vendor Detail Modal */}
      {selectedVendor && (
        <div className="modal-overlay" onClick={() => setSelectedVendor(null)}>
          <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative', height: '240px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem' }}>
              <img src={selectedVendor.imageUrl} alt={selectedVendor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => setSelectedVendor(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
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
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.25rem' }}>{selectedVendor.category}</span>
                <h2 style={{ fontSize: '1.6rem', color: '#1e1b4b' }}>{selectedVendor.name}</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  📍 {selectedVendor.address || selectedVendor.city}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{selectedVendor.priceStarting?.toLocaleString('en-IN')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 700, justifyContent: 'flex-end' }}>
                  <Star size={16} fill="#f59e0b" color="#f59e0b" />
                  <span>{selectedVendor.rating}</span>
                  <span style={{ color: 'var(--text-muted)' }}>({selectedVendor.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.925rem', marginBottom: '1.5rem' }}>
              {selectedVendor.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div><strong>Contact Phone:</strong> {selectedVendor.contactPhone || 'Available upon booking'}</div>
              <div><strong>Contact Email:</strong> {selectedVendor.contactEmail || 'Available upon booking'}</div>
              {selectedVendor.maxGuestCapacity && (
                <div><strong>Max Capacity:</strong> {selectedVendor.maxGuestCapacity} Guests</div>
              )}
              <div><strong>Location:</strong> {selectedVendor.city}</div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
              <button 
                onClick={() => setShowBookingModal(true)} 
                className="btn btn-primary" 
                style={{ flex: 1 }}
              >
                Request Booking / Quote
              </button>
              <button 
                onClick={(e) => handleToggleFavorite(e, selectedVendor.id)} 
                className="btn btn-secondary"
              >
                <Heart size={18} fill={selectedVendor.isFavorite ? '#ef4444' : 'none'} color={selectedVendor.isFavorite ? '#ef4444' : '#64748b'} />
                {selectedVendor.isFavorite ? 'Saved' : 'Save'}
              </button>
            </div>

            {/* Reviews Section */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#1e1b4b', marginBottom: '1rem' }}>
                Customer Reviews ({vendorReviews.length})
              </h3>

              {/* Add review form */}
              <form onSubmit={handleAddReview} style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Leave a Rating</label>
                  <select 
                    value={newReview.rating} 
                    onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                    style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '2px 8px' }}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                    <option value="3">⭐⭐⭐ (3 Stars)</option>
                    <option value="2">⭐⭐ (2 Stars)</option>
                    <option value="1">⭐ (1 Star)</option>
                  </select>
                </div>
                <textarea
                  required
                  rows="2"
                  className="form-control"
                  placeholder="Share your experience working with this vendor..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  style={{ marginBottom: '0.75rem' }}
                />
                <div style={{ textAlign: 'right' }}>
                  <button type="submit" className="btn btn-primary btn-sm">Submit Review</button>
                </div>
              </form>

              {/* Reviews list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {vendorReviews.map(r => (
                  <div key={r.id} style={{ padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{r.userName}</span>
                      <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>★ {r.rating} / 5</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="modal-overlay" onClick={() => setShowCompareModal(false)}>
          <div className="modal-content" style={{ maxWidth: '900px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', color: '#1e1b4b' }}>Side-by-Side Vendor Comparison</h3>
              <button onClick={() => setShowCompareModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compareList.length}, 1fr)`, gap: '1rem', overflowX: 'auto' }}>
              {compareList.map(v => (
                <div key={v.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', background: '#f8fafc' }}>
                  <img src={v.imageUrl} alt={v.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }} />
                  <span className="badge badge-primary" style={{ marginBottom: '0.25rem' }}>{v.category}</span>
                  <h4 style={{ fontSize: '1.1rem', color: '#1e1b4b', marginBottom: '0.25rem' }}>{v.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>📍 {v.city}</div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div><strong>Starting Price:</strong> ₹{v.priceStarting?.toLocaleString('en-IN')}</div>
                    <div><strong>Rating:</strong> ★ {v.rating} ({v.reviewCount} reviews)</div>
                    <div><strong>Capacity:</strong> {v.maxGuestCapacity ? `${v.maxGuestCapacity} guests` : 'N/A'}</div>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{v.description}</p>
                  </div>

                  <button 
                    onClick={() => { setSelectedVendor(v); setShowCompareModal(false); setShowBookingModal(true); }}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', marginTop: '1rem' }}
                  >
                    Select & Book
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedVendor && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', color: '#1e1b4b' }}>
                Request Booking from {selectedVendor.name}
              </h3>
              <button onClick={() => setShowBookingModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSendBooking}>
              <div style={{ marginBottom: '1rem', padding: '0.875rem', background: '#f8fafc', borderRadius: '10px', fontSize: '0.85rem' }}>
                <div><strong>Category:</strong> {selectedVendor.category}</div>
                <div><strong>Base Price:</strong> ₹{selectedVendor.priceStarting?.toLocaleString('en-IN')}</div>
              </div>

              {userEvents.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Link to Event</label>
                  <select
                    className="form-select"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                  >
                    <option value="">None / Standalone inquiry</option>
                    {userEvents.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title} ({ev.eventDate})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Requested Date</label>
                <input
                  type="date"
                  required
                  className="form-control"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event Details / Message</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Share details on your theme, requirements or special instructions..."
                  value={bookingMsg}
                  onChange={(e) => setBookingMsg(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowBookingModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Send Booking Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsList;
