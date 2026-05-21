import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { createTicket } from '../services/api';

const CreateTicketScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState(null);

  const handleCreateTicket = async (type) => {
    setLoading(true);
    try {
      const result = await createTicket(type);
      if (result.success) {
        setTicketData(result.data);
        Alert.alert('Success', `Ticket ${result.data.id} created!`);
        // Navigate to ticket details after delay
        setTimeout(() => {
          navigation.navigate('QueuePosition', { ticketId: result.data.id });
        }, 1000);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create ticket');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Support Ticket</Text>

      {ticketData && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>Ticket Created!</Text>
          <Text style={styles.ticketId}>ID: {ticketData.id}</Text>
          <Text style={styles.position}>Queue Position: {ticketData.queuePosition}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, styles.billingButton]}
        onPress={() => handleCreateTicket('billing')}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>📱 Create Billing Ticket</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.techButton]}
        onPress={() => handleCreateTicket('technical')}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>🔧 Create Technical Ticket</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billingButton: {
    backgroundColor: '#FF6B6B',
  },
  techButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  successBox: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  successText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  ticketId: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  position: {
    fontSize: 14,
    color: '#666',
  },
});

export default CreateTicketScreen;
