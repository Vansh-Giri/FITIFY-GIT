import random
from sqlalchemy.ext.asyncio import AsyncSession
from . import crud, schemas, models

class WorkoutGenerator:
    """
    Generates a personalized workout plan based on user goals and schedule.
    The generated plan is then saved to the database.
    """
    def __init__(self, db: AsyncSession, user_plan: models.WorkoutPlan, user_goal: int):
        self.db = db
        self.plan = user_plan
        self.user_id = user_plan.user_id
        self.sessions_per_week = user_plan.sessions_per_week
        self.goal = user_goal
        self.sets, self.reps = self._get_set_rep_scheme()

    def _get_set_rep_scheme(self):
        """Determines the number of sets and reps based on the user's goal."""
        if self.goal <= 3:  # Endurance
            return 3, "12-15"
        elif self.goal <= 6:  # Hypertrophy (Muscle Growth)
            return 4, "8-12"
        else:  # Strength
            return 5, "4-6"

    async def _get_exercises_for_groups(self, muscle_groups: list[str], count: int) -> list[models.Exercise]:
        """Fetches a specified number of random exercises for a list of muscle groups."""
        exercises = await crud.get_exercises_by_muscle_groups(self.db, muscle_groups)
        # Ensure we don't try to sample more exercises than exist
        return random.sample(exercises, min(len(exercises), count))

    async def _create_and_save_day(self, day_of_week: str, muscle_groups: list[str], exercise_count: int):
        """Creates a workout day, populates it with exercises, and saves it to the DB."""
        workout_day = await crud.create_workout_day(self.db, user_id=self.user_id, day_of_week=day_of_week)
        if not muscle_groups: # Handle rest days
            return
        
        exercises = await self._get_exercises_for_groups(muscle_groups, exercise_count)
        for exercise in exercises:
            exercise_data = schemas.WorkoutDayExerciseCreate(exercise_id=exercise.id, sets=self.sets, reps=self.reps)
            await crud.add_exercise_to_workout_day(self.db, workout_day.id, exercise_data)

    async def generate_and_save_plan(self):
        """Main logic to generate and save the entire weekly plan."""
        
        # Clear any pre-existing plan for the user to prevent duplicates
        await crud.delete_workout_days_for_user(self.db, self.user_id)

        # Define standard muscle group splits
        push_groups = ["Chest", "Shoulders", "Triceps"]
        pull_groups = ["Back", "Biceps"]
        leg_groups = ["Legs", "Abs"]
        full_body_groups = ["Chest", "Back", "Legs", "Shoulders"]
        upper_body_groups = ["Chest", "Back", "Shoulders", "Biceps", "Triceps"]
        
        # --- THE FIX IS HERE: Separated logic for 6, 5, 4, and 3 days ---

        if self.sessions_per_week >= 6: # Push/Pull/Legs x2
            await self._create_and_save_day("Monday", push_groups, 5)
            await self._create_and_save_day("Tuesday", pull_groups, 5)
            await self._create_and_save_day("Wednesday", leg_groups, 5)
            await self._create_and_save_day("Thursday", push_groups, 5)
            await self._create_and_save_day("Friday", pull_groups, 5)
            await self._create_and_save_day("Saturday", leg_groups, 5)
            await self._create_and_save_day("Sunday", [], 0) # Rest Day

        elif self.sessions_per_week == 5: # Push/Pull/Legs/Upper/Lower
            await self._create_and_save_day("Monday", push_groups, 6)
            await self._create_and_save_day("Tuesday", pull_groups, 5)
            await self._create_and_save_day("Wednesday", leg_groups, 5)
            await self._create_and_save_day("Thursday", [], 0) # Rest Day
            await self._create_and_save_day("Friday", upper_body_groups, 5)
            await self._create_and_save_day("Saturday", leg_groups, 5)
            await self._create_and_save_day("Sunday", [], 0) # Rest Day

        elif self.sessions_per_week == 4: # Upper/Lower Split
            await self._create_and_save_day("Monday", upper_body_groups, 6)
            await self._create_and_save_day("Tuesday", leg_groups, 5)
            await self._create_and_save_day("Wednesday", [], 0) # Rest Day
            await self._create_and_save_day("Thursday", upper_body_groups, 6)
            await self._create_and_save_day("Friday", leg_groups, 5)
            await self._create_and_save_day("Saturday", [], 0) # Rest Day
            await self._create_and_save_day("Sunday", [], 0) # Rest Day

        elif self.sessions_per_week == 3: # Full Body Split
            await self._create_and_save_day("Monday", full_body_groups, 5)
            await self._create_and_save_day("Tuesday", [], 0) # Rest Day
            await self._create_and_save_day("Wednesday", full_body_groups, 5)
            await self._create_and_save_day("Thursday", [], 0) # Rest Day
            await self._create_and_save_day("Friday", full_body_groups, 5)
            await self._create_and_save_day("Saturday", [], 0) # Rest Day
            await self._create_and_save_day("Sunday", [], 0) # Rest Day
        
        else: # Fallback for 1-2 days
            await self._create_and_save_day("Monday", full_body_groups, 5)
            await self._create_and_save_day("Tuesday", [], 0)
            await self._create_and_save_day("Wednesday", full_body_groups, 5)
            await self._create_and_save_day("Thursday", [], 0)
            await self._create_and_save_day("Friday", [], 0)
            await self._create_and_save_day("Saturday", [], 0)
            await self._create_and_save_day("Sunday", [], 0)


async def generate_and_save_plan_for_user(db: AsyncSession, user_id: int):
    """
    Entry point function to generate a plan for a specific user.
    """
    user = await crud.get_user(db, user_id)
    plan = await crud.get_workout_plan_by_user(db, user_id)

    if not user or not plan:
        print(f"Could not find user or plan details for user_id: {user_id}")
        return

    generator = WorkoutGenerator(db, plan, user.goal)
    await generator.generate_and_save_plan()
    print(f"Successfully generated and saved workout plan for user_id: {user_id}")
