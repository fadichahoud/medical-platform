import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const createAppointment = async (appointment) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/appointments`, appointment);
    return response.data;
  } catch (error) {
    console.error('Error creando cita:', error);
    throw error;
  }
};

export const getMedicalRecords = async (patientId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/medical/records`, {
      params: { patientId }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo historias clínicas:', error);
    throw error;
  }
};

export const requestSMSToken = async (phone) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/request-token`, { phone });
    return response.data;
  } catch (error) {
    console.error('Error solicitando token SMS:', error);
    throw error;
  }
};