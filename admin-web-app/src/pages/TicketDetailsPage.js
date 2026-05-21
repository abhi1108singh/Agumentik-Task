import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/TicketDetailsPage.css';

const TicketDetailsPage = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState('');
  const [satisfaction, setSatisfaction] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchTicketDetails();
    const interval = setInterval(fetchTicketDetails, 5000);
    return () => clearInterval(interval);
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    try {
      const [ticketRes, historyRes] = await Promise.all([
        axios.get(`${API_URL}/tickets/${ticketId}`),
        axios.get(`${API_URL}/tickets/${ticketId}/history`)
      ]);
      setTicket(ticketRes.data.data);
      setHistory(historyRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await axios.post(`${API_URL}/tickets/${ticketId}/comments`, {
        author: 'admin',
        message: comment
      });
      setComment('');
      fetchTicketDetails();
    } catch (error) {
      alert('Error adding comment');
    }
  };

  const handleAddTags = async () => {
    if (!tags.trim()) return;
    try {
      await axios.post(`${API_URL}/tickets/${ticketId}/tags`, {
        tags: tags.split(',').map(t => t.trim())
      });
      setTags('');
      fetchTicketDetails();
    } catch (error) {
      alert('Error adding tags');
    }
  };

  const handleResolve = async () => {
    try {
      await axios.post(`${API_URL}/tickets/${ticketId}/resolve`, {
        satisfaction
      });
      fetchTicketDetails();
    } catch (error) {
      alert('Error resolving ticket');
    }
  };

  if (loading) {
    return <div className="loading">Loading ticket details...</div>;
  }

  if (!ticket) {
    return <div className="error">Ticket not found</div>;
  }

  const getStatusColor = (status) => {
    const colors = {
      waiting: '#FFA500',
      'in-progress': '#4ECDC4',
      resolved: '#4CAF50'
    };
    return colors[status] || '#999';
  };

  const getTypeEmoji = (type) => {
    return type === 'billing' ? '💳' : '🔧';
  };

  return (
    <div className="ticket-details-page">
      <div className="ticket-header">
        <h1>Ticket #{ticket.id.substring(0, 8)}</h1>
        <div className="ticket-meta">
          <span className="badge" style={{ background: getStatusColor(ticket.status) }}>
            {ticket.status.toUpperCase()}
          </span>
          <span className="badge" style={{ background: ticket.type === 'billing' ? '#FF6B6B' : '#4ECDC4' }}>
            {getTypeEmoji(ticket.type)} {ticket.type}
          </span>
        </div>
      </div>

      <div className="ticket-content">
        <div className="ticket-main">
          {/* Ticket Information */}
          <section className="card info-section">
            <h2>Ticket Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Priority</label>
                <div className="priority-display">
                  <div className="priority-value">{ticket.currentPriority.toFixed(2)}</div>
                  <div className="priority-bar">
                    <div className="priority-fill" style={{ width: `${(ticket.currentPriority / 100) * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="info-item">
                <label>Queue Position</label>
                <div className="value">#{ticket.queuePosition || 'N/A'}</div>
              </div>
              <div className="info-item">
                <label>Displacement Count</label>
                <div className="value">{ticket.displacementCount}/3</div>
              </div>
              <div className="info-item">
                <label>Created</label>
                <div className="value">{new Date(ticket.createdAt).toLocaleString()}</div>
              </div>
              {ticket.resolvedAt && (
                <div className="info-item">
                  <label>Resolved</label>
                  <div className="value">{new Date(ticket.resolvedAt).toLocaleString()}</div>
                </div>
              )}
              {ticket.resolutionTime && (
                <div className="info-item">
                  <label>Resolution Time</label>
                  <div className="value">{Math.floor(ticket.resolutionTime / 60000)} minutes</div>
                </div>
              )}
            </div>
          </section>

          {/* Notes */}
          {ticket.notes && (
            <section className="card notes-section">
              <h2>Notes</h2>
              <p>{ticket.notes}</p>
            </section>
          )}

          {/* Tags */}
          <section className="card tags-section">
            <h2>Tags</h2>
            <div className="tags-list">
              {ticket.tags && ticket.tags.length > 0 ? (
                ticket.tags.map((tag, idx) => (
                  <span key={idx} className="tag">
                    {tag}
                  </span>
                ))
              ) : (
                <p className="no-data">No tags</p>
              )}
            </div>
            <div className="add-tags">
              <input
                type="text"
                placeholder="Add tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <button onClick={handleAddTags}>Add Tags</button>
            </div>
          </section>

          {/* Comments */}
          <section className="card comments-section">
            <h2>Comments ({ticket.comments.length})</h2>
            <div className="comments-list">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment, idx) => (
                  <div key={idx} className="comment">
                    <div className="comment-header">
                      <strong>{comment.author}</strong>
                      <span className="timestamp">{new Date(comment.timestamp).toLocaleString()}</span>
                    </div>
                    <p>{comment.message}</p>
                  </div>
                ))
              ) : (
                <p className="no-data">No comments yet</p>
              )}
            </div>
            <div className="add-comment">
              <textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
              />
              <button onClick={handleAddComment}>Add Comment</button>
            </div>
          </section>
        </div>

        <div className="ticket-sidebar">
          {/* Actions */}
          <section className="card actions-section">
            <h2>Actions</h2>
            {ticket.status === 'waiting' && (
              <button className="btn btn-primary btn-full">
                Start Processing
              </button>
            )}
            {ticket.status === 'in-progress' && (
              <div>
                <div className="satisfaction-rating">
                  <label>Satisfaction Rating:</label>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`star ${satisfaction === star ? 'active' : ''}`}
                        onClick={() => setSatisfaction(star)}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
                <button className="btn btn-success btn-full" onClick={handleResolve}>
                  Resolve Ticket
                </button>
              </div>
            )}
          </section>

          {/* History Timeline */}
          <section className="card history-section">
            <h2>Activity Timeline</h2>
            <div className="timeline">
              {history && history.length > 0 ? (
                history.map((entry, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <strong>{entry.action.replace('_', ' ').toUpperCase()}</strong>
                      <small>{new Date(entry.timestamp).toLocaleString()}</small>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No activity yet</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsPage;
