import React, { useState, useEffect } from 'react';
import './App.css';
import QueueTable from './components/QueueTable';
import StatsCard from './components/StatsCard';
import { getQueue, getQueueStats, startProcessing, resolveTicket } from './services/api';

function App() {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [queueData, statsData] = await Promise.all([
        getQueue(),
        getQueueStats(),
      ]);

      if (queueData.success) {
        setQueue(queueData.data || []);
      }

      if (statsData.success) {
        setStats(statsData.data);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Make sure backend is running.');
      setLoading(false);
    }
  };

  const handleStartProcessing = async (ticketId) => {
    try {
      const result = await startProcessing(ticketId);
      if (result.success) {
        fetchData();
      }
    } catch (err) {
      alert('Error starting processing');
    }
  };

  const handleResolveTicket = async (ticketId) => {
    try {
      const result = await resolveTicket(ticketId);
      if (result.success) {
        fetchData();
      }
    } catch (err) {
      alert('Error resolving ticket');
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>📋 Admin Dashboard</h1>
          <p>Ticket Queue Management System</p>
        </div>
        <div className="header-status">
          <span className={`status ${loading ? 'loading' : 'connected'}`}>
            ● {loading ? 'Loading...' : 'Live'}
          </span>
        </div>
      </header>

      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}

        <section className="stats-section">
          <h2>Queue Statistics</h2>
          <div className="stats-grid">
            {stats && (
              <>
                <StatsCard
                  title="Total Tickets"
                  value={stats.totalTickets}
                  icon="🎫"
                  color="#4ECDC4"
                />
                <StatsCard
                  title="Waiting"
                  value={stats.waitingTickets}
                  icon="⏳"
                  color="#FFA500"
                />
                <StatsCard
                  title="Billing"
                  value={stats.billingTickets}
                  icon="💳"
                  color="#FF6B6B"
                />
                <StatsCard
                  title="Technical"
                  value={stats.technicalTickets}
                  icon="🔧"
                  color="#9B59B6"
                />
                <StatsCard
                  title="Avg Wait Time"
                  value={`${stats.averageWaitTime} min`}
                  icon="⏱️"
                  color="#3498DB"
                />
              </>
            )}
          </div>
        </section>

        <section className="queue-section">
          <h2>Current Queue</h2>
          {loading ? (
            <div className="loading">
              <span>Loading queue...</span>
            </div>
          ) : (
            <QueueTable
              queue={queue}
              onProcess={handleStartProcessing}
              onResolve={handleResolveTicket}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
