const { v4: uuidv4 } = require('uuid');

class Ticket {
  constructor(type, notes = '') {
    this.id = uuidv4();
    this.type = type; // 'billing' or 'technical'
    this.createdAt = Date.now();
    this.initialPriority = 1;
    this.currentPriority = 1;
    this.displacementCount = 0;
    this.status = 'waiting'; // 'waiting', 'in-progress', 'resolved'
    this.lastPriorityUpdate = Date.now();
    this.notes = notes;
    this.tags = [];
    this.assignedTo = null;
    this.resolvedAt = null;
    this.resolutionTime = null; // in milliseconds
    this.satisfaction = null; // 1-5 rating
    this.comments = [];
  }

  // Calculate priority based on time waited
  calculatePriority() {
    const timeWaitedMs = Date.now() - this.createdAt;
    const timeWaitedMinutes = Math.floor(timeWaitedMs / 60000);
    
    // Priority increases by 0.1 for every minute waited
    const timeBonusPriority = this.initialPriority + (timeWaitedMinutes * 0.1);
    
    // Final priority calculation
    this.currentPriority = Math.min(timeBonusPriority, 100); // Cap at 100
    this.lastPriorityUpdate = Date.now();
    
    return this.currentPriority;
  }

  incrementDisplacement() {
    if (this.displacementCount < 3) {
      this.displacementCount++;
      return true;
    }
    return false; // Cannot displace further
  }

  canBeDisplaced() {
    return this.displacementCount < 3;
  }

  // Assign ticket to support agent
  assign(agentId) {
    this.assignedTo = agentId;
    return this;
  }

  // Resolve ticket
  resolve(resolutionNotes = '') {
    this.status = 'resolved';
    this.resolvedAt = Date.now();
    this.resolutionTime = this.resolvedAt - this.createdAt;
    if (resolutionNotes) {
      this.comments.push({
        author: 'system',
        message: resolutionNotes,
        timestamp: Date.now()
      });
    }
    return this;
  }

  // Add comment
  addComment(author, message) {
    this.comments.push({
      author,
      message,
      timestamp: Date.now()
    });
    return this;
  }

  // Add tags
  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
    return this;
  }

  // Set satisfaction rating
  setSatisfaction(rating) {
    if (rating >= 1 && rating <= 5) {
      this.satisfaction = rating;
      return true;
    }
    return false;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      createdAt: this.createdAt,
      initialPriority: this.initialPriority,
      currentPriority: this.currentPriority,
      displacementCount: this.displacementCount,
      status: this.status,
      lastPriorityUpdate: this.lastPriorityUpdate,
      notes: this.notes,
      tags: this.tags,
      assignedTo: this.assignedTo,
      resolvedAt: this.resolvedAt,
      resolutionTime: this.resolutionTime,
      satisfaction: this.satisfaction,
      comments: this.comments
    };
  }
}

module.exports = Ticket;
