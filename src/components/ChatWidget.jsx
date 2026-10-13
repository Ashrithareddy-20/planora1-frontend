import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, CornerDownLeft, RefreshCw } from 'lucide-react';
import { aiApi, eventApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChatWidget = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm **Planora AI**, your intelligent event planning assistant. Ask me about budget allocations, vendor comparisons, checklists, or event timelines!",
      suggestions: ["Budget breakdown for ₹15 Lakhs wedding", "Recommend top Bangalore caterers", "What should I do 1 month before event?"]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      eventApi.getAll().then(res => {
        setEvents(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedEventId(res.data[0].id);
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await aiApi.chat({
        message: textToSend,
        eventId: selectedEventId ? Number(selectedEventId) : null,
        history: historyPayload
      });

      const assistantMsg = {
        role: 'assistant',
        content: res.data.reply,
        retrievedContext: res.data.retrievedContext,
        suggestions: res.data.suggestions || []
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "⚠️ I encountered an issue connecting to the AI service. Please check your network and try again.",
        suggestions: ["Try again"]
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text) => {
    // Quick formatter for bold, headers, list items
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formatted = line;
      if (line.startsWith('### ')) {
        return <h4 key={idx} style={{ fontSize: '1rem', fontWeight: 700, margin: '0.5rem 0', color: '#1e1b4b' }}>{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('#### ')) {
        return <h5 key={idx} style={{ fontSize: '0.925rem', fontWeight: 600, margin: '0.4rem 0', color: '#312e81' }}>{line.replace('#### ', '')}</h5>;
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} style={{ marginLeft: '1.25rem', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
            <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace('- ', '')) }} />
          </li>
        );
      }
      return (
        <p key={idx} style={{ marginBottom: line.trim() ? '0.5rem' : '0.25rem', fontSize: '0.875rem' }}>
          <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        </p>
      );
    });
  };

  const formatInline = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:#f1f5f9;padding:2px 4px;border-radius:4px;font-size:0.8em">$1</code>');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '420px',
      maxWidth: 'calc(100vw - 48px)',
      height: '620px',
      maxHeight: 'calc(100vh - 100px)',
      background: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: '#ffffff',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '6px',
            borderRadius: '10px',
            display: 'flex'
          }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Planora AI Assistant
              <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.25)', padding: '2px 6px', borderRadius: '6px' }}>RAG</span>
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Database-synced event advisor</div>
          </div>
        </div>
        <button 
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Event Context Selector */}
      {events.length > 0 && (
        <div style={{
          background: '#f8fafc',
          padding: '0.5rem 1rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <span>Active Event:</span>
          <select 
            value={selectedEventId} 
            onChange={(e) => setSelectedEventId(e.target.value)}
            style={{
              flex: 1,
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '2px 6px',
              fontSize: '0.75rem',
              backgroundColor: '#fff'
            }}
          >
            <option value="">General (No specific event)</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.eventType})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Messages Stream */}
      <div style={{
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        background: '#f8fafc'
      }}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            <div style={{
              background: msg.role === 'user' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : '#ffffff',
              color: msg.role === 'user' ? '#ffffff' : 'var(--text-main)',
              padding: '0.75rem 1rem',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              lineHeight: 1.5
            }}>
              {msg.role === 'user' ? msg.content : renderMarkdown(msg.content)}
            </div>

            {/* Suggestions Chips */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                {msg.suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sug)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #c7d2fe',
                      color: '#4338ca',
                      fontSize: '0.75rem',
                      padding: '4px 8px',
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    ✨ {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            background: '#fff',
            padding: '0.625rem 1rem',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <RefreshCw size={14} className="spin" />
            Analyzing database vendors & budget context...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{
          padding: '0.75rem 1rem',
          background: '#ffffff',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <input
          type="text"
          placeholder="Ask Planora AI anything about your event..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '0.625rem 0.875rem',
            fontSize: '0.875rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
            opacity: (!input.trim() || loading) ? 0.6 : 1
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
