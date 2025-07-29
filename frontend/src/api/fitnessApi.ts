// Define the base URL for the API. It's read from an environment variable.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// --- Type Definitions for API Payloads and Responses ---

export interface UserData {
  username: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  gender: string;
  body_type: number;
  goal: number;
}

export interface User {
  id: number;
  username: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  gender: string;
  body_type: number;
  goal: number;
}

export interface WorkoutPlanData {
  workout_type?: string;
  sessions_per_week: number;
  hours_per_session: number;
}

export interface WorkoutPlan {
  id: number;
  workout_type: string;
  sessions_per_week: number;
  hours_per_session: number;
  user_id: number;
}

// --- UPDATED AND NEW INTERFACES ---

export interface Exercise {
    id: number;
    name: string;
    type: string;
}

export interface WorkoutDayExercise {
    id: number; // This is the WorkoutDayExercise ID
    exercise_id: number;
    sets: number;
    reps: string;
    exercise: Exercise; // Nested exercise details
}

export interface WorkoutDay {
    id: number;
    day_of_week: string;
    exercises: WorkoutDayExercise[];
}

export interface WorkoutPlanResponse {
  plan_details: WorkoutPlan;
  // This now expects a more detailed object from the backend
  weekly_schedule: {
    [key: string]: WorkoutDay;
  };
}

export interface LogData {
    user_id: number;
    exercise_id: number;
    date: string; // YYYY-MM-DD
    sets: number;
    reps: number;
    weight_kg: number;
}

export interface LoggedSet extends LogData {
    id: number;
}

// --- API Client Functions ---

export const createUser = async (userData: UserData): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(`Failed to create user: ${errorData.detail || response.statusText}`);
  }
  return response.json();
};

export const createWorkoutPlan = async (userId: number, planData: WorkoutPlanData): Promise<WorkoutPlan> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/plan/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(planData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(`Failed to create workout plan: ${errorData.detail || response.statusText}`);
  }
  return response.json();
};

export const getWorkoutPlan = async (userId: number): Promise<WorkoutPlanResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/plan/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch workout plan: ${response.statusText}`);
  }
  return response.json();
};

export const getAllExercises = async (): Promise<Exercise[]> => {
    const response = await fetch(`${API_BASE_URL}/exercises/`);
    if (!response.ok) {
        throw new Error(`Failed to fetch exercises: ${response.statusText}`);
    }
    return response.json();
};

export const changeExerciseInPlan = async ({ dayExerciseId, newExerciseId }: { dayExerciseId: number, newExerciseId: number }) => {
    const response = await fetch(`${API_BASE_URL}/workout-day-exercise/${dayExerciseId}/change-exercise`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_exercise_id: newExerciseId }),
    });
    if (!response.ok) {
        throw new Error(`Failed to change exercise: ${response.statusText}`);
    }
    return response.json();
};

// CORRECTED FUNCTION SIGNATURE
export const logWorkoutSet = async (logData: LogData) => {
    const response = await fetch(`${API_BASE_URL}/logs/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
    });
    if (!response.ok) {
        throw new Error(`Failed to log set: ${response.statusText}`);
    }
    return response.json();
};

// --- NEWLY ADDED FUNCTIONS ---

export const getLogsForDate = async (userId: number, date: string): Promise<LoggedSet[]> => {
    const response = await fetch(`${API_BASE_URL}/logs/session/${userId}/${date}`);
    if (!response.ok) {
        if (response.status === 404) return []; // No logs for this day is not an error
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : []; // Handle empty response body
};

export const deleteLoggedSet = async ({ logId, userId }: { logId: number, userId: number }) => {
    const response = await fetch(`${API_BASE_URL}/logs/session/${logId}?user_id=${userId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`Failed to delete log: ${response.statusText}`);
    }
    return response.json();
};
