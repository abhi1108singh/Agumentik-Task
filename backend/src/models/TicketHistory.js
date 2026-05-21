class TicketHistory {
  constructor(ticketId, action, details = {}) {
    this.id = Date.now().toString();
    this.ticketId = ticketId;
    this.action = action; // 'created', 'status_changed', 'priority_updated', 'displaced', 'resolved'
    this.timestamp = Date.now();
    this.details = details;
  }

  toJSON() {
    return {
      id: this.id,
      ticketId: this.ticketId,
      action: this.action,
      timestamp: this.timestamp,
      details: this.details
    };
  }
}

module.exports = TicketHistory;
