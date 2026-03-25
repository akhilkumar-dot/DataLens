import json
from typing import List, Optional, Any
from pydantic import BaseModel, Field


# ── Enterprise Pydantic Models ──

class ExecutiveSummary(BaseModel):
    tldr: str = ""
    overview: str = ""
    key_wins: List[str] = Field(default_factory=list)
    key_risks: List[str] = Field(default_factory=list)
    next_actions: List[str] = Field(default_factory=list)


class ColumnProfile(BaseModel):
    column: str = ""
    type: str = "text"
    mean: Optional[Any] = None
    median: Optional[Any] = None
    std_dev: Optional[Any] = None
    min: Optional[Any] = None
    max: Optional[Any] = None
    null_pct: float = 0
    unique_count: int = 0
    top_values: List[Any] = Field(default_factory=list)
    distribution: str = "unknown"
    ai_description: str = ""


class Correlation(BaseModel):
    col_a: str = ""
    col_b: str = ""
    r_value: float = 0
    interpretation: str = ""


class Outlier(BaseModel):
    row_hint: str = ""
    column: str = ""
    value: Any = None
    zscore: float = 0
    explanation: str = ""


class Statistical(BaseModel):
    column_profiles: List[ColumnProfile] = Field(default_factory=list)
    correlations: List[Correlation] = Field(default_factory=list)
    outliers: List[Outlier] = Field(default_factory=list)


class TrendItem(BaseModel):
    title: str = ""
    description: str = ""
    direction: str = "flat"
    magnitude: str = "moderate"


class AnomalyItem(BaseModel):
    description: str = ""
    severity: str = "medium"
    confidence: int = 75
    type: str = "point"
    root_cause: str = ""
    action: str = ""


class SegmentRanking(BaseModel):
    segment: str = ""
    value: Any = 0
    rank: int = 1
    growth: str = "stable"
    insight: str = ""


class Segments(BaseModel):
    segment_column: str = ""
    rankings: List[SegmentRanking] = Field(default_factory=list)
    top_performer: str = ""
    bottom_performer: str = ""
    fastest_growing: str = ""


class Prediction(BaseModel):
    metric: str = ""
    current_value: Any = 0
    predicted_30d: Any = 0
    confidence_lower: Any = 0
    confidence_upper: Any = 0
    trend_statement: str = ""
    risk_flag: Optional[str] = None


class QualityIssue(BaseModel):
    type: str = "nulls"
    column: str = ""
    rows_affected: int = 0
    description: str = ""
    fix_suggestion: str = ""


class DataQuality(BaseModel):
    health_score: int = 85
    total_issues: int = 0
    issues: List[QualityIssue] = Field(default_factory=list)


class EnterpriseInsightsResponse(BaseModel):
    executive_summary: ExecutiveSummary = Field(default_factory=ExecutiveSummary)
    statistical: Statistical = Field(default_factory=Statistical)
    trends: List[TrendItem] = Field(default_factory=list)
    anomalies: List[AnomalyItem] = Field(default_factory=list)
    segments: Segments = Field(default_factory=Segments)
    predictions: List[Prediction] = Field(default_factory=list)
    data_quality: DataQuality = Field(default_factory=DataQuality)

    # Backward compatibility
    summary: str = ""
    recommendations: List[str] = Field(default_factory=list)


def parse_llm_output(raw: str) -> dict:
    """Parse LLM output into validated enterprise insights."""
    cleaned = raw.strip()

    # Strip markdown code fences if present
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        cleaned = "\n".join(lines)

    data = json.loads(cleaned)

    # Validate with Pydantic
    validated = EnterpriseInsightsResponse(**data)
    result = validated.model_dump()

    # Backward compat: populate old-style 'summary' and 'recommendations'
    if not result.get("summary") and result.get("executive_summary", {}).get("overview"):
        result["summary"] = result["executive_summary"]["overview"]
    if not result.get("recommendations") and result.get("executive_summary", {}).get("next_actions"):
        result["recommendations"] = result["executive_summary"]["next_actions"]

    return result
