import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createWorkoutPlan, WorkoutPlanData } from '../api/fitnessApi';

interface WorkoutFrequencyFormProps {
  setStep: (step: 'details' | 'type' | 'frequency' | 'tracking') => void;
  userId: number;
}

const WorkoutFrequencyForm: React.FC<WorkoutFrequencyFormProps> = ({ setStep, userId }) => {
  const [formData, setFormData] = useState<WorkoutPlanData>({
    workout_type: 'gym',
    sessions_per_week: 3,
    hours_per_session: 1,
  });

  const createWorkoutPlanMutation = useMutation({
    mutationFn: (data: WorkoutPlanData) => createWorkoutPlan(userId, data),
    onSuccess: () => {
      setStep('tracking');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createWorkoutPlanMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof WorkoutPlanData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set Your Workout Schedule
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            How often do you want to work out?
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sessions per Week: {formData.sessions_per_week}
              </label>
              <input
                type="range"
                min="1"
                max="7"
                value={formData.sessions_per_week}
                onChange={(e) => handleInputChange('sessions_per_week', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>7</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hours per Session: {formData.hours_per_session}
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={formData.hours_per_session}
                onChange={(e) => handleInputChange('hours_per_session', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.5h</span>
                <span>3h</span>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={createWorkoutPlanMutation.isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {createWorkoutPlanMutation.isLoading ? 'Creating Plan...' : 'Create My Plan'}
            </button>
          </div>

          {createWorkoutPlanMutation.isError && (
            <div className="text-red-600 text-sm text-center">
              Error creating workout plan. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default WorkoutFrequencyForm; 