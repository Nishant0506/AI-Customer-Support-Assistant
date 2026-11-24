from dataclasses import dataclass, field
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
DATA_DIR: Path = BASE_DIR / "data"
UPLOAD_DIR: Path = DATA_DIR / "uploads"
CHROMA_DIR: Path = DATA_DIR / "chroma"
DB_PATH: Path = DATA_DIR / "chatbot.db"
SESSION_STORE_PATH: Path = DATA_DIR / "session_store.json"


@dataclass
class Settings:
    PROJECT_NAME: str = "Support RAG API"
    VERSION: str = "2.0.0"
    DESCRIPTION: str = "AI Customer Support Coaching, Knowledge Base Ingestion & RAG Pipeline"
    
    BASE_DIR: Path = BASE_DIR
    DATA_DIR: Path = DATA_DIR
    UPLOAD_DIR: Path = UPLOAD_DIR
    CHROMA_DIR: Path = CHROMA_DIR
    DB_PATH: Path = DB_PATH
    SESSION_STORE_PATH: Path = SESSION_STORE_PATH

    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    COLLECTION_NAME: str = os.getenv("COLLECTION_NAME", "support_knowledge")
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "800"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "120"))
    TOP_K: int = int(os.getenv("TOP_K", "5"))

    HF_TOKEN: str = os.getenv("HF_TOKEN", "")
    HF_MODEL: str = os.getenv("HF_MODEL", "deepseek-ai/DeepSeek-V4-Flash-0731")

    ALLOWED_EXTENSIONS: set = field(default_factory=lambda: {".pdf", ".txt", ".md"})

    def ensure_directories(self) -> None:
        self.DATA_DIR.mkdir(parents=True, exist_ok=True)
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        self.CHROMA_DIR.mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.ensure_directories()
