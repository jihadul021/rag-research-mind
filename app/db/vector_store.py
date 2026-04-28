import chromadb
from pathlib import Path
from app.utils.logger import get_logger

logger = get_logger(__name__)

CHROMA_PATH = str(Path("storage/indexes"))

# Persistent ChromaDB client
client = chromadb.PersistentClient(path=CHROMA_PATH)

def get_or_create_collection(document_id: str):
    """Get or create a ChromaDB collection for a document."""
    collection = client.get_or_create_collection(
        name=f"doc_{document_id}",
        metadata={"hnsw:space": "cosine"}  # use cosine similarity
    )
    return collection

def store_chunks(document_id: str, chunks: list[str], embeddings: list):
    """Store chunks and their embeddings in ChromaDB."""
    collection = get_or_create_collection(document_id)
    ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings
    )
    logger.info(f"Stored {len(chunks)} chunks for document {document_id}")

def retrieve_chunks(document_id: str, query_embedding: list, k: int = 4) -> list[str]:
    """Retrieve top-k most relevant chunks for a query."""
    collection = get_or_create_collection(document_id)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k
    )
    chunks = results["documents"][0]
    logger.info(f"Retrieved {len(chunks)} chunks for query")
    return chunks