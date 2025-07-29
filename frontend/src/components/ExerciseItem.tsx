import React, { useState, useEffect } from 'react';
import SetLogger from './SetLogger';
import { WorkoutDayExercise, LoggedSet } from '../api/fitnessApi';

interface ExerciseItemProps {
  userId: number;
  // THE FIX IS HERE: Prop is now a structured object
  dayExercise: WorkoutDayExercise;
  loggedSetsForExercise: LoggedSet[];
  onLogChange: () => void;
}

export interface SetState {
  setNumber: number;
  weight: string;
  reps: string;
  isCompleted: boolean;
  logId: number | null; // To track the ID of the logged set for deletion
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ userId, dayExercise, loggedSetsForExercise, onLogChange }) => {
  const [isLoggingOpen, setIsLoggingOpen] = useState(false);
  const [sets, setSets] = useState<SetState[]>([]);

  useEffect(() => {
    // This effect synchronizes the component's state with the fetched data.
    const initialSets = Array.from({ length: dayExercise.sets }, (_, i) => {
      const setNumber = i + 1;
      const loggedSet = loggedSetsForExercise.find(log => log.sets === setNumber);
      return {
        setNumber: setNumber,
        weight: loggedSet ? String(loggedSet.weight_kg) : '',
        reps: loggedSet ? String(loggedSet.reps) : '',
        isCompleted: !!loggedSet,
        logId: loggedSet ? loggedSet.id : null,
      };
    });
    setSets(initialSets);
  }, [dayExercise, loggedSetsForExercise]);

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <button className="text-lg font-semibold text-white hover:text-indigo-400 transition-colors">
            {/* THE FIX IS HERE: We access properties directly */}
            {dayExercise.exercise.name}
          </button>
          <p className="text-sm text-gray-400">{dayExercise.sets} sets of {dayExercise.reps} reps</p>
        </div>
        <button
          onClick={() => setIsLoggingOpen(!isLoggingOpen)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {isLoggingOpen ? 'Close' : 'Log'}
        </button>
      </div>

      {isLoggingOpen && (
        <div className="mt-4">
          <SetLogger 
            userId={userId}
            exerciseId={dayExercise.exercise.id}
            sets={sets} 
            setSets={setSets}
            onLogChange={onLogChange}
          />
        </div>
      )}
    </div>
  );
};

export default ExerciseItem;
