from fastapi import FastAPI
from app.api.resume import router as resume_router
from app.api.ai import router as ai_router  
from fastapi.middleware.cors import CORSMiddleware
from app.api.resume_match import router as resume_match_router
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Welcome to AI Interview Assistant 🚀"}

app.include_router(resume_router)
app.include_router(ai_router)
app.include_router(resume_match_router)

