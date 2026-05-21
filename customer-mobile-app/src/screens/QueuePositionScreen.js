import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { getTicket } from '../services/api';

const QueuePositionScreen = ({ route }) => {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTicket();
    const interval = setInterval(fetchTicket, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTicket = async () => {
    try {
      const result = await getTicket(ticketId);
      if (result.success) {
        setTicket(result.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch ticket details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTicket();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Ticket not found</Text>
      </View>
    );
  }

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

  const getTypeEmoji = (type) => {
    return type === 'billing' ? '💳' : '🔧';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ticket Details</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Ticket ID:</Text>
          <Text style={styles.value}>{ticket.id}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>
            {getTypeEmoji(ticket.type)} {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Queue Position:</Text>
          <Text style={[styles.value, styles.positionValue]}>#{ticket.queuePosition}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Current Priority:</Text>
          <Text style={styles.value}>{ticket.currentPriority.toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(ticket.status) },
            ]}
          >
            <Text style={styles.statusText}>{ticket.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Displacement Count:</Text>
          <Text style={styles.value}>{ticket.displacementCount}/3</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(ticket.displacementCount / 3) * 100}%` },
            ]}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Created At:</Text>
          <Text style={styles.value}>
            {new Date(ticket.createdAt).toLocaleTimeString()}
          </Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Your priority increases automatically as you wait. Pull down to refresh.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  positionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 3,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 20,
  },
});

export default QueuePositionScreen;
