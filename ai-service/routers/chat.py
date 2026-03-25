import os
import traceback
from fastapi import APIRouter, HTTPException, Request
from openai import OpenAI

router = APIRouter()

api_key = os.getenv("OPENAI_API_KEY", "ollama")
base_url = os.getenv("OPENAI_BASE_URL", None)
client = OpenAI(api_key=api_key, base_url=base_url)
MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.2"))

@router.post("/ai/chat")
async def chat_with_data(request: Request):
    try:
        data = await request.json()
        messages = data.get("messages", [])
        schema = data.get("schema", [])
        insights = data.get("insights", {})
        historical_context = data.get("historical_context", "")

        if not messages:
            raise HTTPException(status_code=400, detail="Messages array is required")

        hist_str = f"HISTORICAL USER CONTEXT (from past datasets):\n{historical_context}\n\n" if historical_context else ""

        # Build system context
        system_content = (
            "You are ContextIQ, an advanced AI data analyst. "
            "You are assisting a user in exploring their uploaded dataset.\n\n"
            f"DATASET SCHEMA:\n{schema}\n\n"
            "PREVIOUSLY GENERATED INSIGHTS SUMMARY:\n"
            f"Executive Summary: {insights.get('executive_summary', 'None')}\n"
            f"Trends: {len(insights.get('trends', []))} found\n"
            f"Anomalies: {len(insights.get('anomalies', []))} found\n\n"
            f"{hist_str}"
            "INSTRUCTIONS:\n"
            "1. Answer the user's questions clearly, concisely, and professionally.\n"
            "2. Whenever possible, reference the schema and existing insights.\n"
            "3. If asked to write code or queries, provide them in markdown blocks.\n"
            "4. Do not hallucinate data that wasn't provided."
        )

        llm_messages = [{"role": "system", "content": system_content}]
        
        # Append all user/assistant history messages
        for msg in messages:
            llm_messages.append({"role": msg["role"], "content": msg["content"]})

        response = client.chat.completions.create(
            model=MODEL,
            messages=llm_messages,
            temperature=TEMPERATURE,
            max_tokens=1500,
        )

        answer = response.choices[0].message.content
        return {"response": answer}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chat generation failed: {str(e)}")

@router.post("/ai/sql/generate")
async def generate_sql(request: Request):
    try:
        data = await request.json()
        question = data.get("question", "")
        schema = data.get("schema", "No schema provided")

        if not question:
            raise HTTPException(status_code=400, detail="Question is required")

        system_content = (
            "You are an expert SQL developer. The user has a table called 'data' with these columns:\n"
            f"{schema}\n"
            "Convert the user's question to a valid DuckDB SQL query.\n"
            "Return ONLY the SQL query, nothing else. No markdown, no explanation, just raw SQL."
        )

        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": question}
            ],
            temperature=0.1,
            max_tokens=500,
        )

        sql = response.choices[0].message.content.strip()
        # Clean up any potential markdown if the model hallucinates it
        if sql.startswith("```"):
            lines = sql.split('\n')
            if len(lines) >= 3:
                sql = '\n'.join(lines[1:-1])
        
        return {"sql": sql}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"SQL generation failed: {str(e)}")

@router.post("/ai/sql/explain")
async def explain_sql(request: Request):
    try:
        data = await request.json()
        sql = data.get("sql", "")

        if not sql:
            raise HTTPException(status_code=400, detail="SQL is required")

        system_content = (
            "Explain this SQL query in simple terms that a non-technical person can understand. "
            "Be concise — 2-3 sentences max."
        )

        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": f"Explain this query:\n{sql}"}
            ],
            temperature=0.3,
            max_tokens=300,
        )

        explanation = response.choices[0].message.content.strip()
        return {"explanation": explanation}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"SQL explanation failed: {str(e)}")
