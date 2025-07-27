const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const { processMedicalRecord } = require('./medicalSync');
const { processAppointment } = require('./appointmentSync');

class SyncQueue {
  constructor() {
    this.medicalQueue = [];
    this.adminQueue = [];
    this.isProcessing = false;
    this.maxRetries = 3;
  }

  addTransaction(transaction, isMedical = false) {
    if (isMedical) {
      this.medicalQueue.unshift(transaction);
    } else {
      this.adminQueue.push(transaction);
    }
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      // Procesar primero transacciones médicas
      while (this.medicalQueue.length > 0) {
        const transaction = this.medicalQueue.shift();
        await this.processTransaction(transaction);
      }

      // Procesar transacciones administrativas
      while (this.adminQueue.length > 0) {
        const transaction = this.adminQueue.shift();
        await this.processTransaction(transaction);
      }
    } catch (error) {
      console.error('Error en cola de sincronización:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async processTransaction(transaction) {
    let retryCount = 0;
    const { type, data } = transaction;
    
    while (retryCount < this.maxRetries) {
      try {
        if (type === 'medicalRecord') {
          await processMedicalRecord(data);
        } else if (type === 'appointment') {
          await processAppointment(data);
        }
        return; // Éxito, salir del reintento
      } catch (error) {
        retryCount++;
        console.warn(`Reintento ${retryCount} para transacción ${type}`);
        await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
      }
    }
    
    console.error(`Fallo permanente en transacción ${type}`);
    // Aquí se podría agregar a una cola de fallos para revisión manual
  }
}

module.exports = new SyncQueue();