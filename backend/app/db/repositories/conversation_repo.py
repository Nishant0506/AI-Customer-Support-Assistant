from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from app.db.session import get_db_context, get_connection


class ConversationRepository:
    """Repository handling all transactional queries for conversations and messages."""

    @staticmethod
    def create_conversation(title: str = "New Conversation") -> int:
        now = datetime.now(timezone.utc).isoformat()
        with get_db_context() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO conversations (title, summary, created_at, updated_at)
                VALUES (?, ?, ?, ?)
                """,
                (title, "", now, now),
            )
            return cursor.lastrowid

    @staticmethod
    def get_conversation(conversation_id: int) -> Optional[Any]:
        with get_db_context() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM conversations WHERE id = ?",
                (conversation_id,),
            )
            return cursor.fetchone()

    @staticmethod
    def update_conversation_summary(conversation_id: int, summary: str) -> None:
        now = datetime.now(timezone.utc).isoformat()
        with get_db_context() as conn:
            conn.execute(
                """
                UPDATE conversations
                SET summary = ?, updated_at = ?
                WHERE id = ?
                """,
                (summary, now, conversation_id),
            )

    @staticmethod
    def add_message(conversation_id: int, role: str, content: str) -> None:
        now = datetime.now(timezone.utc).isoformat()
        with get_db_context() as conn:
            conn.execute(
                """
                INSERT INTO messages (conversation_id, role, content, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (conversation_id, role, content, now),
            )
            conn.execute(
                """
                UPDATE conversations
                SET updated_at = ?
                WHERE id = ?
                """,
                (now, conversation_id),
            )

    @staticmethod
    def get_messages(conversation_id: int, limit: Optional[int] = None) -> List[Any]:
        with get_db_context() as conn:
            cursor = conn.cursor()
            if limit is None:
                cursor.execute(
                    """
                    SELECT * FROM messages
                    WHERE conversation_id = ?
                    ORDER BY id ASC
                    """,
                    (conversation_id,),
                )
            else:
                cursor.execute(
                    """
                    SELECT * FROM (
                        SELECT * FROM messages
                        WHERE conversation_id = ?
                        ORDER BY id DESC
                        LIMIT ?
                    ) ORDER BY id ASC
                    """,
                    (conversation_id, limit),
                )
            return cursor.fetchall()

    @staticmethod
    def get_recent_messages(conversation_id: int, limit: int = 10) -> List[Dict[str, str]]:
        rows = ConversationRepository.get_messages(conversation_id=conversation_id, limit=limit)
        return [{"role": row["role"], "content": row["content"]} for row in rows]

    @staticmethod
    def count_messages(conversation_id: int) -> int:
        with get_db_context() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT COUNT(*) FROM messages WHERE conversation_id = ?",
                (conversation_id,),
            )
            return cursor.fetchone()[0]


# Backwards-compatible procedural functions
create_conversation = ConversationRepository.create_conversation
get_conversation = ConversationRepository.get_conversation
update_conversation_summary = ConversationRepository.update_conversation_summary
add_message = ConversationRepository.add_message
get_messages = ConversationRepository.get_messages
get_recent_messages = ConversationRepository.get_recent_messages
count_messages = ConversationRepository.count_messages
