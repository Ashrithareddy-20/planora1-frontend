import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit, 
  ArrowLeft,
  AlertTriangle,
  Clock,
  Check,
  Store,
  Tag,
  Star,
  BookmarkCheck,
  Bot
} from 'lucide-react';
import { 
  eventApi, 
  budgetApi, 
  checklistApi, 
  aiApi, 
  bookingApi 
} from '../services/api';
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

const EventDetail = ({ onOpenAiChat }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'budget' | 'checklist' | 'recommendations' | 'bookings'
  const [loading, setLoading] = useState(true);

  // Budget state
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [budgetItems, setBudgetItems] = useState([]);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newBudgetItem, setNewBudgetItem] = useState({
    category: 'VENUE',
    title: '',
    allocatedAmount: 10000,
    actualAmount: 0,
    notes: ''
  });

  // Checklist state
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Planning',
    dueDate: '',
    priority: 'MEDIUM'
  });

  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingModalVendor, setBookingModalVendor] = useState(null);
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    loadEventData();
  }, [id]);

  const loadEventData = async () => {
    setLoading(true);
    try {
      const evRes = await eventApi.getById(id);
      setEvent(evRes.data);
      loadBudget();
      loadChecklist();
      loadBookings();
    } catch (err) {
      console.error(err);
      alert('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const loadBudget = () => {
    budgetApi.getSummary(id).then(res => {
      setBudgetSummary(res.data);
      setBudgetItems(res.data.items || []);
    }).catch(() => {});
  };

  const loadChecklist = () => {
    checklistApi.getTasks(id).then(res => {
      setTasks(res.data || []);
    }).catch(() => {});
  };

  const loadBookings = () => {
    bookingApi.getMyRequests().then(res => {
      const eventBookings = (res.data || []).filter(b => b.eventId === Number(id));
      setBookings(eventBookings);
    }).catch(() => {});
  };

  const loadRecommendations = (category = null) => {
    setRecLoading(true);
    aiApi.getRecommendationsForEvent(id, category).then(res => {
      setRecommendations(res.data || []);
    }).catch(err => console.error(err))
      .finally(() => setRecLoading(false));
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await eventApi.update(id, {
        ...event,
        status: newStatus
      });
      setEvent(updated.data);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Budget Handlers
  const handleAddBudgetItem = async (e) => {
    e.preventDefault();
    try {
      await budgetApi.create({
        ...newBudgetItem,
        eventId: Number(id),
        allocatedAmount: Number(newBudgetItem.allocatedAmount),
        actualAmount: Number(newBudgetItem.actualAmount || 0)
      });
      setShowBudgetModal(false);
      setNewBudgetItem({ category: 'VENUE', title: '', allocatedAmount: 10000, actualAmount: 0, notes: '' });
      loadBudget();
    } catch (err) {
      alert('Failed to add budget item');
    }
  };

  const handleDeleteBudgetItem = async (itemId) => {
    if (window.confirm('Delete this budget item?')) {
      try {
        await budgetApi.delete(itemId);
        loadBudget();
      } catch (err) {
        alert('Failed to delete budget item');
      }
    }
  };

  // Checklist Handlers
  const handleToggleTask = async (taskId) => {
    try {
      await checklistApi.toggle(taskId);
      loadChecklist();
      // reload event to sync progress
      eventApi.getById(id).then(res => setEvent(res.data)).catch(() => {});
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await checklistApi.create({
        ...newTask,
        eventId: Number(id),
        dueDate: newTask.dueDate || event.eventDate
      });
      setShowTaskModal(false);
      setNewTask({ title: '', category: 'Planning', dueDate: '', priority: 'MEDIUM' });
      loadChecklist();
    } catch (err) {
      alert('Failed to add checklist task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await checklistApi.delete(taskId);
        loadChecklist();
      } catch (err) {
        alert('Failed to delete task');
      }
    }
  };

  // Direct Booking from Recommendations
  const handleBookVendor = async (e) => {
    e.preventDefault();
    if (!bookingModalVendor) return;
    try {
      await bookingApi.create({
        eventId: Number(id),
        vendorId: bookingModalVendor.id,
        requestedDate: event.eventDate,
        estimatedPrice: bookingModalVendor.priceStarting,
        message: bookingMessage || `Booking request for ${event.title}`
      });
      alert(`Booking request submitted to ${bookingModalVendor.name}!`);
      setBookingModalVendor(null);
      setBookingMessage('');
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit booking');
    }
  };

  if (loading || !event) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading event workspace...
      </div>
    );
  }

  const chartData = budgetSummary?.categoryAllocations ? 
    Object.entries(budgetSummary.categoryAllocations).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Back button & Title Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Back to My Events
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '2.2rem', color: '#1e1b4b' }}>{event.title}</h1>
              <span className={`badge ${
                event.status === 'UPCOMING' ? 'badge-success' :
                event.status === 'COMPLETED' ? 'badge-primary' : 'badge-danger'
              }`}>
                {event.status}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {event.eventType} • 📍 {event.location} • 📅 {event.eventDate} • 👥 {event.guestCount} Guests
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              value={event.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="form-select"
              style={{ width: 'auto', fontWeight: 600 }}
            >
              <option value="UPCOMING">Status: Upcoming</option>
              <option value="COMPLETED">Status: Completed</option>
              <option value="CANCELLED">Status: Cancelled</option>
            </select>
            <button onClick={onOpenAiChat} className="btn btn-primary" style={{ padding: '0.625rem 1rem' }}>
              <Bot size={18} />
              AI Assistant
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '2rem',
        overflowX: 'auto'
      }}>
        {[
          { key: 'overview', label: 'Overview & Summary', icon: <Calendar size={16} /> },
          { key: 'budget', label: 'Budget Planner', icon: <DollarSign size={16} /> },
          { key: 'checklist', label: 'Checklist & Tasks', icon: <CheckCircle2 size={16} /> },
          { key: 'recommendations', label: 'AI Recommendations', icon: <Sparkles size={16} color="#ec4899" /> },
          { key: 'bookings', label: 'Bookings', icon: <BookmarkCheck size={16} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              if (tab.key === 'recommendations' && recommendations.length === 0) {
                loadRecommendations();
              }
            }}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Metric Cards */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Planned Budget</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e1b4b', margin: '4px 0' }}>
                ₹{event.totalBudget?.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                Allocated: ₹{(budgetSummary?.totalAllocated || 0).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Unallocated Balance</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: budgetSummary?.isOverBudget ? 'var(--danger)' : 'var(--success)', margin: '4px 0' }}>
                ₹{(budgetSummary?.remainingBudget || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {budgetSummary?.isOverBudget ? '⚠️ Exceeding Total Budget' : 'Within budget range'}
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Milestones Completed</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', margin: '4px 0' }}>
                {event.completedTasks} / {event.totalTasks}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {event.checklistProgress}% Completed
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Vendor Bookings</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary)', margin: '4px 0' }}>
                {bookings.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {bookings.filter(b => b.status === 'ACCEPTED').length} Confirmed
              </div>
            </div>
          </div>

          {/* Description & Action highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', color: '#1e1b4b', marginBottom: '0.75rem' }}>About This Celebration</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.925rem', marginBottom: '1.5rem' }}>
                {event.description || 'No description provided. You can update details, preferences and requirements anytime.'}
              </p>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={16} color="var(--primary)" /> Next Recommended Steps:
                </h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  <li>Review the <strong>Budget Planner</strong> tab to customize your venue & catering allocations.</li>
                  <li>Explore <strong>AI Recommendations</strong> to view venues in {event.location} capacity-matched for {event.guestCount} guests.</li>
                  <li>Check off pending tasks in the <strong>Checklist & Tasks</strong> tab.</li>
                </ul>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', color: '#1e1b4b', marginBottom: '1rem' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={() => { setActiveTab('recommendations'); loadRecommendations(); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                  <Sparkles size={16} color="#ec4899" /> Find Matched Vendors in {event.location}
                </button>
                <button onClick={() => { setActiveTab('budget'); setShowBudgetModal(true); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                  <DollarSign size={16} color="var(--primary)" /> Add Custom Expense Item
                </button>
                <button onClick={() => { setActiveTab('checklist'); setShowTaskModal(true); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                  <CheckCircle2 size={16} color="var(--success)" /> Add Task Milestone
                </button>
                <button onClick={onOpenAiChat} className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                  <Bot size={16} /> Plan with Planora AI Concierge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUDGET PLANNER */}
      {activeTab === 'budget' && (
        <div>
          {/* Overbudget warning */}
          {budgetSummary?.isOverBudget && (
            <div style={{
              background: 'var(--danger-light)',
              border: '1px solid #fecaca',
              color: 'var(--danger)',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <AlertTriangle size={20} />
              <div>
                <strong>Overbudget Notice:</strong> Total allocated budget (₹{budgetSummary.totalAllocated.toLocaleString('en-IN')}) exceeds your total target (₹{event.totalBudget.toLocaleString('en-IN')}). Consider adjusting allocations below.
              </div>
            </div>
          )}

          {/* Charts and summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Expense Breakdown by Category</h3>
              {chartData.length > 0 ? (
                <div style={{ height: '260px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {chartData.map((e, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No items yet.</div>
              )}
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Allocated vs Remaining Budget</h3>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Total Budget', amount: event.totalBudget },
                    { name: 'Allocated', amount: budgetSummary?.totalAllocated || 0 },
                    { name: 'Actual Spent', amount: budgetSummary?.totalSpent || 0 }
                  ]}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                    <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Budget items table */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#1e1b4b' }}>Category Budget Allocations</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage estimated caps and track actual spent payments</p>
              </div>
              <button onClick={() => setShowBudgetModal(true)} className="btn btn-primary btn-sm">
                <Plus size={16} /> Add Expense Item
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Category</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Title</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Allocated Amount</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Actual Spent</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Notes</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className="badge badge-primary">{item.category}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{item.title}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                        ₹{item.allocatedAmount?.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        ₹{(item.actualAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{item.notes || '—'}</td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteBudgetItem(item.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                          title="Delete item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHECKLIST & TASKS */}
      {activeTab === 'checklist' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#1e1b4b' }}>Event Preparation Milestones</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed ({event.checklistProgress}%)
              </p>
            </div>
            <button onClick={() => setShowTaskModal(true)} className="btn btn-primary btn-sm">
              <Plus size={16} /> Add New Task
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tasks.map(task => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: task.completed ? '#f8fafc' : '#ffffff',
                  opacity: task.completed ? 0.75 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={!!task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <div>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? 'var(--text-muted)' : '#1e1b4b'
                    }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '2px' }}>
                      <span>Category: {task.category}</span>
                      <span>Due: {task.dueDate || 'Unscheduled'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge ${
                    task.priority === 'HIGH' ? 'badge-danger' :
                    task.priority === 'MEDIUM' ? 'badge-warning' : 'badge-primary'
                  }`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
                    title="Delete Task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AI RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#1e1b4b' }}>
                AI-Matched Service Providers for {event.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                RAG algorithm ranked by location ({event.location}), target guests ({event.guestCount}), and budget fit
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => loadRecommendations()} className="btn btn-secondary btn-sm">
                All Categories
              </button>
              <button onClick={() => loadRecommendations('VENUE')} className="btn btn-secondary btn-sm">
                Venues
              </button>
              <button onClick={() => loadRecommendations('CATERING')} className="btn btn-secondary btn-sm">
                Catering
              </button>
              <button onClick={() => loadRecommendations('PHOTOGRAPHY')} className="btn btn-secondary btn-sm">
                Photography
              </button>
            </div>
          </div>

          {recLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              Consulting Planora AI matching engine & database...
            </div>
          ) : (
            <div className="grid-3">
              {recommendations.map((rec, index) => {
                const vendor = rec.vendor;
                return (
                  <div key={index} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ height: '170px', position: 'relative' }}>
                        <img src={vendor.imageUrl} alt={vendor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                          color: '#fff',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          {rec.matchScore}% Match
                        </div>
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
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
                        <h4 style={{ fontSize: '1.1rem', color: '#1e1b4b', marginBottom: '0.25rem' }}>{vendor.name}</h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                          📍 {vendor.city} {vendor.maxGuestCapacity ? `• 👥 Up to ${vendor.maxGuestCapacity} guests` : ''}
                        </div>

                        {/* AI Match Explanation */}
                        <div style={{
                          background: '#f5f3ff',
                          border: '1px solid #ddd6fe',
                          padding: '0.75rem',
                          borderRadius: '10px',
                          fontSize: '0.775rem',
                          color: '#4338ca',
                          marginBottom: '0.875rem',
                          lineHeight: 1.5
                        }}>
                          <strong>AI Why:</strong> {rec.matchReason}
                        </div>

                        {/* Highlights */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
                          {rec.highlights?.map((h, i) => (
                            <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Check size={12} color="var(--success)" /> {h}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Starting Price</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{vendor.priceStarting?.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <button 
                        onClick={() => setBookingModalVendor(vendor)}
                        className="btn btn-primary btn-sm"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', color: '#1e1b4b', marginBottom: '1rem' }}>
            Bookings Submitted for this Event
          </h3>
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No booking requests sent yet. Check the <strong>AI Recommendations</strong> tab to book vendors!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={b.vendorImage} alt={b.vendorName} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e1b4b' }}>{b.vendorName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {b.vendorCategory} • Requested Date: {b.requestedDate}
                      </div>
                      {b.message && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>"{b.message}"</div>}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${
                      b.status === 'ACCEPTED' ? 'badge-success' :
                      b.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {b.status}
                    </span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                      ₹{b.estimatedPrice?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Budget Item */}
      {showBudgetModal && (
        <div className="modal-overlay" onClick={() => setShowBudgetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', color: '#1e1b4b' }}>Add Expense Item</h3>
              <button onClick={() => setShowBudgetModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleAddBudgetItem}>
              <div className="form-group">
                <label className="form-label">Service Category</label>
                <select
                  className="form-select"
                  value={newBudgetItem.category}
                  onChange={(e) => setNewBudgetItem({ ...newBudgetItem, category: e.target.value })}
                >
                  <option value="VENUE">VENUE</option>
                  <option value="CATERING">CATERING</option>
                  <option value="DECORATION">DECORATION</option>
                  <option value="PHOTOGRAPHY">PHOTOGRAPHY</option>
                  <option value="MAKEUP">MAKEUP</option>
                  <option value="ENTERTAINMENT">ENTERTAINMENT</option>
                  <option value="TRANSPORTATION">TRANSPORTATION</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Title / Description</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Cocktail Bar Counter Setup"
                  value={newBudgetItem.title}
                  onChange={(e) => setNewBudgetItem({ ...newBudgetItem, title: e.target.value })}
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Allocated Budget (₹)</label>
                  <input
                    type="number"
                    required
                    className="form-control"
                    value={newBudgetItem.allocatedAmount}
                    onChange={(e) => setNewBudgetItem({ ...newBudgetItem, allocatedAmount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Actual Spent (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newBudgetItem.actualAmount}
                    onChange={(e) => setNewBudgetItem({ ...newBudgetItem, actualAmount: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 50% deposit paid"
                  value={newBudgetItem.notes}
                  onChange={(e) => setNewBudgetItem({ ...newBudgetItem, notes: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowBudgetModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', color: '#1e1b4b' }}>Add Checklist Task</h3>
              <button onClick={() => setShowTaskModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleAddTask}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Schedule final sound test with DJ"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Entertainment"
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Book Vendor Directly */}
      {bookingModalVendor && (
        <div className="modal-overlay" onClick={() => setBookingModalVendor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', color: '#1e1b4b' }}>
                Book {bookingModalVendor.name}
              </h3>
              <button onClick={() => setBookingModalVendor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleBookVendor}>
              <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div><strong>Category:</strong> {bookingModalVendor.category}</div>
                <div><strong>Location:</strong> {bookingModalVendor.city}</div>
                <div><strong>Event Date:</strong> {event.eventDate}</div>
                <div style={{ marginTop: '4px', fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                  Estimated Price: ₹{bookingModalVendor.priceStarting?.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Special Requirements / Message</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Share details on timing, guest count or specific requests..."
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setBookingModalVendor(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Booking Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
