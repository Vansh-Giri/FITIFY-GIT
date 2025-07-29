import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator # Import AsyncGenerator

# Get the database URL from the environment variable.
# The format is postgresql+asyncpg://user:password@host:port/dbname
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://fitify_user:fitify_pass@db:5432/fitify_db")

# Create the asynchronous engine for SQLAlchemy.
# The engine is the core interface to the database.
engine = create_async_engine(DATABASE_URL, echo=True)

# Create a configured "Session" class. This is a session factory.
# We'll use instances of this class to interact with the database.
# - expire_on_commit=False prevents SQLAlchemy from expiring objects after a commit,
#   which is important in an async context.
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine, 
    class_=AsyncSession,
    expire_on_commit=False
)

# THE FIX IS HERE:
# The return type is now correctly hinted as an AsyncGenerator that yields an AsyncSession.
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session for each request.
    It ensures that the session is always closed after the request is finished.
    """
    async with SessionLocal() as session:
        yield session

