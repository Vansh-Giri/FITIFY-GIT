import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWorkoutPlan, getLogsForDate, LoggedSet, WorkoutPlanResponse, WorkoutDayExercise } from '../api/fitnessApi';
import ExerciseItem from './ExerciseItem';
import DateCarousel from './DateCarousel';
import { format, getDay } from 'date-fns';

interface TrackingScreenProps {
  userId: number;
}

// Map Date object's getDay() index (Sun=0) to our string names
const dayMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TrackingScreen: React.FC<TrackingScreenProps> = ({ userId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateString = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);
  const dayOfWeek = dayMap[getDay(selectedDate)];

  // Query 1: Fetch the user's base workout plan
  const { data: planData, isLoading: isPlanLoading } = useQuery<WorkoutPlanResponse>({
    queryKey: ['workoutPlan', userId],
    queryFn: () => getWorkoutPlan(userId),
    enabled: !!userId,
  });

  // Query 2: Fetch the logs for the selected date
  const { data: loggedSets, isLoading: areLogsLoading, refetch: refetchLogs } = useQuery<LoggedSet[]>({
    queryKey: ['logs', userId, selectedDateString],
    queryFn: () => getLogsForDate(userId, selectedDateString),
    enabled: !!userId,
  });

  if (isPlanLoading) {
    return <div className="text-center text-white mt-10">Loading Your Plan...</div>;
  }

  const schedule = planData?.weekly_schedule || {};
  // THE FIX IS HERE: We access the .exercises array from the WorkoutDay object.
  const exercisesForDay: WorkoutDayExercise[] = schedule[dayOfWeek]?.exercises || [];

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 text-white">
      <DateCarousel selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6">{format(selectedDate, "eeee, MMMM do")}</h2>
        {areLogsLoading ? (
          <p>Loading logs...</p>
        ) : (
          exercisesForDay.length > 0 ? (
            <div className="space-y-4">
              {exercisesForDay.map((dayExercise) => (
                <ExerciseItem
                  key={dayExercise.id}
                  userId={userId}
                  // THE FIX IS HERE: We now pass the 'dayExercise' object, which is the correct prop.
                  dayExercise={dayExercise}
                  loggedSetsForExercise={loggedSets?.filter(log => log.exercise_id === dayExercise.exercise.id) || []}
                  onLogChange={refetchLogs}
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
  );
};

export default TrackingScreen;
