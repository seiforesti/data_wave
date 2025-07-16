# app/db_session.py

from contextlib import contextmanager
from sqlmodel import SQLModel, create_engine, Session

import os
from app.models.schema_models import DataTableSchema, SchemaVersion
from dotenv import load_dotenv
import logging
# Setup logging
logger = logging.getLogger(__name__)
load_dotenv()   

# Use SQLite in-memory DB for pytest, else use DB_URL from .env (for container), fallback to default
if os.environ.get("PYTEST_CURRENT_TEST"):
    DATABASE_URL = "sqlite:///:memory:"
else:
    DATABASE_URL = os.environ.get("DB_URL", "postgresql://admin:admin@metadata-db:5432/schema_metadata")

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_size=20,        # Number of persistent connections
    max_overflow=40,     # Extra connections allowed beyond pool_size
    pool_timeout=30      # Seconds to wait before giving up on a connection
)

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL, echo=False)


def init_db():
    """Create database tables if they don't exist."""
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")
        raise


# def get_session():
#     return Session(engine)

@contextmanager
def get_session():
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()
def get_db():
    with get_session() as session:
        yield session
