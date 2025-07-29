from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, delete
from sqlalchemy.orm import selectinload
from . import models, schemas
from typing import List
from datetime import date

# --- User CRUD ---

async def get_user(db: AsyncSession, user_id: int):
    result = await db.execute(select(models.User).filter(models.User.id == user_id))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: schemas.UserCreate):
    db_user = models.User(**user.model_dump())
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

# --- WorkoutPlan (High-Level) CRUD ---

async def get_workout_plan_by_user(db: AsyncSession, user_id: int):
    result = await db.execute(select(models.WorkoutPlan).filter(models.WorkoutPlan.user_id == user_id))
    return result.scalars().first()

async def create_workout_plan(db: AsyncSession, user_id: int, plan: schemas.WorkoutPlanCreate):
    db_plan = models.WorkoutPlan(**plan.model_dump(), user_id=user_id)
    db.add(db_plan)
    await db.commit()
    await db.refresh(db_plan)
    return db_plan

# --- MuscleGroup & Exercise Library CRUD ---

async def get_muscle_group_count(db: AsyncSession) -> int:
    result = await db.execute(select(func.count(models.MuscleGroup.id)))
    return result.scalar_one()

async def create_muscle_group(db: AsyncSession, name: str):
    db_group = models.MuscleGroup(name=name)
    db.add(db_group)
    await db.commit()
    await db.refresh(db_group)
    return db_group

async def create_exercise(db: AsyncSession, name: str, type: str, muscle_group_id: int):
    db_exercise = models.Exercise(name=name, type=type, muscle_group_id=muscle_group_id)
    db.add(db_exercise)
    await db.commit()
    await db.refresh(db_exercise)
    return db_exercise

async def get_all_exercises(db: AsyncSession) -> List[models.Exercise]:
    result = await db.execute(select(models.Exercise))
    return result.scalars().all()

async def get_exercises_by_muscle_groups(db: AsyncSession, group_names: List[str]) -> List[models.Exercise]:
    result = await db.execute(
        select(models.Exercise)
        .join(models.MuscleGroup)
        .filter(models.MuscleGroup.name.in_(group_names))
    )
    return result.scalars().all()

# --- Detailed Plan CRUD (WorkoutDay, WorkoutDayExercise) ---

async def create_workout_day(db: AsyncSession, user_id: int, day_of_week: str):
    db_day = models.WorkoutDay(user_id=user_id, day_of_week=day_of_week)
    db.add(db_day)
    await db.commit()
    await db.refresh(db_day)
    return db_day

async def add_exercise_to_workout_day(db: AsyncSession, workout_day_id: int, exercise_data: schemas.WorkoutDayExerciseCreate):
    db_exercise = models.WorkoutDayExercise(
        workout_day_id=workout_day_id,
        **exercise_data.model_dump()
    )
    db.add(db_exercise)
    await db.commit()
    await db.refresh(db_exercise)
    return db_exercise

async def get_workout_days_for_user(db: AsyncSession, user_id: int) -> List[models.WorkoutDay]:
    query = (
        select(models.WorkoutDay)
        .filter(models.WorkoutDay.user_id == user_id)
        .options(
            selectinload(models.WorkoutDay.exercises).selectinload(models.WorkoutDayExercise.exercise)
        )
        .order_by(models.WorkoutDay.id)
    )
    result = await db.execute(query)
    return result.scalars().unique().all()

async def delete_workout_days_for_user(db: AsyncSession, user_id: int):
    stmt = delete(models.WorkoutDay).where(models.WorkoutDay.user_id == user_id)
    await db.execute(stmt)
    await db.commit()

async def update_workout_day_exercise(db: AsyncSession, day_exercise_id: int, exercise_update: schemas.WorkoutDayExerciseUpdate):
    result = await db.execute(select(models.WorkoutDayExercise).filter(models.WorkoutDayExercise.id == day_exercise_id))
    db_exercise = result.scalars().first()
    if db_exercise:
        db_exercise.sets = exercise_update.sets
        db_exercise.reps = exercise_update.reps
        await db.commit()
        await db.refresh(db_exercise)
    return db_exercise

async def delete_workout_day_exercise(db: AsyncSession, day_exercise_id: int) -> bool:
    result = await db.execute(select(models.WorkoutDayExercise).filter(models.WorkoutDayExercise.id == day_exercise_id))
    db_exercise = result.scalars().first()
    if db_exercise:
        await db.delete(db_exercise)
        await db.commit()
        return True
    return False

async def update_exercise_in_plan(db: AsyncSession, day_exercise_id: int, new_exercise_id: int) -> models.WorkoutDayExercise | None:
    result = await db.execute(select(models.WorkoutDayExercise).filter(models.WorkoutDayExercise.id == day_exercise_id))
    db_day_exercise = result.scalars().first()
    if db_day_exercise:
        db_day_exercise.exercise_id = new_exercise_id
        await db.commit()
        await db.refresh(db_day_exercise)
    return db_day_exercise

# --- Session Log CRUD ---

async def create_workout_session_log(db: AsyncSession, log_data: schemas.WorkoutSessionLogCreate) -> models.WorkoutSessionLog:
    db_log = models.WorkoutSessionLog(**log_data.model_dump())
    db.add(db_log)
    await db.commit()
    await db.refresh(db_log)
    return db_log

async def get_session_logs_by_date(db: AsyncSession, user_id: int, log_date: date) -> List[models.WorkoutSessionLog]:
    result = await db.execute(
        select(models.WorkoutSessionLog)
        .filter(models.WorkoutSessionLog.user_id == user_id, models.WorkoutSessionLog.date == log_date)
    )
    return result.scalars().all()

async def delete_session_log(db: AsyncSession, log_id: int, user_id: int) -> bool:
    result = await db.execute(
        select(models.WorkoutSessionLog)
        .filter(models.WorkoutSessionLog.id == log_id, models.WorkoutSessionLog.user_id == user_id)
    )
    log_to_delete = result.scalars().first()
    if log_to_delete:
        await db.delete(log_to_delete)
        await db.commit()
        return True
    return False
