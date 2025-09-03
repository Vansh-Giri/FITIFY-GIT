from sqlalchemy.ext.asyncio import AsyncSession
from . import crud, models

async def seed_database(db: AsyncSession):
    """
    Populates the database with an initial set of muscle groups and exercises.
    This function is idempotent and will not re-seed the database if data already exists.
    """
    # Check if the database has already been seeded
    muscle_group_count = await crud.get_muscle_group_count(db)
    if muscle_group_count > 0:
        # print("Database already seeded. Skipping.")
        return

    print("Database is empty. Seeding with initial data...")
    
    # --- 1. Create Muscle Groups ---
    muscle_groups_data = [
        "Chest", "Back", "Legs", "Shoulders", 
        "Biceps", "Triceps", "Abs", "Cardio"
    ]
    created_groups = {}
    for group_name in muscle_groups_data:
        group = await crud.create_muscle_group(db, name=group_name)
        created_groups[group_name] = group

    # --- 2. Create Exercises ---
    exercises_data = [
        # Chest
        {"name": "Bench Press", "type": "Compound", "group": "Chest"},
        {"name": "Incline Dumbbell Press", "type": "Compound", "group": "Chest"},
        {"name": "Dumbbell Flyes", "type": "Isolation", "group": "Chest"},
        {"name": "Push-ups", "type": "Compound", "group": "Chest"},
        {"name": "Cable Crossovers", "type": "Isolation", "group": "Chest"},

        # Back
        {"name": "Deadlifts", "type": "Compound", "group": "Back"},
        {"name": "Pull-ups", "type": "Compound", "group": "Back"},
        {"name": "Bent-Over Barbell Rows", "type": "Compound", "group": "Back"},
        {"name": "Lat Pulldowns", "type": "Compound", "group": "Back"},
        {"name": "Seated Cable Rows", "type": "Compound", "group": "Back"},

        # Legs
        {"name": "Squats", "type": "Compound", "group": "Legs"},
        {"name": "Leg Press", "type": "Compound", "group": "Legs"},
        {"name": "Lunges", "type": "Compound", "group": "Legs"},
        {"name": "Leg Curls", "type": "Isolation", "group": "Legs"},
        {"name": "Leg Extensions", "type": "Isolation", "group": "Legs"},
        {"name": "Calf Raises", "type": "Isolation", "group": "Legs"},

        # Shoulders
        {"name": "Overhead Press", "type": "Compound", "group": "Shoulders"},
        {"name": "Dumbbell Lateral Raises", "type": "Isolation", "group": "Shoulders"},
        {"name": "Face Pulls", "type": "Isolation", "group": "Shoulders"},
        {"name": "Arnold Press", "type": "Compound", "group": "Shoulders"},

        # Biceps
        {"name": "Barbell Curls", "type": "Isolation", "group": "Biceps"},
        {"name": "Dumbbell Hammer Curls", "type": "Isolation", "group": "Biceps"},
        {"name": "Preacher Curls", "type": "Isolation", "group": "Biceps"},

        # Triceps
        {"name": "Tricep Dips", "type": "Compound", "group": "Triceps"},
        {"name": "Skull Crushers", "type": "Isolation", "group": "Triceps"},
        {"name": "Tricep Pushdowns", "type": "Isolation", "group": "Triceps"},

        # Abs
        {"name": "Crunches", "type": "Isolation", "group": "Abs"},
        {"name": "Leg Raises", "type": "Isolation", "group": "Abs"},
        {"name": "Plank", "type": "Isolation", "group": "Abs"},

        # Cardio
        {"name": "Treadmill Running", "type": "Cardio", "group": "Cardio"},
        {"name": "Cycling", "type": "Cardio", "group": "Cardio"},
        {"name": "Jump Rope", "type": "Cardio", "group": "Cardio"},
    ]

    for exercise in exercises_data:
        group = created_groups.get(exercise["group"])
        if group:
            await crud.create_exercise(db, name=exercise["name"], type=exercise["type"], muscle_group_id=group.id)

    print("Database seeding complete.")

    # --- 3. Create Workout Templates ---
    template_count = await crud.get_template_count(db)
    if template_count == 0:
        print("Seeding workout templates...")
        # Define templates and their associated exercises by name
        templates = {
            "Push Day": ["Bench Press", "Overhead Press", "Incline Dumbbell Press", "Tricep Dips", "Dumbbell Lateral Raises"],
            "Pull Day": ["Deadlifts", "Pull-ups", "Bent-Over Barbell Rows", "Lat Pulldowns", "Barbell Curls"],
            "Leg Day": ["Squats", "Leg Press", "Lunges", "Leg Curls", "Calf Raises"],
            "Chest Focus": ["Bench Press", "Incline Dumbbell Press", "Dumbbell Flyes", "Push-ups", "Cable Crossovers"],
            "Back Focus": ["Pull-ups", "Bent-Over Barbell Rows", "Seated Cable Rows", "Lat Pulldowns", "Face Pulls"]
        }
        all_exercises = await crud.get_all_exercises_dict(db) # New CRUD function needed
        for template_name, exercise_names in templates.items():
            template = await crud.create_workout_template(db, name=template_name)
            for ex_name in exercise_names:
                if ex_name in all_exercises:
                    await crud.add_exercise_to_template(db, template_id=template.id, exercise_id=all_exercises[ex_name].id)
        print("Template seeding complete.")
