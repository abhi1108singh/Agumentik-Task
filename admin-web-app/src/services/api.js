import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

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

export const startProcessing = async (ticketId) => {
  try {
    const response = await apiClient.post(`/tickets/${ticketId}/process`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resolveTicket = async (ticketId) => {
  try {
    const response = await apiClient.post(`/tickets/${ticketId}/resolve`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
