import React from 'react';
import './QueueTable.css';

const QueueTable = ({ queue, onProcess, onResolve }) => {
  const getTypeColor = (type) => {
    return type === 'billing' ? '#FF6B6B' : '#4ECDC4';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return '#FFA500';
      case 'in-progress':
        return '#4ECDC4';
      case 'resolved':
        return '#4CAF50';
      default:
        return '#999';
    }
  };

  return (
    <div className="queue-table-container">
      <table className="queue-table">
        <thead>
          <tr>
            <th>Position</th>
            <th>Ticket ID</th>
            <th>Type</th>
            <th>Priority</th>
            <th>Displacement</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {queue && queue.length > 0 ? (
            queue.map((ticket, index) => (
              <tr key={ticket.id} className="ticket-row">
                <td className="position-cell">
                  <span className="badge badge-primary">#{index + 1}</span>
                </td>
                <td className="id-cell">
                  <code>{ticket.id.substring(0, 8)}</code>
                </td>
                <td>
                  <span
                    className="badge"
                    style={{ backgroundColor: getTypeColor(ticket.type) }}
                  >
                    {ticket.type}
                  </span>
                </td>
                <td className="priority-cell">
                  <strong>{ticket.currentPriority.toFixed(2)}</strong>
                </td>
                <td className="displacement-cell">
                  {ticket.displacementCount}/3
                  <div className="progress-mini">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(ticket.displacementCount / 3) * 100}%`,
                        backgroundColor:
                          ticket.displacementCount >= 3 ? '#4CAF50' : '#FF6B6B',
                      }}
                    />
                  </div>
                </td>
                <td>
                  <span
                    className="badge"
                    style={{ backgroundColor: getStatusColor(ticket.status) }}
                  >
                    {ticket.status}
                  </span>
                </td>
                <td className="time-cell">
                  {new Date(ticket.createdAt).toLocaleTimeString()}
                </td>
                <td className="actions-cell">
                  {ticket.status === 'waiting' && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => onProcess(ticket.id)}
                    >
                      Start
                    </button>
                  )}
                  {ticket.status === 'in-progress' && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => onResolve(ticket.id)}
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="no-data">
                No tickets in queue
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default QueueTable;
