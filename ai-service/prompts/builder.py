import json
from typing import List, Tuple, Any


def build_prompt(
    schema: List[str],
    preview: List[Any],
    instruction: str = "analyze",
    filename: str = "unknown",
    row_count: int = 0,
    stats: dict = None,
) -> Tuple[str, str]:
    """
    Build system and user prompts for the enterprise LLM insight pipeline.
    Returns: Tuple of (system_prompt, user_prompt)
    """

    system_prompt = """You are a world-class senior data analyst AI. Analyze datasets and produce comprehensive enterprise-grade insights.

You MUST respond with a valid JSON object containing ALL of these keys:

{
  "executive_summary": {
    "tldr": "Single sentence a CEO would read",
    "overview": "5-sentence boardroom-ready summary",
    "key_wins": ["Top 3 positive signals"],
    "key_risks": ["Top 3 concerning signals"],
    "next_actions": ["5 specific data-backed recommendations"]
  },
  "statistical": {
    "column_profiles": [
      {
        "column": "column_name",
        "type": "numeric|categorical|temporal|text",
        "mean": null,
        "median": null,
        "std_dev": null,
        "min": null,
        "max": null,
        "null_pct": 0,
        "unique_count": 0,
        "top_values": [],
        "distribution": "normal|skewed_left|skewed_right|bimodal|uniform",
        "ai_description": "What this column represents"
      }
    ],
    "correlations": [
      {"col_a": "x", "col_b": "y", "r_value": 0.85, "interpretation": "Strong positive..."}
    ],
    "outliers": [
      {"row_hint": "Row ~N", "column": "col", "value": "X", "zscore": 3.1, "explanation": "..."}
    ]
  },
  "trends": [
    {"title": "Short title", "description": "Detailed trend explanation", "direction": "up|down|flat|seasonal", "magnitude": "strong|moderate|weak"}
  ],
  "anomalies": [
    {"description": "...", "severity": "high|medium|low", "confidence": 85, "type": "point|contextual|collective", "root_cause": "Hypothesis...", "action": "Suggested fix..."}
  ],
  "segments": {
    "segment_column": "column used for segmentation",
    "rankings": [
      {"segment": "Name", "value": 0, "rank": 1, "growth": "growing|declining|stable", "insight": "..."}
    ],
    "top_performer": "...",
    "bottom_performer": "...",
    "fastest_growing": "..."
  },
  "predictions": [
    {"metric": "column name", "current_value": 0, "predicted_30d": 0, "confidence_lower": 0, "confidence_upper": 0, "trend_statement": "If current trend continues...", "risk_flag": null}
  ],
  "data_quality": {
    "health_score": 85,
    "total_issues": 0,
    "issues": [
      {"type": "nulls|duplicates|type_mismatch|impossible_value|format_inconsistency", "column": "...", "rows_affected": 0, "description": "...", "fix_suggestion": "..."}
    ]
  }
}

Rules:
- Reference ACTUAL column names and values from the data preview.
- For numeric columns, compute approximate stats from the preview data.
- Be specific: cite row numbers, values, percentages.
- Keep each text field concise (1-3 sentences max).
- If a section doesn't apply (e.g. no time column for trends), provide reasonable entries based on what IS in the data.
- For correlations, examine numeric column relationships.
- For segments, use the most natural categorical column.
- For predictions, use the most important numeric metric.
- health_score: 0-100 based on nulls, duplicates, consistency.
- Do NOT include any text outside the JSON object."""

    # Format preview data
    if preview and len(preview) > 0:
        if isinstance(preview[0], dict):
            preview_text = json.dumps(preview[:20], indent=2, default=str)
        else:
            preview_text = json.dumps(preview[:20], default=str)
    else:
        preview_text = "No preview data available."

    # Include pre-computed stats if available
    stats_section = ""
    if stats:
        stats_section = f"\n**Pre-Computed Statistics**:\n{json.dumps(stats, indent=2, default=str)}\n"

    user_prompt = f"""Analyze this dataset and provide comprehensive enterprise-grade insights.

**File**: {filename}
**Total Rows**: {row_count}
**Columns** ({len(schema)}): {', '.join(schema) if schema else 'Unknown'}

**Data Preview (first {min(20, len(preview) if preview else 0)} rows)**:
{preview_text}
{stats_section}
Provide your COMPLETE analysis as a JSON object with ALL keys: executive_summary, statistical, trends, anomalies, segments, predictions, data_quality."""

    return system_prompt, user_prompt
