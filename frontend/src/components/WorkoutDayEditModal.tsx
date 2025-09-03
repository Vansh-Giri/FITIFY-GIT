import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getWorkoutTemplates, swapDayWithTemplate, WorkoutTemplate } from '../api/fitnessApi';

interface WorkoutDayEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  dayId: number;
  onPlanChange: () => void;
}

const WorkoutDayEditModal: React.FC<WorkoutDayEditModalProps> = ({ isOpen, onClose, userId, dayId, onPlanChange }) => {

  const { data: templates, isLoading, isError } = useQuery<WorkoutTemplate[]>({
    queryKey: ['workoutTemplates'],
    queryFn: getWorkoutTemplates,
  });

  const swapTemplateMutation = useMutation({
    mutationFn: swapDayWithTemplate,
    onSuccess: () => {
      onPlanChange();
      onClose();
    },
    onError: (error) => {
      console.error("Failed to swap template:", error);
      alert("Failed to swap template.");
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 w-full max-w-md p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">Change Workout Template</h2>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {isLoading && <p className="text-gray-400">Loading templates...</p>}
          {isError && <p className="text-red-500">Could not load templates.</p>}
          {!isLoading && !isError && templates?.length === 0 && (
            <p className="text-gray-400">No workout templates found.</p>
          )}
          {templates?.map(template => (
            <button
              key={template.id}
              onClick={() => swapTemplateMutation.mutate({ dayId, templateId: template.id, userId })}
              disabled={swapTemplateMutation.isPending}
              className="w-full text-left p-3 rounded-md hover:bg-gray-700 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {template.name}
            </button>
          ))}
        </div>
        <button 
          onClick={onClose} 
          className="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
          disabled={swapTemplateMutation.isPending}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WorkoutDayEditModal;
