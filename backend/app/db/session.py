import sqlite3
from contextlib import contextmanager
from typing import Generator
from app.core.config import settings


def get_connection() -> sqlite3.Connection:
    """Return a raw SQLite connection with Row factory."""
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(str(settings.DB_PATH))
    connection.row_factory = sqlite3.Row
    return connection


@contextmanager
def get_db_context() -> Generator[sqlite3.Connection, None, None]:
    """Context manager for SQLite connections with automatic commit and rollback."""
    connection = get_connection()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
