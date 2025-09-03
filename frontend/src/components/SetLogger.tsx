import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { logWorkoutSet, deleteLoggedSet } from '../api/fitnessApi';
import { SetState } from './ExerciseItem';

interface SetLoggerProps {
  userId: number;
  exerciseId: number;
  sets: SetState[];
  setSets: React.Dispatch<React.SetStateAction<SetState[]>>;
  onLogChange: () => void;
  canLog: boolean;
}

const SetLogger: React.FC<SetLoggerProps> = ({ userId, exerciseId, sets, setSets, onLogChange, canLog }) => {
  
  const logSetMutation = useMutation({
    mutationFn: logWorkoutSet,
    onSuccess: () => onLogChange(),
    onError: (error) => {
      console.error("Failed to log set:", error);
      alert("Failed to log set. Please try again.");
    }
  });

  const deleteSetMutation = useMutation({
    mutationFn: deleteLoggedSet,
    onSuccess: () => onLogChange(),
    onError: (error) => {
      console.error("Failed to delete set:", error);
      alert("Failed to delete set. Please try again.");
    }
  });

  const handleInputChange = (index: number, field: 'weight' | 'reps', value: string) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const handleCheckboxChange = (index: number) => {
    // --- THIS IS THE SECONDARY FIX ---
    // A redundant check to prevent logging if the UI is somehow opened on a non-current day.
    if (!canLog) {
        alert("You can only log exercises for the current date.");
        return;
    }

    const set = sets[index];
    if (set.isCompleted && set.logId) {
      deleteSetMutation.mutate({ logId: set.logId, userId });
    } else {
      const logData = {
        user_id: userId,
        exercise_id: exerciseId,
        date: new Date().toISOString().split('T')[0],
        sets: set.setNumber,
        reps: parseInt(set.reps),
        weight_kg: parseFloat(set.weight),
      };
      if (isNaN(logData.reps) || isNaN(logData.weight_kg)) {
        alert("Please enter valid numbers for weight and reps.");
        return;
      }
      logSetMutation.mutate(logData);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-gray-800 rounded-md">
      <div className="grid grid-cols-5 gap-4 text-sm font-semibold text-gray-400 px-2">
        <span>SET</span>
        <span className="col-span-2">WEIGHT (KG)</span>
        <span>REPS</span>
        <span className="text-center">LOG</span>
      </div>
      {sets.map((set, index) => (
        <div key={set.setNumber} className="grid grid-cols-5 gap-4 items-center">
          <span className="font-bold text-white px-2">Set {set.setNumber}</span>
          <input
            type="number"
            placeholder="0"
            value={set.weight}
            onChange={(e) => handleInputChange(index, 'weight', e.target.value)}
            disabled={set.isCompleted || !canLog}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white disabled:opacity-50 col-span-2"
          />
          <input
            type="number"
            placeholder="0"
            value={set.reps}
            onChange={(e) => handleInputChange(index, 'reps', e.target.value)}
            disabled={set.isCompleted || !canLog}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white disabled:opacity-50"
          />
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={set.isCompleted}
              onChange={() => handleCheckboxChange(index)}
              disabled={logSetMutation.isPending || deleteSetMutation.isPending}
              className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SetLogger;
