import React, { useState } from 'react';
import { useIndexedDB } from '../../../utils/indexedDB';
import { createAppointment } from '../../../utils/api';
import SeniorModeButton from '../UI/SeniorModeButton';

const AppointmentForm = ({ user, seniorMode }) => {
  const [step, setStep] = useState(1);
  const [appointment, setAppointment] = useState({});
  const [patients, setPatients] = useState([]);
  const { add } = useIndexedDB('appointments');

  const handleSubmit = async () => {
    const newAppointment = {
      ...appointment,
      doctorId: user.id,
      status: 'pending',
      createdAt: new Date(),
      syncStatus: navigator.onLine ? 'synced' : 'pending'
    };
    
    try {
      if (navigator.onLine) {
        await createAppointment(newAppointment);
      } else {
        await add(newAppointment);
        await addPendingTransaction({
          type: 'appointment',
          data: newAppointment,
          priority: true,
          timestamp: Date.now()
        });
      }
      alert('Cita agendada exitosamente!');
      setStep(1);
      setAppointment({});
    } catch (error) {
      console.error('Error agendando cita:', error);
      alert('Error al agendar cita. Intente nuevamente.');
    }
  };

  return (
    <div className={`appointment-form ${seniorMode ? 'senior-mode' : ''}`}>
      {/* Implementación completa del formulario de 3 pasos */}
    </div>
  );
};

export default AppointmentForm;