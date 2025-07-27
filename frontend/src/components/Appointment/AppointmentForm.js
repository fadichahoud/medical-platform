import React, { useState, useEffect } from 'react';
import { useIndexedDB } from '../../utils/indexedDB';
import { addAppointment, addPendingTransaction } from '../../utils/indexedDB';
import { createAppointment } from '../../utils/api';
import PatientSearch from './PatientSearch';
import DateTimePicker from './DateTimePicker';
import SeniorModeButton from '../UI/SeniorModeButton';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const AppointmentForm = ({ user, seniorMode }) => {
  const [step, setStep] = useState(1);
  const [appointment, setAppointment] = useState({});
  const [isOnline, setIsOnline] = useState(true);
  const { get } = useIndexedDB('users');
  const onlineStatus = useOnlineStatus();

  useEffect(() => {
    setIsOnline(onlineStatus);
  }, [onlineStatus]);

  const handleSubmit = async () => {
    const newAppointment = { 
      ...appointment, 
      doctorId: user.id,
      status: 'pending',
      createdAt: new Date(),
      syncStatus: isOnline ? 'synced' : 'pending'
    };
    
    try {
      if (isOnline) {
        await createAppointment(newAppointment);
      } else {
        // Guardar localmente
        await addAppointment(newAppointment);
        
        // Agregar a cola de sincronización
        await addPendingTransaction({
          type: 'appointment',
          data: newAppointment,
          priority: true, // Prioridad médica
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
      <h2>Agendar Nueva Cita</h2>
      
      {step === 1 && (
        <PatientSearch 
          seniorMode={seniorMode} 
          onSelect={patient => {
            setAppointment({...appointment, patientId: patient.id});
            setStep(2);
          }} 
        />
      )}
      
      {step === 2 && (
        <DateTimePicker
          seniorMode={seniorMode}
          doctorId={user.id}
          onSelect={datetime => {
            setAppointment({...appointment, date: datetime});
            setStep(3);
          }}
        />
      )}
      
      {step === 3 && (
        <div className="confirmation-step">
          <h3>Confirmar Cita</h3>
          <p>Paciente: {appointment.patientId ? 'Nombre del paciente' : 'No seleccionado'}</p>
          <p>Fecha: {appointment.date ? new Date(appointment.date).toLocaleString() : 'No seleccionada'}</p>
          
          <div className="actions">
            <SeniorModeButton 
              onClick={() => setStep(2)}
              size={seniorMode ? "lg" : "md"}
              aria-label="Volver"
            >
              Volver
            </SeniorModeButton>
            
            <SeniorModeButton 
              onClick={handleSubmit}
              size={seniorMode ? "lg" : "md"}
              primary
              aria-label="Confirmar cita"
            >
              Confirmar Cita
            </SeniorModeButton>
          </div>
        </div>
      )}
      
      {!isOnline && (
        <div className="offline-badge">
          Modo Offline - Los datos se sincronizarán cuando recupere la conexión
        </div>
      )}
    </div>
  );
};

export default AppointmentForm;