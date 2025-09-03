from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import date
from fastapi import Query

# Import all necessary modules from our application
from . import models, schemas, crud, database, workout_generator, seed

# Initialize the FastAPI app
app = FastAPI()

# Define the origins that are allowed to make requests to this API
origins = [
    "http://localhost",
    "http://localhost:5173",
]

# Add the CORS middleware to the application to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This event handler runs once when the application starts up
@app.on_event("startup")
async def on_startup():
    # Create all database tables based on our models
    async with database.engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
    
    # Seed the database with initial exercises and muscle groups
    async with database.SessionLocal() as db:
        await seed.seed_database(db)

# --- User Management Endpoints ---

@app.post("/api/users/", response_model=schemas.User)
async def create_user(user: schemas.UserCreate, db: AsyncSession = Depends(database.get_db)):
    try:
        db_user = await crud.create_user(db, user)
        return db_user
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Username already exists")

# --- Workout Plan Generation and Management Endpoints ---

@app.post("/api/users/{user_id}/plan/", response_model=schemas.WorkoutPlan)
async def create_workout_plan_and_generate(user_id: int, plan: schemas.WorkoutPlanCreate, db: AsyncSession = Depends(database.get_db)):
    db_plan = await crud.create_workout_plan(db, user_id, plan)
    if not db_plan:
        raise HTTPException(status_code=404, detail="Could not create workout plan for user.")
    await workout_generator.generate_and_save_plan_for_user(db, user_id)
    return db_plan

@app.get("/api/users/{user_id}/plan/", response_model=schemas.WorkoutPlanResponse)
async def get_user_plan(user_id: int, db: AsyncSession = Depends(database.get_db)):
    plan_details = await crud.get_workout_plan_by_user(db, user_id)
    if not plan_details:
        raise HTTPException(status_code=404, detail="Workout plan details not found")
    workout_days = await crud.get_workout_days_for_user(db, user_id)
    weekly_schedule = {day.day_of_week: day for day in workout_days}
    return { "plan_details": plan_details, "weekly_schedule": weekly_schedule }

# --- Plan Customization and Logging Endpoints ---

@app.get("/api/logs/session/{user_id}/{log_date}", response_model=List[schemas.WorkoutSessionLog])
async def get_logs_for_date(user_id: int, log_date: date, db: AsyncSession = Depends(database.get_db)):
    return await crud.get_session_logs_by_date(db, user_id=user_id, log_date=log_date)

@app.delete("/api/logs/session/{log_id}", response_model=schemas.StatusResponse)
async def delete_log(log_id: int, user_id: int, db: AsyncSession = Depends(database.get_db)):
    success = await crud.delete_session_log(db, log_id=log_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Log entry not found or user mismatch")
    return {"message": "Log entry deleted successfully"}

@app.post("/api/logs/session", response_model=schemas.WorkoutSessionLog)
async def log_workout_set(log_data: schemas.WorkoutSessionLogCreate, db: AsyncSession = Depends(database.get_db)):
    return await crud.create_workout_session_log(db, log_data=log_data)

@app.put("/api/workout-day-exercise/{day_exercise_id}/change-exercise", response_model=schemas.WorkoutDayExercise)
async def change_exercise_in_plan(day_exercise_id: int, exercise_change: schemas.ExerciseChange, db: AsyncSession = Depends(database.get_db)):
    updated_exercise_entry = await crud.update_exercise_in_plan(db, day_exercise_id, exercise_change.new_exercise_id)
    if not updated_exercise_entry:
        raise HTTPException(status_code=404, detail="Workout day exercise entry not found")
    return updated_exercise_entry

@app.put("/api/workout-day-exercise/{day_exercise_id}", response_model=schemas.WorkoutDayExercise)
async def update_exercise_in_plan(day_exercise_id: int, exercise_update: schemas.WorkoutDayExerciseUpdate, db: AsyncSession = Depends(database.get_db)):
    updated_exercise = await crud.update_workout_day_exercise(db, day_exercise_id, exercise_update)
    if not updated_exercise:
        raise HTTPException(status_code=404, detail="Exercise in plan not found")
    return updated_exercise

@app.delete("/api/workout-day-exercise/{day_exercise_id}", response_model=schemas.StatusResponse)
async def remove_exercise_from_plan(day_exercise_id: int, db: AsyncSession = Depends(database.get_db)):
    success = await crud.delete_workout_day_exercise(db, day_exercise_id)
    if not success:
        raise HTTPException(status_code=404, detail="Exercise in plan not found")
    return {"message": "Exercise removed successfully"}

@app.post("/api/workout-day/{day_id}/exercises", response_model=schemas.WorkoutDayExercise)
async def add_exercise_to_plan(day_id: int, exercise_add: schemas.WorkoutDayExerciseCreate, db: AsyncSession = Depends(database.get_db)):
    new_exercise_entry = await crud.add_exercise_to_workout_day(db, day_id, exercise_add)
    if not new_exercise_entry:
        raise HTTPException(status_code=404, detail="Workout day not found")
    return new_exercise_entry

# --- Exercise Library Endpoint ---

@app.get("/api/exercises/", response_model=List[schemas.Exercise])
async def list_all_exercises(db: AsyncSession = Depends(database.get_db)):
    return await crud.get_all_exercises(db)


@app.get("/api/templates/", response_model=List[schemas.WorkoutTemplate])
async def list_all_templates(db: AsyncSession = Depends(database.get_db)):
    return await crud.get_all_templates(db)

@app.put("/api/workout-day/{day_id}/swap-template", response_model=List[schemas.WorkoutDayExercise])
async def swap_day_template(day_id: int, template_swap: schemas.TemplateSwap, db: AsyncSession = Depends(database.get_db)):
    user = await crud.get_user(db, template_swap.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Determine sets/reps from user's goal
    sets, reps = 4, "8-12" # Default
    if user.goal <= 3: sets, reps = 3, "12-15"
    elif user.goal > 6: sets, reps = 5, "4-6"

    return await crud.swap_workout_day_with_template(db, day_id, template_swap.template_id, sets, reps)

@app.get("/api/exercises/", response_model=List[schemas.Exercise])
async def list_all_exercises(
    db: AsyncSession = Depends(database.get_db),
    # Allow filtering by a list of muscle group IDs passed as query parameters
    # e.g., /api/exercises/?muscle_group_ids=1&muscle_group_ids=2
    muscle_group_ids: List[int] = Query(None)
):
    """
    Provides a list of all available exercises from the library.
    Can be filtered by one or more muscle group IDs.
    """
    if muscle_group_ids:
        return await crud.get_exercises_by_muscle_group_ids(db, muscle_group_ids=muscle_group_ids)
    return await crud.get_all_exercises(db)
