from fastapi import APIRouter, File, UploadFile
from app.services.document_service import DocumentService

router = APIRouter(tags=["Documents"])


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and index a support document (PDF, TXT, MD) into ChromaDB."""
    return await DocumentService.process_and_index_file(file)
