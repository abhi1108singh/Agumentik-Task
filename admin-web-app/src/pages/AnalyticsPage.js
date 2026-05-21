import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../styles/AnalyticsPage.css';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [displacement, setDisplacement] = useState(null);
  const [waitTime, setWaitTime] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api';
  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA500', '#4CAF50', '#9B59B6'];

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [analyticsRes, displacementRes, waitTimeRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/summary`),
        axios.get(`${API_URL}/analytics/displacement`),
        axios.get(`${API_URL}/analytics/wait-time`)
      ]);

      setAnalytics(analyticsRes.data.data);
      setDisplacement(displacementRes.data.data);
      setWaitTime(waitTimeRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  const priorityDistributionData = analytics?.priorityStats?.distribution
    ? [
        { name: 'Low (0-20)', value: analytics.priorityStats.distribution.low },
        { name: 'Low-Medium (20-40)', value: analytics.priorityStats.distribution['low-medium'] },
        { name: 'Medium (40-60)', value: analytics.priorityStats.distribution.medium },
        { name: 'Medium-High (60-80)', value: analytics.priorityStats.distribution['medium-high'] },
        { name: 'High (80-100)', value: analytics.priorityStats.distribution.high }
      ]
    : [];

  const displacementDistribution = displacement?.displacementDistribution
    ? Object.entries(displacement.displacementDistribution).map(([count, value]) => ({
        name: `${count} Displacements`,
        value
      }))
    : [];

  const formatTime = (ms) => {
    if (ms === 0) return '0 min';
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>📊 Analytics Dashboard</h1>
        <p>Comprehensive ticket queue analytics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Average Priority</h3>
          <div className="metric-value">{analytics?.averagePriority?.toFixed(2)}</div>
        </div>
        <div className="metric-card">
          <h3>Total Tickets</h3>
          <div className="metric-value">{analytics?.totalTickets}</div>
        </div>
        <div className="metric-card">
          <h3>Avg Wait Time</h3>
          <div className="metric-value">{formatTime(analytics?.averageWaitTimeMs)}</div>
        </div>
        <div className="metric-card">
          <h3>Max Priority</h3>
          <div className="metric-value">{analytics?.priorityStats?.highest?.toFixed(2)}</div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="chart-container">
        <h2>Priority Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={priorityDistributionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {priorityDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Type Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>By Ticket Type</h3>
          {analytics?.typeStats && Object.entries(analytics.typeStats).map(([type, stats]) => (
            <div key={type} className="stat-item">
              <span className="stat-label">{type.toUpperCase()}</span>
              <span className="stat-value">{stats.count} tickets</span>
              <span className="stat-secondary">Avg Priority: {stats.averagePriority.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="stat-card">
          <h3>By Status</h3>
          {analytics?.statusStats && Object.entries(analytics.statusStats).map(([status, stats]) => (
            <div key={status} className="stat-item">
              <span className="stat-label">{status.toUpperCase()}</span>
              <span className="stat-value">{stats.count} tickets</span>
              <span className="stat-secondary">Avg Wait: {formatTime(stats.averageWaitTime)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Displacement Analysis */}
      <div className="chart-container">
        <h2>Displacement Analysis</h2>
        <div className="displacement-stats">
          <div className="displacement-item">
            <strong>No Displacement:</strong>
            <span>{displacement?.ticketsWithoutDisplacement} tickets</span>
          </div>
          <div className="displacement-item">
            <strong>With Displacement:</strong>
            <span>{displacement?.ticketsWithDisplacement} tickets</span>
          </div>
          <div className="displacement-item">
            <strong>Max Limit Reached:</strong>
            <span>{displacement?.maxDisplacementReached} tickets</span>
          </div>
          <div className="displacement-item">
            <strong>Avg Displacement:</strong>
            <span>{displacement?.averageDisplacement?.toFixed(2)}</span>
          </div>
        </div>
        {displacementDistribution.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displacementDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4ECDC4" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Wait Time Analysis */}
      <div className="chart-container">
        <h2>Wait Time Analysis</h2>
        <div className="wait-time-stats">
          <div className="wait-item">
            <strong>Average Wait Time:</strong>
            <span className="large">{formatTime(waitTime?.averageMs)}</span>
          </div>
          <div className="wait-item">
            <strong>Minimum Wait Time:</strong>
            <span className="large">{formatTime(waitTime?.minimumMs)}</span>
          </div>
          <div className="wait-item">
            <strong>Maximum Wait Time:</strong>
            <span className="large">{formatTime(waitTime?.maximumMs)}</span>
          </div>
          <div className="wait-item">
            <strong>Median Wait Time:</strong>
            <span className="large">{formatTime(waitTime?.medianMs)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
