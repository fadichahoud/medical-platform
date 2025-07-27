const Appointment = require('../models/Appointment');
const SyncQueue = require('../offline-sync/syncQueue');

exports.createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    
    // Si es una sincronización offline
    if (req.isOnline === false) {
      appointment.syncStatus = 'synced';
      await appointment.save();
    }
    
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creando cita:', error);
    res.status(500).json({ error: 'Error al crear cita' });
  }
};

exports.getPendingAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ syncStatus: 'pending' });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo citas pendientes' });
  }
};