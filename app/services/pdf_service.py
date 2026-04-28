import fitz  # PyMuPDF
import uuid
import shutil
from pathlib import Path
from app.utils.logger import get_logger

logger = get_logger(__name__)

STORAGE_PATH = Path("storage/pdfs")

def save_and_extract(file) -> dict:
    """
    Saves uploaded PDF to disk and extracts clean text from it.
    Returns document_id, filename, and extracted text.
    """
    # Generate unique ID for this document
    document_id = str(uuid.uuid4())[:8]
    filename = file.filename
    save_path = STORAGE_PATH / f"{document_id}.pdf"

    # Save file to disk
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    logger.info(f"Saved PDF: {filename} as {document_id}.pdf")

    # Extract text using PyMuPDF
    text = ""
    doc = fitz.open(save_path)
    for page in doc:
        text += page.get_text()
    doc.close()

    logger.info(f"Extracted {len(text)} characters from {filename}")

    return {
        "document_id": document_id,
        "filename": filename,
        "text": text
    }