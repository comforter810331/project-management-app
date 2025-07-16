import React, { useState, useEffect } from 'react';
import { AuthProvider } from './auth/auth';
import App from './App';
import InitialSetupScreen from './components/InitialSetupScreen';

const AppWrapper: React.FC = () => {
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const clientId = localStorage.getItem('google_client_id');
    if (clientId) {
      setIsSetupComplete(true);
    } else {
      setIsSetupComplete(false);
    }
  }, []);

  const handleSetupComplete = () => {
    setIsSetupComplete(true);
  };

  // Render a loading state until the check is complete
  if (isSetupComplete === null) {
    return (
       <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl font-medium text-slate-600">正在檢查設定...</div>
       </div>
    );
  }

  if (!isSetupComplete) {
    return <InitialSetupScreen onSetupComplete={handleSetupComplete} />;
  }

  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default AppWrapper;
