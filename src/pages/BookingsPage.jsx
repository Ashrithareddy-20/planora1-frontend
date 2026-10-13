import React, { useState, useEffect } from 'react';
import { BookmarkCheck, Clock, CheckCircle2, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { bookingApi, vendorApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookingsPage = () => {
  const { user, isVendor } = useAuth();
  const [activeTab, setActiveTab] = useState('my-requests'); // 'my-requests' | 'vendor-portal'
  const [myBookings, setMyBookings] = useState([]);
  const [vendorBookings, setVendorBookings] = useState([]);
  const [myVendors, setMyVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [loading, setLoading] = useState(true);

  // Status modal
  const [statusModal, setStatusModal] = useState(null); // { id, status }
  const [responseNote, setResponseNote] = useState('');

  useEffect(() => {
    fetchBookings();
    if (isVendor) {
      vendorApi.getMyListings().then(res => {
        setMyVendors(res.data || []);
        if (res.data?.length > 0) {
          setSelectedVendorId(res.data[0].id);
          fetchVendorBookings(res.data[0].id);
        }
      }).catch(() => {});
    }
  }, [isVendor]);

  const fetchBookings = () => {
    setLoading(true);
    bookingApi.getMyRequests()
      .then(res => setMyBookings(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchVendorBookings = (vId) => {
    bookingApi.getVendorBookings(vId)
      .then(res => setVendorBookings(res.data || []))
      .catch(err => console.error(err));
  };

  const handleVendorSelect = (e) => {
    const vId = e.target.value;
    setSelectedVendorId(vId);
    if (vId) fetchVendorBookings(vId);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await bookingApi.updateStatus(bookingId, newStatus, responseNote);
      setStatusModal(null);
      setResponseNote('');
      fetchBookings();
      if (selectedVendorId) fetchVendorBookings(selectedVendorId);
    } catch (err) {
      alert('Failed to update booking status');
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#1e1b4b', marginBottom: '0.25rem' }}>Booking Inquiries</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage your service requests and responses with event service providers
        </p>
      </div>

      {/* Tabs */}
      {isVendor && (
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
          <button
            onClick={() => setActiveTab('my-requests')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: activeTab === 'my-requests' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'my-requests' ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            My Booking Requests ({myBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('vendor-portal')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: activeTab === 'vendor-portal' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'vendor-portal' ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            🏪 Vendor Requests Portal ({vendorBookings.length})
          </button>
        </div>
      )}

      {/* USER BOOKINGS LIST */}
      {activeTab === 'my-requests' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading bookings...</div>
          ) : myBookings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <BookmarkCheck size={40} style={{ margin: '0 auto 1rem auto', color: 'var(--primary)' }} />
              <h3>No booking requests submitted yet</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Browse our Vendors directory or AI Recommendations to send your first booking inquiry!
              </p>
              <a href="/vendors" className="btn btn-primary">Browse Vendors</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myBookings.map(b => (
                <div key={b.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <img src={b.vendorImage} alt={b.vendorName} style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                        <span className="badge badge-primary">{b.vendorCategory}</span>
                        {b.eventTitle && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Linked to: <strong>{b.eventTitle}</strong></span>}
                      </div>
                      <h3 style={{ fontSize: '1.15rem', color: '#1e1b4b', marginBottom: '0.25rem' }}>{b.vendorName}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        📍 {b.vendorCity} • Requested Date: <strong>{b.requestedDate}</strong>
                      </div>
                      {b.message && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                          "{b.message}"
                        </div>
                      )}
                      {b.vendorResponse && (
                        <div style={{ fontSize: '0.8rem', color: '#4338ca', marginTop: '6px', background: '#f5f3ff', padding: '4px 8px', borderRadius: '6px' }}>
                          <strong>Vendor Note:</strong> {b.vendorResponse}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span className={`badge ${
                        b.status === 'ACCEPTED' ? 'badge-success' :
                        b.status === 'REJECTED' ? 'badge-danger' :
                        b.status === 'CANCELLED' ? 'badge-secondary' : 'badge-warning'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                      ₹{b.estimatedPrice?.toLocaleString('en-IN')}
                    </div>
                    {b.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)', borderColor: '#fecaca' }}
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VENDOR INCOMING BOOKINGS */}
      {activeTab === 'vendor-portal' && (
        <div>
          {myVendors.length > 0 && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Select Managed Vendor Profile:</span>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={selectedVendorId}
                onChange={handleVendorSelect}
              >
                {myVendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.city})</option>
                ))}
              </select>
            </div>
          )}

          {vendorBookings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No incoming booking requests for this vendor profile yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {vendorBookings.map(b => (
                <div key={b.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                      <span className={`badge ${
                        b.status === 'ACCEPTED' ? 'badge-success' :
                        b.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {b.status}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Client: <strong>{b.userName}</strong> ({b.userEmail} / {b.userPhone || 'N/A'})
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', color: '#1e1b4b', marginBottom: '0.25rem' }}>
                      Event: {b.eventTitle || 'Private Event'}
                    </h3>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Requested Service Date: <strong>{b.requestedDate}</strong> • Estimated Quote: <strong>₹{b.estimatedPrice?.toLocaleString('en-IN')}</strong>
                    </div>
                    {b.message && (
                      <div style={{ fontSize: '0.825rem', color: '#1e293b', marginTop: '6px', background: '#f8fafc', padding: '6px 10px', borderRadius: '8px' }}>
                        "{b.message}"
                      </div>
                    )}
                  </div>

                  {b.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setStatusModal({ id: b.id, status: 'ACCEPTED' })}
                        className="btn btn-primary btn-sm"
                        style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
                      >
                        Accept Booking
                      </button>
                      <button
                        onClick={() => setStatusModal({ id: b.id, status: 'REJECTED' })}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)', borderColor: '#fecaca' }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Response Note Modal */}
      {statusModal && (
        <div className="modal-overlay" onClick={() => setStatusModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', color: '#1e1b4b' }}>
                {statusModal.status === 'ACCEPTED' ? 'Accept Booking Inquiry' : 'Decline Booking Inquiry'}
              </h3>
              <button onClick={() => setStatusModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Note / Confirmation Message to Client</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder={statusModal.status === 'ACCEPTED' ? "e.g. We have reserved your date! Our coordinator will call to finalize package details." : "e.g. Unfortunately we are already fully booked on this date."}
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setStatusModal(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={() => handleUpdateStatus(statusModal.id, statusModal.status)} className="btn btn-primary">
                Confirm {statusModal.status}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
