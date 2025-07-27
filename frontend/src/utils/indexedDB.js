import { openDB } from 'idb';

const DB_NAME = 'medical-offline';
const DB_VERSION = 3;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion, newVersion, transaction) {
    // Crear almacenes para citas
    if (!db.objectStoreNames.contains('appointments')) {
      const store = db.createObjectStore('appointments', { keyPath: 'id', autoIncrement: true });
      store.createIndex('byPatient', 'patientId');
      store.createIndex('byDoctor', 'doctorId');
      store.createIndex('byDate', 'date');
    }
    
    // Crear almacenes para historias clínicas
    if (!db.objectStoreNames.contains('medicalRecords')) {
      const store = db.createObjectStore('medicalRecords', { keyPath: 'id' });
      store.createIndex('byPatient', 'patientId');
      store.createIndex('byDoctor', 'doctorId');
      store.createIndex('byAllergies', 'allergies', { multiEntry: true });
    }
    
    // Almacén para transacciones pendientes
    if (!db.objectStoreNames.contains('pendingTransactions')) {
      const store = db.createObjectStore('pendingTransactions', { 
        keyPath: 'id',
        autoIncrement: true 
      });
      store.createIndex('byType', 'type');
      store.createIndex('byPriority', 'priority');
    }
  }
});

export const initDB = async () => {
  return dbPromise;
};

export const addAppointment = async (appointment) => {
  const db = await dbPromise;
  return db.add('appointments', appointment);
};

export const getAppointments = async () => {
  const db = await dbPromise;
  return db.getAll('appointments');
};

export const addMedicalRecord = async (record) => {
  const db = await dbPromise;
  return db.add('medicalRecords', record);
};

export const getMedicalRecord = async (patientId) => {
  const db = await dbPromise;
  return db.getAllFromIndex('medicalRecords', 'byPatient', patientId);
};

export const addPendingTransaction = async (transaction) => {
  const db = await dbPromise;
  return db.add('pendingTransactions', transaction);
};

export const getPendingTransactions = async () => {
  const db = await dbPromise;
  return db.getAll('pendingTransactions');
};

export const removePendingTransaction = async (id) => {
  const db = await dbPromise;
  return db.delete('pendingTransactions', id);
};