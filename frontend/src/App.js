import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/Auth/AuthPage';
import AppointmentDashboard from './components/Appointment/AppointmentDashboard';
import MedicalRecords from './components/MedicalRecord/MedicalRecords';
import SyncStatus from './components/UI/SyncStatus';
import SeniorModeToggle from './components/UI/SeniorModeToggle';
import VoiceNavigation from './components/UI/VoiceNavigation';
import { checkAuth } from './utils/auth';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [seniorMode, setSeniorMode] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const authData = await checkAuth();
      if (authData) {
        setIsAuthenticated(true);
        setUser(authData.user);
      }
    };
    verifyAuth();
    
    // Detectar conexión a internet
    const handleOnline = () => console.log('Online');
    const handleOffline = () => console.log('Offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`App ${seniorMode ? 'senior-mode' : ''}`}>
      <Router>
        <SeniorModeToggle 
          seniorMode={seniorMode} 
          toggleSeniorMode={() => setSeniorMode(!seniorMode)} 
        />
        <SyncStatus />
        <VoiceNavigation enabled={seniorMode} />
        
        <Routes>
          <Route path="/" 
            element={isAuthenticated ? 
              <Navigate to="/appointments" /> : 
              <AuthPage setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
            } 
          />
          <Route path="/appointments" 
            element={isAuthenticated ? 
              <AppointmentDashboard user={user} seniorMode={seniorMode} /> : 
              <Navigate to="/" />
            } 
          />
          <Route path="/medical-records" 
            element={isAuthenticated ? 
              <MedicalRecords user={user} seniorMode={seniorMode} /> : 
              <Navigate to="/" />
            } 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;