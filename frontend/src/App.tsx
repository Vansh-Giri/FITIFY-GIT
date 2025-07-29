import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserDetailsForm from './components/UserDetailsForm';
import WorkoutTypeForm from './components/WorkoutTypeForm';
import WorkoutFrequencyForm from './components/WorkoutFrequencyForm';
import TrackingScreen from './components/TrackingScreen';

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [step, setStep] = useState<'details' | 'type' | 'frequency' | 'tracking'>('details');
  const [userId, setUserId] = useState<number | null>(null);

  const renderStep = () => {
    switch (step) {
      case 'details':
        return <UserDetailsForm setStep={setStep} setUserId={setUserId} />;
      case 'type':
        return <WorkoutTypeForm setStep={setStep} />;
      case 'frequency':
        return <WorkoutFrequencyForm setStep={setStep} userId={userId!} />;
      case 'tracking':
        return <TrackingScreen userId={userId!} />;
      default:
        return <UserDetailsForm setStep={setStep} setUserId={setUserId} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {renderStep()}
      </div>
    </QueryClientProvider>
  );
};

export default App; 