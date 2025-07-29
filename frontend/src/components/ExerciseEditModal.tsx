import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAllExercises, changeExerciseInPlan } from '../api/fitnessApi';

interface ExerciseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayExerciseId: number;
  refetchPlan: () => void;
}

const ExerciseEditModal: React.FC<ExerciseEditModalProps> = ({ isOpen, onClose, dayExerciseId, refetchPlan }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['allExercises'],
    queryFn: getAllExercises,
  });

  const changeExerciseMutation = useMutation({
    mutationFn: changeExerciseInPlan,
    onSuccess: () => {
      refetchPlan();
      onClose();
    },
    onError: (error) => {
      console.error("Failed to change exercise:", error);
      alert("Failed to change exercise.");
    }
  });

  const filteredExercises = exercises?.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 w-full max-w-md p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">Change Exercise</h2>
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white mb-4"
        />
        <div className="max-h-64 overflow-y-auto space-y-2">
          {isLoading ? (
            <p className="text-gray-400">Loading exercises...</p>
          ) : (
            filteredExercises.map(exercise => (
              <button
                key={exercise.id}
                onClick={() => changeExerciseMutation.mutate({ dayExerciseId, newExerciseId: exercise.id })}
                className="w-full text-left p-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                {exercise.name}
              </button>
            ))
          )}
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ExerciseEditModal;
