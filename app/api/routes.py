from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
from groq import Groq
import os
from dotenv import load_dotenv
from app.models.schemas import QueryRequest, QueryResponse, UploadResponse
from app.services.pdf_service import save_and_extract
from app.services.chunking_service import chunk_text
from app.services.embedding_service import get_embeddings
from app.db.vector_store import store_chunks
from app.services.rag_service import run_rag
from app.utils.logger import get_logger

router = APIRouter()
load_dotenv()
logger = get_logger(__name__)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def is_research_document(text: str) -> bool:
    """Ask Groq to verify if the document is a research paper or academic article."""
    sample = text[:3000]
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a document classifier. Reply with only YES or NO, nothing else."
            },
            {
                "role": "user",
                "content": (
                    "Is this text from a research paper or academic article? "
                    "It should contain elements like abstract, methodology, findings, references, "
                    "citations, or formal academic writing.\n\n"
                    f"Text:\n{sample}"
                )
            }
        ],
        max_tokens=3
    )
    verdict = response.choices[0].message.content.strip().upper()
    return "YES" in verdict


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    try:
        result = save_and_extract(file)
        document_id = result["document_id"]
        text = result["text"]

        # Validate document type
        if not is_research_document(text):
            pdf_path = Path(f"storage/pdfs/{document_id}.pdf")
            if pdf_path.exists():
                os.remove(pdf_path)
            raise HTTPException(
                status_code=400,
                detail="Only research papers and academic articles are accepted. Please upload a valid academic document."
            )

        chunks = chunk_text(text)
        embeddings = get_embeddings(chunks)
        store_chunks(document_id, chunks, embeddings)

        return UploadResponse(
            document_id=document_id,
            filename=result["filename"],
            num_chunks=len(chunks),
            message="Paper uploaded and processed successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query", response_model=QueryResponse)
async def query_paper(request: QueryRequest):
    valid_modes = ["summary", "simple", "technical", "compare"]

    if request.mode not in valid_modes:
        raise HTTPException(status_code=400, detail=f"Mode must be one of {valid_modes}")

    if not request.document_ids:
        raise HTTPException(status_code=400, detail="At least one document_id is required")

    try:
        result = run_rag(
            query=request.query,
            mode=request.mode,
            document_ids=request.document_ids
        )

        return QueryResponse(
            answer=result["answer"],
            mode=request.mode,
            source_chunks=result["source_chunks"],
            document_ids=request.document_ids
        )

    except Exception as e:
        logger.error(f"Query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))