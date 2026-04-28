from sentence_transformers import SentenceTransformer
from app.utils.logger import get_logger

logger = get_logger(__name__)

# BAAI/bge-small-en-v1.5 works better for academic/technical text
model = SentenceTransformer("BAAI/bge-small-en-v1.5")

def get_embeddings(chunks: list[str]) -> list:
    """Generate embeddings for a list of text chunks."""
    logger.info(f"Generating embeddings for {len(chunks)} chunks")
    embeddings = model.encode(chunks, show_progress_bar=True)
    return embeddings.tolist()

def get_query_embedding(query: str) -> list:
    """Generate embedding for a single query string."""
    embedding = model.encode([query])
    return embedding.tolist()[0]