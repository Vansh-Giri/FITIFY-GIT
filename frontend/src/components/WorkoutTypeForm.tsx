import React from 'react';

interface WorkoutTypeFormProps {
  setStep: (step: 'details' | 'type' | 'frequency' | 'tracking') => void;
}

const WorkoutTypeForm: React.FC<WorkoutTypeFormProps> = ({ setStep }) => {
  const handleGymClick = () => {
    setStep('frequency');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Choose Your Workout Type
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            What type of workout do you prefer?
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGymClick}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </span>
            Gym
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTypeForm; 