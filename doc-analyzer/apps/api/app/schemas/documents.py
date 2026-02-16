from pydantic import BaseModel

class DocumentOut(BaseModel):
    id: int
    filename: str
    status: str

    class Config:
        from_attributes = True

class AskIn(BaseModel):
    question: str

class Citation(BaseModel):
    chunk_id: int
    idx: int
    snippet: str

class AskOut(BaseModel):
    answer: str
    citations: list[Citation]
