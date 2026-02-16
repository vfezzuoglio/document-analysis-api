# app/routers/documents.py

from __future__ import annotations

import io
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from pypdf  import PdfReader
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, get_db
from app.core.security_deps import get_current_user
from app.models import Chunk, Document, User
from app.schemas.documents import AskIn, AskOut, DocumentOut

router = APIRouter(prefix="/documents", tags=["documents"])


# --------------------------------------------------
# Helpers: PDF extract + chunk
# --------------------------------------------------

def extract_text_from_pdf_bytes(content: bytes) -> str:
    """
    Extract selectable text from a PDF (no OCR).
    Returns a single string.
    """
    reader = PdfReader(io.BytesIO(content))
    parts: List[str] = []

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            parts.append(page_text)

    return "\n\n".join(parts).strip()


def chunk_text(text: str, chunk_size: int = 900, overlap: int = 150) -> List[str]:
    """
    Simple sliding window chunker (character-based MVP).
    """
    if not text:
        return []

    chunks: List[str] = []
    i = 0
    n = len(text)

    while i < n:
        end = min(i + chunk_size, n)
        chunk = text[i:end].strip()

        if chunk:
            chunks.append(chunk)

        if end == n:
            break

        i = max(0, end - overlap)

    return chunks


# --------------------------------------------------
# Background processing
# --------------------------------------------------

def process_document_bytes(doc_id: int, content: bytes) -> None:
    """
    Runs after upload returns.
    Uses a fresh DB session inside background task.
    """
    db: Session = SessionLocal()

    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return

        doc.status = "processing"
        db.commit()

        text = extract_text_from_pdf_bytes(content)
        chunks = chunk_text(text)

        # Clear previous chunks (safe for re-upload)
        db.query(Chunk).filter(Chunk.document_id == doc_id).delete()
        db.commit()

        for idx, chunk in enumerate(chunks):
            db.add(
                Chunk(
                    document_id=doc_id,
                    idx=idx,
                    text=chunk,   # ✅ Correct column name
                )
            )

        doc.status = "ready"
        db.commit()

    except Exception as e:
        try:
            doc = db.query(Document).filter(Document.id == doc_id).first()
            if doc:
                doc.status = "failed"
                db.commit()
        except Exception:
            pass

        print("Processing failed:", repr(e))

    finally:
        db.close()


# --------------------------------------------------
# Routes
# --------------------------------------------------

@router.post("", response_model=DocumentOut)
def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DocumentOut:

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed.")

    doc = Document(
        user_id=user.id,
        filename=file.filename,
        status="processing",
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)

    content = file.file.read()

    background_tasks.add_task(process_document_bytes, doc.id, content)

    return doc


@router.get("", response_model=List[DocumentOut])
def list_documents(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[DocumentOut]:

    return (
        db.query(Document)
        .filter(Document.user_id == user.id)
        .order_by(Document.id.desc())
        .all()
    )


@router.get("/{doc_id}", response_model=DocumentOut)
def get_document(
    doc_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DocumentOut:

    doc = (
        db.query(Document)
        .filter(Document.id == doc_id, Document.user_id == user.id)
        .first()
    )

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    return doc


@router.post("/{doc_id}/ask", response_model=AskOut)
def ask_document(
    doc_id: int,
    data: AskIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AskOut:

    doc = (
        db.query(Document)
        .filter(Document.id == doc_id, Document.user_id == user.id)
        .first()
    )

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if doc.status != "ready":
        raise HTTPException(status_code=400, detail="Document not ready yet.")

    question = (data.question or "").strip()

    if not question:
        raise HTTPException(status_code=422, detail="Question is required.")

    q = question.lower()

    chunks = (
        db.query(Chunk)
        .filter(Chunk.document_id == doc.id)
        .order_by(Chunk.idx.asc())
        .all()
    )

    matches: List[Chunk] = []

    for c in chunks:
        if q in (c.text or "").lower():   
            matches.append(c)

    if not matches:
        return AskOut(
            answer="I couldn’t find anything relevant in this document.",
            citations=[],
        )

    top = matches[:3]

    answer = "\n\n---\n\n".join((c.text or "")[:700] for c in top)  

    citations = [
        {
            "chunk_id": c.id,
            "idx": c.idx,
            "snippet": (c.text or "")[:350], 
        }
        for c in top
    ]

    return AskOut(answer=answer, citations=citations)
