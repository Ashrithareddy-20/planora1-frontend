import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Calendar, 
  Plus, 
  Search, 
  MapPin, 
  Users, 
  DollarSign, 
  Sparkles, 
  Trash2, 
  Edit,
  X,
  Filter
} from 'lucide-react';
import { eventApi } from '../services/api';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    title: '',
    eventType: 'Wedding',
    description: '',
    eventDate: '',
    location: '',
    guestCount: 150,
    totalBudget: 500000,
    status: 'UPCOMING'
  });

  useEffect(() => {
    fetchEvents();
    if (searchParams.get('new') === 'true') {
      setShowModal(true);
    }
  }, [statusFilter]);

  const fetchEvents = () => {
    setLoading(true);
    eventApi.getAll(statusFilter || undefined)
      .then(res => setEvents(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await eventApi.create({
        ...formData,
        guestCount: Number(formData.guestCount),
        totalBudget: Number(formData.totalBudget)
      });
      setShowModal(false);
      setFormData({
        title: '',
        eventType: 'Wedding',
        description: '',
        eventDate: '',
        location: '',
        guestCount: 150,
        totalBudget: 500000,
        status: 'UPCOMING'
      });
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating event');
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this event? Associated budget and tasks will also be removed.')) {
      try {
        await eventApi.delete(id);
        fetchEvents();
      } catch (err) {
        alert('Failed to delete event');
      }
    }
  };

  const filtered = events.filter(ev => {
    const term = searchTerm.toLowerCase();
    return ev.title.toLowerCase().includes(term) ||
           ev.eventType.toLowerCase().includes(term) ||
           ev.location.toLowerCase().includes(term);
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#1e1b4b', marginBottom: '0.25rem' }}>Event Planner</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Organize, estimate budgets and track milestones for all your celebrations
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} />
          Create New Event
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by title, event type, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '38px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
          {['', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="btn btn-sm"
              style={{
                backgroundColor: statusFilter === st ? 'var(--primary)' : '#fff',
                color: statusFilter === st ? '#fff' : 'var(--text-main)',
                border: '1px solid var(--border)',
                fontWeight: 600
              }}
            >
              {st || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading events...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <Calendar size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No events found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Get started by creating your first wedding, birthday, or corporate celebration!
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} />
            Create Event
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(event => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="card"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-primary">{event.eventType}</span>
                  <span className={`badge ${
                    event.status === 'UPCOMING' ? 'badge-success' :
                    event.status === 'COMPLETED' ? 'badge-primary' : 'badge-danger'
                  }`}>
                    {event.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', color: '#1e1b4b', marginBottom: '0.5rem' }}>
                  {event.title}
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5, minHeight: '38px' }}>
                  {event.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={15} color="var(--primary)" />
                    <span><strong>Date:</strong> {event.eventDate}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={15} color="var(--primary)" />
                    <span><strong>Location:</strong> {event.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={15} color="var(--primary)" />
                    <span><strong>Guests:</strong> {event.guestCount}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <DollarSign size={15} color="var(--primary)" />
                    <span><strong>Budget:</strong> ₹{event.totalBudget?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Progress & Bottom Actions */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  <span>Checklist Progress</span>
                  <span style={{ color: 'var(--primary)' }}>{event.checklistProgress}%</span>
                </div>
                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <div style={{ width: `${event.checklistProgress}%`, height: '100%', background: 'var(--primary)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Open Workspace →</span>
                  <button
                    onClick={(e) => handleDelete(e, event.id)}
                    title="Delete Event"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-light)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-light)'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.25rem', color: '#1e1b4b' }}>Create New Event</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Sanya & Kabir's Sangeet & Wedding"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Event Type</label>
                  <select
                    className="form-select"
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Reception">Reception</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Birthday">Birthday Party</option>
                    <option value="Corporate">Corporate Conference</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Cocktail Party">Cocktail Party</option>
                    <option value="Other">Other Celebration</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Event Date</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Destination / City</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Bangalore, Mumbai, Goa..."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Guest Count</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="form-control"
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Total Estimated Budget (₹)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="5000"
                  className="form-control"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event Description / Special Vision</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Tell us about the theme, dietary preferences, or specific rituals..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{
                background: 'var(--primary-light)',
                color: '#312e81',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.8rem',
                marginBottom: '1.25rem'
              }}>
                ✨ <strong>Planora AI Automation:</strong> We will automatically initialize a tailored budget breakdown and milestone checklist for your {formData.eventType}!
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Initialize Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsList;
