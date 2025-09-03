import React, { useState, useEffect } from 'react';
import SetLogger from './SetLogger';
import ExerciseEditModal from './ExerciseEditModal';
import { WorkoutDayExercise, LoggedSet } from '../api/fitnessApi';
import { isToday } from 'date-fns';

interface ExerciseItemProps {
  userId: number;
  dayExercise: WorkoutDayExercise;
  loggedSetsForExercise: LoggedSet[];
  onLogChange: () => void;
  onPlanChange: () => void;
  selectedDate: Date;
  currentExercises: WorkoutDayExercise[];
}

export interface SetState {
  setNumber: number;
  weight: string;
  reps: string;
  isCompleted: boolean;
  logId: number | null;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ userId, dayExercise, loggedSetsForExercise, onLogChange, onPlanChange, selectedDate, currentExercises }) => {
  const [isLoggingOpen, setIsLoggingOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sets, setSets] = useState<SetState[]>([]);
  const canLogToday = isToday(selectedDate);

  useEffect(() => {
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

  const handleLogClick = () => {
    if (!canLogToday && !isLoggingOpen) {
      alert("You can only view logs for past or future dates. Logging is restricted to the current day.");
      return;
    }
    setIsLoggingOpen(!isLoggingOpen);
  };

  return (
    <>
      <div className="bg-gray-900 p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            {/* ENHANCEMENT: Clicking the name now opens the edit modal */}
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="text-lg font-semibold text-white text-left hover:text-indigo-400 transition-colors"
            >
              {dayExercise.exercise.name}
            </button>
            <p className="text-sm text-gray-400">{dayExercise.sets} sets of {dayExercise.reps} reps</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Swap
            </button>
            <button
              onClick={handleLogClick}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              {isLoggingOpen ? 'Close' : 'Log'}
            </button>
          </div>
        </div>

        {isLoggingOpen && (
          <div className="mt-4">
            <SetLogger 
              userId={userId}
              exerciseId={dayExercise.exercise.id}
              sets={sets} 
              setSets={setSets}
              onLogChange={onLogChange}
              canLog={canLogToday}
            />
          </div>
        )}
      </div>

      <ExerciseEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        dayExerciseId={dayExercise.id}
        onPlanChange={onPlanChange}
        currentExercises={currentExercises}
      />
    </>
  );
};

export default ExerciseItem;
