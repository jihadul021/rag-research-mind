from app.utils.logger import get_logger

logger = get_logger(__name__)

def chunk_text(text: str, chunk_size: int = 600, overlap: int = 75) -> list[str]:
    """
    Splits text into overlapping chunks by word count.
    - chunk_size: ~600 words balances context and retrieval precision
    - overlap: 75 words ensures continuity between chunks so
      sentences at boundaries are not lost
    """
    words = text.split()
    chunks = []
    start = 0

    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap  # move forward with overlap

    logger.info(f"Created {len(chunks)} chunks from {len(words)} words")
    return chunks