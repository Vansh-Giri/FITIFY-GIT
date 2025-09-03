from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Text
from sqlalchemy.orm import relationship, declarative_base

# The declarative_base() function returns a new base class from which all
# mapped classes should inherit. This is the standard way to start with SQLAlchemy ORM.
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    age = Column(Integer, nullable=False)
    height_cm = Column(Integer, nullable=False)
    weight_kg = Column(Float, nullable=False)
    gender = Column(String, nullable=False)
    body_type = Column(Integer, nullable=False)
    goal = Column(Integer, nullable=False)
    
    # Relationships
    workout_plan = relationship('WorkoutPlan', back_populates='user', uselist=False, cascade="all, delete-orphan")
    workout_days = relationship('WorkoutDay', back_populates='user', cascade="all, delete-orphan")

class WorkoutPlan(Base):
    __tablename__ = 'workout_plans'
    id = Column(Integer, primary_key=True, index=True)
    workout_type = Column(String, default='gym', nullable=False)
    sessions_per_week = Column(Integer, nullable=False)
    hours_per_session = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Relationship
    user = relationship('User', back_populates='workout_plan')

# --- Exercise Library Models ---

class MuscleGroup(Base):
    __tablename__ = 'muscle_groups'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    # Relationship
    exercises = relationship("Exercise", back_populates="muscle_group")

class Exercise(Base):
    __tablename__ = 'exercises'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(String) # 'Compound', 'Isolation', etc.
    muscle_group_id = Column(Integer, ForeignKey('muscle_groups.id'))
    
    # Relationship
    muscle_group = relationship("MuscleGroup", back_populates="exercises")

# --- User's Persistent Plan Models ---

class WorkoutDay(Base):
    __tablename__ = 'workout_days'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    day_of_week = Column(String, nullable=False) # e.g., "Monday", "Tuesday"
    
    # Relationships
    user = relationship("User", back_populates="workout_days")
    exercises = relationship("WorkoutDayExercise", back_populates="workout_day", cascade="all, delete-orphan")

class WorkoutDayExercise(Base):
    __tablename__ = 'workout_day_exercises'
    id = Column(Integer, primary_key=True, index=True)
    workout_day_id = Column(Integer, ForeignKey('workout_days.id'), nullable=False)
    exercise_id = Column(Integer, ForeignKey('exercises.id'), nullable=False)
    sets = Column(Integer, nullable=False)
    # THE FIX IS HERE: Changed from Integer to String to allow ranges like "8-12".
    reps = Column(String, nullable=False)
    
    # Relationships
    workout_day = relationship("WorkoutDay", back_populates="exercises")
    exercise = relationship("Exercise")

# --- User's Actual Workout Log ---

class WorkoutSessionLog(Base):
    __tablename__ = 'workout_session_logs'
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True, nullable=False)
    sets = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=False)
    weight_kg = Column(Float, nullable=False)
    notes = Column(Text, nullable=True) # For RAG context later
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    exercise_id = Column(Integer, ForeignKey('exercises.id'), nullable=False)
    
    # Relationships
    user = relationship("User")
    exercise = relationship("Exercise")


class WorkoutTemplate(Base):
    __tablename__ = 'workout_templates'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    exercises = relationship("WorkoutTemplateExercise", back_populates="template")

class WorkoutTemplateExercise(Base):
    __tablename__ = 'workout_template_exercises'
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey('workout_templates.id'))
    exercise_id = Column(Integer, ForeignKey('exercises.id'))
    template = relationship("WorkoutTemplate", back_populates="exercises")
    exercise = relationship("Exercise")