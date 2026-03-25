import os
from pathlib import Path
from dotenv import load_dotenv

# IMPORTANT: Load .env BEFORE importing routers, since they read env vars at module scope
# Use explicit path to ensure the correct .env is found regardless of CWD
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)
print(f"📁 Loaded .env from: {env_path}")
print(f"🔑 API Key loaded: {os.getenv('OPENAI_API_KEY', 'NOT SET')[:10]}...")
print(f"🤖 Model: {os.getenv('LLM_MODEL', 'NOT SET')}")
print(f"🌐 Base URL: {os.getenv('OPENAI_BASE_URL', 'NOT SET')}")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.insights import router as insights_router
from routers.chat import router as chat_router

app = FastAPI(
    title="Context-to-Insights AI Service",
    description="LLM-powered data insight generation pipeline",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(insights_router)
app.include_router(chat_router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": os.getenv("LLM_MODEL", "gpt-4o-mini"),
    }
