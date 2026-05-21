const TicketHistory = require('../models/TicketHistory');

class AnalyticsService {
  constructor() {
    this.history = [];
  }

  // Log ticket action
  logAction(ticketId, action, details = {}) {
    const historyEntry = new TicketHistory(ticketId, action, details);
    this.history.push(historyEntry);
    return historyEntry;
  }

  // Get ticket history
  getTicketHistory(ticketId) {
    return this.history
      .filter(h => h.ticketId === ticketId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get all history with filters
  getHistory(filters = {}) {
    let filtered = this.history;

    if (filters.ticketId) {
      filtered = filtered.filter(h => h.ticketId === filters.ticketId);
    }

    if (filters.action) {
      filtered = filtered.filter(h => h.action === filters.action);
    }

    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate).getTime();
      const end = new Date(filters.endDate).getTime();
      filtered = filtered.filter(h => h.timestamp >= start && h.timestamp <= end);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get analytics summary
  getAnalyticsSummary(tickets) {
    const totalTickets = tickets.length;
    const byType = {};
    const byStatus = {};
    let totalWaitTime = 0;
    let totalPriority = 0;

    tickets.forEach(ticket => {
      // Count by type
      byType[ticket.type] = (byType[ticket.type] || 0) + 1;

      // Count by status
      byStatus[ticket.status] = (byStatus[ticket.status] || 0) + 1;

      // Calculate average wait time
      const waitTime = Date.now() - ticket.createdAt;
      totalWaitTime += waitTime;

      // Calculate average priority
      totalPriority += ticket.currentPriority;
    });

    return {
      totalTickets,
      byType,
      byStatus,
      averageWaitTimeMs: totalTickets > 0 ? totalWaitTime / totalTickets : 0,
      averagePriority: totalTickets > 0 ? totalPriority / totalTickets : 0,
      priorityStats: this.getPriorityStats(tickets),
      typeStats: this.getTypeStats(tickets),
      statusStats: this.getStatusStats(tickets)
    };
  }

  // Get priority statistics
  getPriorityStats(tickets) {
    if (tickets.length === 0) {
      return {
        highest: 0,
        lowest: 0,
        average: 0,
        median: 0,
        distribution: {}
      };
    }

    const priorities = tickets.map(t => t.currentPriority).sort((a, b) => a - b);
    const highest = Math.max(...priorities);
    const lowest = Math.min(...priorities);
    const average = priorities.reduce((a, b) => a + b, 0) / priorities.length;
    const median = priorities[Math.floor(priorities.length / 2)];

    // Priority distribution (0-20, 20-40, 40-60, 60-80, 80-100)
    const distribution = {
      'low': priorities.filter(p => p < 20).length,
      'low-medium': priorities.filter(p => p >= 20 && p < 40).length,
      'medium': priorities.filter(p => p >= 40 && p < 60).length,
      'medium-high': priorities.filter(p => p >= 60 && p < 80).length,
      'high': priorities.filter(p => p >= 80).length
    };

    return {
      highest,
      lowest,
      average,
      median,
      distribution
    };
  }

  // Get type-wise statistics
  getTypeStats(tickets) {
    const stats = {};

    tickets.forEach(ticket => {
      if (!stats[ticket.type]) {
        stats[ticket.type] = {
          count: 0,
          averagePriority: 0,
          averageWaitTime: 0,
          byStatus: {}
        };
      }

      stats[ticket.type].count += 1;
      stats[ticket.type].averagePriority += ticket.currentPriority;
      stats[ticket.type].averageWaitTime += (Date.now() - ticket.createdAt);
      
      stats[ticket.type].byStatus[ticket.status] = 
        (stats[ticket.type].byStatus[ticket.status] || 0) + 1;
    });

    // Calculate averages
    Object.keys(stats).forEach(type => {
      const typeData = stats[type];
      typeData.averagePriority = typeData.count > 0 ? typeData.averagePriority / typeData.count : 0;
      typeData.averageWaitTime = typeData.count > 0 ? typeData.averageWaitTime / typeData.count : 0;
    });

    return stats;
  }

  // Get status-wise statistics
  getStatusStats(tickets) {
    const stats = {};

    tickets.forEach(ticket => {
      if (!stats[ticket.status]) {
        stats[ticket.status] = {
          count: 0,
          averagePriority: 0,
          averageWaitTime: 0,
          displacementStats: {}
        };
      }

      stats[ticket.status].count += 1;
      stats[ticket.status].averagePriority += ticket.currentPriority;
      stats[ticket.status].averageWaitTime += (Date.now() - ticket.createdAt);
      
      const dispKey = `${ticket.displacementCount}/3`;
      stats[ticket.status].displacementStats[dispKey] = 
        (stats[ticket.status].displacementStats[dispKey] || 0) + 1;
    });

    // Calculate averages
    Object.keys(stats).forEach(status => {
      const statusData = stats[status];
      statusData.averagePriority = statusData.count > 0 ? statusData.averagePriority / statusData.count : 0;
      statusData.averageWaitTime = statusData.count > 0 ? statusData.averageWaitTime / statusData.count : 0;
    });

    return stats;
  }

  // Get displacement analysis
  getDisplacementAnalysis(tickets) {
    const analysis = {
      ticketsWithoutDisplacement: 0,
      ticketsWithDisplacement: 0,
      maxDisplacementReached: 0,
      averageDisplacement: 0,
      displacementDistribution: {}
    };

    let totalDisplacements = 0;

    tickets.forEach(ticket => {
      if (ticket.displacementCount === 0) {
        analysis.ticketsWithoutDisplacement += 1;
      } else {
        analysis.ticketsWithDisplacement += 1;
        totalDisplacements += ticket.displacementCount;
      }

      if (ticket.displacementCount === 3) {
        analysis.maxDisplacementReached += 1;
      }

      const dispKey = ticket.displacementCount.toString();
      analysis.displacementDistribution[dispKey] = 
        (analysis.displacementDistribution[dispKey] || 0) + 1;
    });

    analysis.averageDisplacement = tickets.length > 0 ? totalDisplacements / tickets.length : 0;

    return analysis;
  }

  // Get wait time analysis
  getWaitTimeAnalysis(tickets) {
    if (tickets.length === 0) {
      return {
        total: 0,
        average: 0,
        minimum: 0,
        maximum: 0,
        median: 0
      };
    }

    const waitTimes = tickets.map(t => Date.now() - t.createdAt);
    const total = waitTimes.reduce((a, b) => a + b, 0);
    const average = total / tickets.length;
    const minimum = Math.min(...waitTimes);
    const maximum = Math.max(...waitTimes);
    const sorted = waitTimes.sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    return {
      totalMs: total,
      averageMs: average,
      minimumMs: minimum,
      maximumMs: maximum,
      medianMs: median
    };
  }

  // Clear old history (older than 24 hours)
  clearOldHistory() {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.history = this.history.filter(h => h.timestamp > oneDayAgo);
  }
}

module.exports = new AnalyticsService();
