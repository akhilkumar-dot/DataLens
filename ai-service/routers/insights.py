import os
import json
import traceback
from fastapi import APIRouter, HTTPException, Request
from typing import List, Optional, Any
from prompts.builder import build_prompt
from parsers.output_parser import parse_llm_output, EnterpriseInsightsResponse
from openai import OpenAI

router = APIRouter()

# Configure OpenAI client to work with OpenAI, Groq, Ollama, or Gemini
api_key = os.getenv("OPENAI_API_KEY", "ollama")
base_url = os.getenv("OPENAI_BASE_URL", None)

client = OpenAI(
    api_key=api_key,
    base_url=base_url
)

MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.2"))


def compute_pre_stats(preview: list, schema: list) -> dict:
    """Pre-compute basic statistics from preview data to help the LLM."""
    if not preview or not schema:
        return {}

    stats = {}
    for col in schema:
        vals = [row.get(col) for row in preview if isinstance(row, dict) and row.get(col) is not None]
        if not vals:
            continue

        col_stats = {"count": len(vals), "non_null": len(vals), "null_count": len(preview) - len(vals)}

        # Try numeric
        numeric_vals = []
        for v in vals:
            try:
                numeric_vals.append(float(v))
            except (ValueError, TypeError):
                pass

        if len(numeric_vals) > len(vals) * 0.5:
            col_stats["type"] = "numeric"
            col_stats["mean"] = round(sum(numeric_vals) / len(numeric_vals), 2)
            col_stats["min"] = round(min(numeric_vals), 2)
            col_stats["max"] = round(max(numeric_vals), 2)
            sorted_v = sorted(numeric_vals)
            mid = len(sorted_v) // 2
            col_stats["median"] = round(sorted_v[mid], 2)
        else:
            col_stats["type"] = "categorical"
            from collections import Counter
            counts = Counter(str(v) for v in vals)
            col_stats["unique"] = len(counts)
            col_stats["top_3"] = [{"value": k, "count": c} for k, c in counts.most_common(3)]

        stats[col] = col_stats

    return stats


@router.post("/ai/insights")
async def generate_insights(request: Request):
    try:
        data = await request.json()

        schema = data.get("schema", [])
        preview = data.get("preview", [])
        instruction = data.get("instruction", "analyze")
        filename = data.get("filename", "unknown")
        row_count = data.get("rowCount", len(preview))

        # Pre-compute statistics from preview data
        pre_stats = compute_pre_stats(preview, schema)

        # Build prompt
        system_prompt, user_prompt = build_prompt(
            schema=schema,
            preview=preview,
            instruction=instruction,
            filename=filename,
            row_count=row_count,
            stats=pre_stats,
        )

        # Call LLM
        insights = await call_llm(system_prompt, user_prompt)
        return insights

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"LLM insight generation failed: {str(e)}")


async def call_llm(system_prompt: str, user_prompt: str, strict_retry: bool = False) -> dict:
    """Call the LLM and parse + validate the response."""
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    if strict_retry:
        messages.append({
            "role": "user",
            "content": (
                "IMPORTANT: Your previous response was not valid JSON. "
                "You MUST respond with ONLY a JSON object, no markdown, no explanation. "
                "The JSON must have ALL these exact keys: executive_summary, statistical, trends, anomalies, segments, predictions, data_quality."
            ),
        })

    kwargs = {
        "model": MODEL,
        "messages": messages,
        "temperature": TEMPERATURE,
        "max_tokens": 4000,
    }

    kwargs["response_format"] = {"type": "json_object"}

    try:
        print(f"🤖 Calling LLM: model={MODEL}, base_url={base_url}")
        response = client.chat.completions.create(**kwargs)
    except Exception as llm_err:
        print(f"🔴 LLM API call failed: {type(llm_err).__name__}: {llm_err}")
        if "response_format" in kwargs:
            print("🔄 Retrying without response_format...")
            del kwargs["response_format"]
            response = client.chat.completions.create(**kwargs)
        else:
            raise

    raw_output = response.choices[0].message.content
    print(f"📝 LLM raw output (first 300 chars): {raw_output[:300]}")

    try:
        parsed = parse_llm_output(raw_output)
        return parsed
    except Exception as e:
        if not strict_retry:
            print(f"⚠️ First parse failed, retrying with strict prompt: {e}")
            return await call_llm(system_prompt, user_prompt, strict_retry=True)
        raise ValueError(f"LLM output failed schema validation after retry: {e}")
