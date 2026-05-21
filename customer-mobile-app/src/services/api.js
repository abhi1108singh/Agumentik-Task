import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const createTicket = async (type) => {
  try {
    const response = await apiClient.post('/tickets', { type });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTicket = async (ticketId) => {
  try {
    const response = await apiClient.get(`/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getQueue = async () => {
  try {
    const response = await apiClient.get('/tickets');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getQueueStats = async () => {
  try {
    const response = await apiClient.get('/stats');
    return response.data;
  } catch (error) {
    throw error;
  }
};
