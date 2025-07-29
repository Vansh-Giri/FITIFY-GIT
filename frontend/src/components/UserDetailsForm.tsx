import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createUser, UserData } from '../api/fitnessApi';

interface UserDetailsFormProps {
  setStep: (step: 'details' | 'type' | 'frequency' | 'tracking') => void;
  setUserId: (id: number) => void;
}

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({ setStep, setUserId }) => {
  const [formData, setFormData] = useState<UserData>({
    username: '',
    age: 25,
    height_cm: 170,
    weight_kg: 70,
    gender: 'Male',
    body_type: 4,
    goal: 4,
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (user) => {
      setUserId(user.id);
      setStep('type');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof UserData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Fitify
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let's get to know you better
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="age" className="sr-only">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <label htmlFor="height" className="sr-only">Height (cm)</label>
              <input
                id="height"
                name="height_cm"
                type="number"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Height (cm)"
                value={formData.height_cm}
                onChange={(e) => handleInputChange('height_cm', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <label htmlFor="weight" className="sr-only">Weight (kg)</label>
              <input
                id="weight"
                name="weight_kg"
                type="number"
                step="0.1"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Weight (kg)"
                value={formData.weight_kg}
                onChange={(e) => handleInputChange('weight_kg', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <div className="flex space-x-4">
                {['Male', 'Female', 'Other'].map((gender) => (
                  <label key={gender} className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={formData.gender === gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body Type: {formData.body_type}
              </label>
              <input
                type="range"
                min="1"
                max="8"
                value={formData.body_type}
                onChange={(e) => handleInputChange('body_type', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal: {formData.goal}
              </label>
              <input
                type="range"
                min="1"
                max="8"
                value={formData.goal}
                onChange={(e) => handleInputChange('goal', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={createUserMutation.isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {createUserMutation.isLoading ? 'Creating...' : 'Continue'}
            </button>
          </div>

          {createUserMutation.isError && (
            <div className="text-red-600 text-sm text-center">
              Error creating user. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserDetailsForm; 