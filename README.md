# ResearchMind

> AI-powered research paper assistant — upload research papers and chat with them using RAG + LLaMA 3.3-70B

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=black)
![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_DB-orange?style=flat)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-red?style=flat)

---

## What is ResearchMind?

ResearchMind is a full-stack **Retrieval-Augmented Generation (RAG)** application that lets you upload research papers and have real conversations with them. Instead of reading a 30-page paper, just ask questions — get plain explanations, bullet summaries, deep technical breakdowns, or even compare multiple papers side by side.

All answers are **strictly grounded in your documents**. The LLM will not answer from its own training knowledge — if the information is not in the paper, it will tell you.

---

## Demo

```
User  → Upload "attention_is_all_you_need.pdf"
User  → "What problem does this paper solve?" [simple mode]
AI    → "Before this paper, AI translation models had to read text
         one word at a time. This paper introduces the Transformer,
         which reads all words at once using a mechanism called
         attention — making it much faster and more accurate."

User  → "What are the key contributions?" [technical mode]
AI    → "1. Introduced the Transformer architecture based entirely
         on self-attention, eliminating recurrence and convolutions.
         2. Proposed Multi-Head Attention allowing the model to
         jointly attend to information from different positions..."
```

---

## Features

- **PDF Upload & Indexing** — Upload academic papers and automatically extract, chunk, embed, and store them in a vector database
- **4 Query Modes** — Simple, Summary, Technical, and Compare with tailored prompt templates per mode
- **Multi-paper Support** — Query across all papers or select specific ones using a checkbox library
- **Academic Validation** — Automatically rejects non-research documents (resumes, invoices, etc.) before indexing
- **Persistent Library** — Papers are saved in localStorage and remain available across browser sessions
- **Grounded Answers** — LLM strictly answers from retrieved document chunks only, no hallucination
- **Cross-paper Comparison** — Select multiple papers and ask comparative questions in compare mode
- **Structured Logging** — Separate `app.log` and `error.log` with formatted output
- **Global Error Handling** — Clean JSON error responses for HTTP, validation, and runtime errors

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Axios |
| Backend | FastAPI, Python 3.10+ |
| LLM | LLaMA 3.3-70B via Groq API |
| Embeddings | BAAI/bge-small-en-v1.5 (Sentence Transformers) |
| Vector DB | ChromaDB (persistent, cosine similarity) |
| PDF Parsing | PyMuPDF (fitz) |
| Validation | LLaMA-based document classifier |
| Logging | Python logging with file handlers |

---

## Project Structure

```
research-rag/
├── app/
│   ├── api/
│   │   └── routes.py               # Upload & query endpoints
│   ├── services/
│   │   ├── pdf_service.py          # PDF text extraction
│   │   ├── chunking_service.py     # Word-based chunking with overlap
│   │   ├── embedding_service.py    # Sentence embedding generation
│   │   ├── retrieval_service.py    # Multi-document chunk retrieval
│   │   └── rag_service.py          # RAG pipeline + Groq LLM
│   ├── db/
│   │   └── vector_store.py         # ChromaDB operations
│   ├── models/
│   │   └── schemas.py              # Pydantic request/response schemas
│   ├── prompts/
│   │   └── templates.py            # Mode-specific prompt templates
│   ├── utils/
│   │   ├── logger.py               # Structured logging setup
│   │   └── error_handler.py        # Global exception handlers
│   └── main.py                     # FastAPI app + middleware
├── frontend/                       # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx                 # Main application component
│   │   └── App.css                 # Styles
│   └── package.json
├── storage/
│   ├── pdfs/                       # Uploaded PDF files
│   └── indexes/                    # ChromaDB vector indexes
├── logs/
│   ├── app.log                     # Full application logs
│   └── error.log                   # Error-only logs
├── .env                            # API keys (not committed)
├── .gitignore
└── requirements.txt
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Groq API key — get one free at [console.groq.com](https://console.groq.com)

---

### 1. Clone the repository

```bash
git clone https://github.com/jihadul021/rag-research-mind.git
cd rag-research-mind
```

### 2. Set up the backend

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Start the backend server:

```bash
uvicorn app.main:app --reload
```

- API running at: `http://localhost:8000`
- Swagger docs at: `http://localhost:8000/docs`

---

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend running at: `http://localhost:5173`

---

## API Reference

### POST `/api/upload`
Upload and index a research paper PDF.

**Request:** `multipart/form-data`
```
file: <PDF file>
```

**Response:**
```json
{
  "document_id": "a1b2c3d4",
  "filename": "attention_is_all_you_need.pdf",
  "num_chunks": 42,
  "message": "Paper uploaded and processed successfully"
}
```

**Errors:**
- `400` — Not a PDF file
- `400` — Not a research paper or academic article
- `500` — Internal server error

---

### POST `/api/query`
Query one or more indexed papers.

**Request:**
```json
{
  "query": "What is the main contribution of this paper?",
  "mode": "technical",
  "document_ids": ["a1b2c3d4", "e5f6g7h8"]
}
```

**Response:**
```json
{
  "answer": "The main contribution is...",
  "mode": "technical",
  "source_chunks": ["...chunk text..."],
  "document_ids": ["a1b2c3d4"]
}
```

---

## Query Modes

| Mode | Best For | Example Query |
|---|---|---|
| `simple` | Beginners, quick understanding | "What is this paper about?" |
| `summary` | Overview of key points | "Summarize the findings" |
| `technical` | Researchers, deep analysis | "What are the limitations?" |
| `compare` | Multiple papers | "How do these papers differ in methodology?" |

---

## How It Works

```
1. UPLOAD
   PDF file → PyMuPDF extracts text
            → LLaMA validates it's a research paper
            → Split into 600-word chunks with 75-word overlap
            → BAAI/bge-small-en-v1.5 generates embeddings
            → Stored in ChromaDB with cosine similarity index

2. QUERY
   User question → Embedded with same model
                → Top-4 relevant chunks retrieved per document
                → Mode-specific prompt built with context
                → LLaMA 3.3-70B generates grounded answer
                → Returned with source chunks
```

---

## Configuration

| Variable | Description | Required |
|---|---|---|
| `GROQ_API_KEY` | Groq API key for LLaMA access | Yes |

---

## Requirements

```
fastapi
uvicorn
pymupdf
chromadb
sentence-transformers
groq
python-multipart
python-dotenv
transformers==4.40.0
torch
```

---


## Author

Built by [Jihad](https://github.com/jihadul021) · [GitHub](https://github.com/jihadul021/rag-research-mind)
