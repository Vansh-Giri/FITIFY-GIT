import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWorkoutPlan, getLogsForDate, WorkoutPlanResponse, LoggedSet, WorkoutDayExercise } from '../api/fitnessApi';
import ExerciseItem from './ExerciseItem';
import DateCarousel from './DateCarousel';
import WorkoutDayEditModal from './WorkoutDayEditModal';
import { format, getDay } from 'date-fns';

interface TrackingScreenProps {
  userId: number;
}

const dayMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TrackingScreen: React.FC<TrackingScreenProps> = ({ userId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDayEditModalOpen, setIsDayEditModalOpen] = useState(false);

  const selectedDateString = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);
  const dayOfWeek = dayMap[getDay(selectedDate)];

  const { data: planData, isLoading: isPlanLoading, refetch: refetchPlan } = useQuery<WorkoutPlanResponse>({
    queryKey: ['workoutPlan', userId],
    queryFn: () => getWorkoutPlan(userId),
    enabled: !!userId,
  });

  const { data: loggedSets, isLoading: areLogsLoading, refetch: refetchLogs } = useQuery<LoggedSet[]>({
    queryKey: ['logs', userId, selectedDateString],
    queryFn: () => getLogsForDate(userId, selectedDateString),
    enabled: !!userId,
  });

  const onLogChange = () => {
    refetchLogs();
  };

  const onPlanChange = () => {
    refetchPlan();
  }

  if (isPlanLoading) return <div className="text-center text-white mt-10">Loading Your Plan...</div>;

  const schedule = planData?.weekly_schedule || {};
  const currentDayData = schedule[dayOfWeek];
  const exercisesForDay: WorkoutDayExercise[] = currentDayData?.exercises || [];

  return (
    <>
      <div className="max-w-4xl mx-auto mt-8 p-4 text-white">
        <DateCarousel selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{format(selectedDate, "eeee, MMMM do")}</h2>
            {exercisesForDay.length > 0 && (
              <button 
                onClick={() => setIsDayEditModalOpen(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Change Workout
              </button>
            )}
          </div>

          {areLogsLoading ? <p>Loading logs...</p> : (
            exercisesForDay.length > 0 ? (
              <div className="space-y-4">
                {exercisesForDay.map((dayExercise) => (
                  <ExerciseItem
                    key={dayExercise.id}
                    userId={userId}
                    dayExercise={dayExercise}
                    loggedSetsForExercise={loggedSets?.filter(log => log.exercise_id === dayExercise.exercise.id) || []}
                    onLogChange={onLogChange}
                    onPlanChange={onPlanChange}
                    selectedDate={selectedDate}
                    currentExercises={exercisesForDay}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">😴</p>
                <h3 className="text-xl font-semibold">Rest Day</h3>
                <p className="text-gray-400">Take it easy and recover!</p>
              </div>
            )
          )}
        </div>
      </div>
      
      {currentDayData && (
        <WorkoutDayEditModal
          isOpen={isDayEditModalOpen}
          onClose={() => setIsDayEditModalOpen(false)}
          userId={userId}
          dayId={currentDayData.id}
          onPlanChange={onPlanChange}
        />
      )}
    </>
  );
};

export default TrackingScreen;
