from pydantic import BaseModel, ConfigDict
from typing import List, Dict
from datetime import date

# This is the configuration that tells Pydantic to read data
# from ORM model attributes (like plan.id, plan.user_id, etc.)
model_config = ConfigDict(from_attributes=True)

# --- Base Schemas (for creation) ---

class UserCreate(BaseModel):
    username: str
    age: int
    height_cm: int
    weight_kg: float
    gender: str
    body_type: int
    goal: int

class WorkoutPlanCreate(BaseModel):
    workout_type: str
    sessions_per_week: int
    hours_per_session: float

class WorkoutDayExerciseCreate(BaseModel):
    exercise_id: int
    sets: int
    reps: str # Using string to accommodate ranges like "8-12"

class WorkoutDayExerciseUpdate(BaseModel):
    sets: int
    reps: str

class ExerciseChange(BaseModel):
    new_exercise_id: int

class WorkoutSessionLogCreate(BaseModel):
    user_id: int
    exercise_id: int
    date: date
    sets: int # The set number (e.g., 1, 2, 3)
    reps: int # Actual reps performed
    weight_kg: float

# --- Response Schemas (for reading from DB) ---

class User(UserCreate):
    id: int
    model_config = model_config

class WorkoutPlan(WorkoutPlanCreate):
    id: int
    user_id: int
    model_config = model_config

class Exercise(BaseModel):
    id: int
    name: str
    type: str
    model_config = model_config

class WorkoutDayExercise(BaseModel):
    id: int
    exercise_id: int
    sets: int
    reps: str
    exercise: Exercise # Nest the full exercise details
    model_config = model_config

class WorkoutDay(BaseModel):
    id: int
    day_of_week: str
    exercises: List[WorkoutDayExercise] = []
    model_config = model_config

class WorkoutSessionLog(WorkoutSessionLogCreate):
    id: int
    model_config = model_config

# --- Special Response Schemas ---

class WorkoutPlanResponse(BaseModel):
    """A custom schema for the main plan response to the frontend."""
    plan_details: WorkoutPlan
    weekly_schedule: Dict[str, WorkoutDay]

class StatusResponse(BaseModel):
    """A generic response for success/status messages."""
    message: str
