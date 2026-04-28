from groq import Groq
import os
from dotenv import load_dotenv
from app.services.retrieval_service import retrieve
from app.prompts.templates import get_prompt
from app.utils.logger import get_logger

load_dotenv()
logger = get_logger(__name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def run_rag(query: str, mode: str, document_ids: list[str]) -> dict:
    chunks = retrieve(query, document_ids)
    context = "\n\n---\n\n".join(chunks)
    prompt = get_prompt(mode, query, context)
    logger.info(f"Running RAG in '{mode}' mode for docs: {document_ids}")

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a concise research paper assistant. "
                    "Answer questions directly and to the point. "
                    "Avoid unnecessary elaboration unless the user explicitly asks for detail. "
                    "For simple factual questions, respond in 2-4 sentences max."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=1000
    )

    answer = response.choices[0].message.content

    return {
        "answer": answer,
        "source_chunks": chunks
    }