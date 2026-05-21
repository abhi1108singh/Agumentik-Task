const { v4: uuidv4 } = require('uuid');

class Ticket {
  constructor(type) {
    this.id = uuidv4();
    this.type = type; // 'billing' or 'technical'
    this.createdAt = Date.now();
    this.initialPriority = 1;
    this.currentPriority = 1;
    this.displacementCount = 0;
    this.status = 'waiting'; // 'waiting', 'in-progress', 'resolved'
    this.lastPriorityUpdate = Date.now();
  }

  // Calculate priority based on time waited and displacement
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

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      createdAt: this.createdAt,
      initialPriority: this.initialPriority,
      currentPriority: this.currentPriority,
      displacementCount: this.displacementCount,
      status: this.status,
      lastPriorityUpdate: this.lastPriorityUpdate
    };
  }
}

module.exports = Ticket;
