from app.services.embedding_service import get_query_embedding
from app.db.vector_store import retrieve_chunks
from app.utils.logger import get_logger

logger = get_logger(__name__)

def retrieve(query: str, document_ids: list[str]) -> list[str]:
    """
    Retrieve relevant chunks from one or multiple documents.
    For compare mode, retrieves from all provided document IDs.
    """
    query_embedding = get_query_embedding(query)
    all_chunks = []

    for doc_id in document_ids:
        chunks = retrieve_chunks(doc_id, query_embedding, k=4)
        all_chunks.extend(chunks)
        logger.info(f"Retrieved chunks from document {doc_id}")

    return all_chunks