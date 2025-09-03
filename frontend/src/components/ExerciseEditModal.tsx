import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllExercises, changeExerciseInPlan, Exercise, WorkoutDayExercise } from '../api/fitnessApi';

interface ExerciseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayExerciseId: number;
  onPlanChange: () => void;
  // Pass down the current day's exercises to filter out duplicates
  currentExercises: WorkoutDayExercise[];
}

const ExerciseEditModal: React.FC<ExerciseEditModalProps> = ({ isOpen, onClose, dayExerciseId, onPlanChange, currentExercises }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // --- NEW: INTELLIGENT FILTERING LOGIC ---
  // 1. Get the muscle groups for the current day's exercises
  const relevantMuscleGroupIds = useMemo(() => {
    const ids = new Set(currentExercises.map(ex => ex.exercise.muscle_group_id));
    return Array.from(ids);
  }, [currentExercises]);

  // 2. Fetch only the exercises that match those muscle groups
  const { data: exercises, isLoading, isError } = useQuery<Exercise[]>({
    queryKey: ['allExercises', relevantMuscleGroupIds],
    queryFn: () => getAllExercises(relevantMuscleGroupIds),
    enabled: isOpen, // Only fetch when the modal is open
  });

  const changeExerciseMutation = useMutation({
    mutationFn: changeExerciseInPlan,
    onSuccess: () => {
      // --- THE FIX IS HERE ---
      // Instead of onPlanChange(), we invalidate the query.
      // This is a more robust pattern with TanStack Query.
      queryClient.invalidateQueries({ queryKey: ['workoutPlan'] });
      onClose();
    },
    onError: (error) => {
      // This will now only be called on a genuine error
      console.error("Failed to change exercise:", error);
      alert("An error occurred while swapping the exercise.");
    }
  });

  // --- NEW: FILTERING LOGIC ---
  const filteredExercises = useMemo(() => {
    // Get IDs of exercises already in the plan for this day
    const currentExerciseIds = new Set(currentExercises.map(ex => ex.exercise.id));
    
    return exercises?.filter(ex => 
      // Condition 1: Exercise is not already in the day's plan
      !currentExerciseIds.has(ex.id) &&
      // Condition 2: Exercise name matches search term
      ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [exercises, searchTerm, currentExercises]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 w-full max-w-md p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">Change Exercise</h2>
        <input
          type="text"
          placeholder="Search relevant exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white mb-4"
        />
        <div className="max-h-64 overflow-y-auto space-y-2">
          {isLoading && <p className="text-gray-400">Loading exercises...</p>}
          {isError && <p className="text-red-500">Could not load exercises.</p>}
          {!isLoading && !isError && filteredExercises.length === 0 && (
            <p className="text-gray-400">No other relevant exercises found.</p>
          )}
          {filteredExercises.map(exercise => (
            <button
              key={exercise.id}
              onClick={() => changeExerciseMutation.mutate({ dayExerciseId, newExerciseId: exercise.id })}
              disabled={changeExerciseMutation.isPending}
              className="w-full text-left p-2 rounded-md hover:bg-gray-700 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exercise.name}
            </button>
          ))}
        </div>
        <button 
            onClick={onClose} 
            className="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
            disabled={changeExerciseMutation.isPending}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ExerciseEditModal;
