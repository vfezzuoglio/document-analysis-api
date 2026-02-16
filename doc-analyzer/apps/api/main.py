from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.routers.documents import router as documents_router
from app.routers.auth import router as auth_router
from app.core.security_deps import get_current_user


app = FastAPI(title="AI Document Analyzer API")
app.include_router(documents_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(auth_router)

@app.get("/me")
def me(user=Depends(get_current_user)):
    return {"id": user.id, "email": user.email}
