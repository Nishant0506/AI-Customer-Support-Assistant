import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("db.session_store")


class SessionStoreRepository:
    """Repository handling file-based storage for simulation session analytics."""

    def __init__(self, store_path: Optional[Path] = None):
        self.store_path = store_path or settings.SESSION_STORE_PATH

    def load_sessions(self) -> List[Dict[str, Any]]:
        if not self.store_path.exists():
            return []
        try:
            with open(self.store_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
        except Exception as exc:
            logger.error(f"Failed to load sessions from {self.store_path}: {exc}")
            return []

    def save_sessions(self, sessions: List[Dict[str, Any]]) -> None:
        self.store_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            with open(self.store_path, "w", encoding="utf-8") as f:
                json.dump(sessions, f, indent=2, ensure_ascii=False)
        except Exception as exc:
            logger.error(f"Failed to save sessions to {self.store_path}: {exc}")

    def upsert_session(self, record: Dict[str, Any]) -> Dict[str, Any]:
        sessions = self.load_sessions()
        session_id = record.get("session_id")
        sessions = [s for s in sessions if s.get("session_id") != session_id]
        sessions.append(record)
        self.save_sessions(sessions)
        return record

    def clear_all(self) -> int:
        sessions = self.load_sessions()
        count = len(sessions)
        self.save_sessions([])
        return count
