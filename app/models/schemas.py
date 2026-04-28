from pydantic import BaseModel
from typing import List, Optional

class UploadResponse(BaseModel):
    document_id: str
    filename: str
    num_chunks: int
    message: str

class QueryRequest(BaseModel):
    query: str
    mode: str  # "summary" | "simple" | "technical" | "compare"
    document_ids: List[str]

class QueryResponse(BaseModel):
    answer: str
    mode: str
    source_chunks: List[str]
    document_ids: List[str]