from pathlib import Path
from uuid import uuid4
from typing import Dict, Any
from fastapi import HTTPException, UploadFile

from app.core.config import settings
from app.core.logging import get_logger
from app.rag.ingestion.loader import load_document
from app.rag.ingestion.cleaner import clean_pages
from app.rag.ingestion.chunker import chunk_pages
from app.rag.embeddings.embedder import embed_texts
from app.rag.vectorstore.chroma_store import add_chunks

logger = get_logger("services.document")


class DocumentService:
    """Orchestrates document upload, extraction, cleaning, chunking, and embedding."""

    @staticmethod
    async def process_and_index_file(file: UploadFile) -> Dict[str, Any]:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file selected.")

        original_name = file.filename
        suffix = Path(original_name).suffix.lower()

        if suffix not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {suffix}. Allowed: {settings.ALLOWED_EXTENSIONS}",
            )

        settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        document_id = uuid4().hex
        saved_path = settings.UPLOAD_DIR / f"{document_id}{suffix}"

        file_bytes = await file.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        saved_path.write_bytes(file_bytes)
        logger.info(f"Saved file {original_name} to {saved_path}")

        # Ingestion pipeline
        pages = load_document(saved_path)
        logger.info(f"Loaded {len(pages)} pages from {original_name}")

        cleaned_pages = clean_pages(pages)
        logger.info(f"Cleaned {len(cleaned_pages)} pages")

        chunks = chunk_pages(cleaned_pages)
        logger.info(f"Created {len(chunks)} chunks")

        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="No usable text was found in the document.",
            )

        for chunk in chunks:
            chunk["chunk_id"] = (
                f"{document_id}_page_{chunk['page_number']}_chunk_{chunk['chunk_number']}"
            )
            chunk["metadata"] = {
                "document_id": document_id,
                "filename": original_name,
                "page_number": chunk["page_number"],
                "chunk_number": chunk["chunk_number"],
            }

        texts = [chunk["text"] for chunk in chunks]
        embeddings = embed_texts(texts)
        stored_count = add_chunks(chunks, embeddings)
        logger.info(f"Successfully indexed {stored_count} chunks in ChromaDB")

        return {
            "success": True,
            "document_id": document_id,
            "filename": original_name,
            "chunks": stored_count,
            "message": "Document uploaded and indexed successfully.",
        }
