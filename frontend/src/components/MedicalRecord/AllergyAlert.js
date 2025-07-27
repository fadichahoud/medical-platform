import React, { useEffect, useState } from 'react';
import { getMedicalRecord } from '../../utils/indexedDB';

const AllergyAlert = ({ patientId }) => {
  const [allergies, setAllergies] = useState([]);
  
  useEffect(() => {
    const fetchAllergies = async () => {
      try {
        const records = await getMedicalRecord(patientId);
        if (records.length > 0) {
          setAllergies(records[0].allergies || []);
        }
      } catch (error) {
        console.error('Error obteniendo alergias:', error);
      }
    };
    
    fetchAllergies();
  }, [patientId]);

  if (allergies.length === 0) return null;

  return (
    <div className="allergy-alert">
      <h3>⚠️ Alergias del Paciente</h3>
      <ul>
        {allergies.map((allergy, index) => (
          <li key={index}>{allergy}</li>
        ))}
      </ul>
    </div>
  );
};

export default AllergyAlert;