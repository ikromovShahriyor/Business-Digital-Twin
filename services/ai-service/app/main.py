import os
from fastapi import FastAPI, HTTPException, Security, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel
from typing import Optional

from app.models import (
    BusinessStateSnapshot,
    ScenarioParameters,
    SimulationResponse,
    AdvisorAnalysisResponse,
    AdvisorChatRequest
)
from app.simulator import run_simulation
from app.advisor import run_deterministic_diagnostics, handle_advisor_chat

app = FastAPI(
    title="Business Digital Twin AI & Analytics Service",
    description="High-fidelity business simulation engine and AI advisor for SaaS multi-tenant digital twins.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY_HEADER = APIKeyHeader(name="X-API-KEY", auto_error=False)
EXPECTED_API_KEY = os.getenv("AI_SERVICE_API_KEY", "internal-secret-service-token-12345")

async def verify_api_key(api_key: Optional[str] = Depends(API_KEY_HEADER)):
    # If key is configured and not default, enforce it
    if EXPECTED_API_KEY and api_key and api_key != EXPECTED_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid internal API key"
        )
    return True

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-analytics-engine",
        "version": "1.0.0"
    }

class SimulationRequestWrapper(BaseModel):
    current_state: BusinessStateSnapshot
    parameters: ScenarioParameters

@app.post("/api/v1/simulate", response_model=SimulationResponse, tags=["Simulation"])
async def simulate_scenario(request: SimulationRequestWrapper, authorized: bool = Depends(verify_api_key)):
    try:
        result = run_simulation(request.current_state, request.parameters)
        return result
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(ex)}")

class DiagnosticsRequestWrapper(BaseModel):
    current_state: BusinessStateSnapshot
    language: str = "en"

@app.post("/api/v1/diagnostics", response_model=AdvisorAnalysisResponse, tags=["Advisor"])
async def get_diagnostics(request: DiagnosticsRequestWrapper, authorized: bool = Depends(verify_api_key)):
    try:
        diagnostics = run_deterministic_diagnostics(request.current_state, language=request.language)
        return diagnostics
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Diagnostics error: {str(ex)}")

@app.post("/api/v1/advisor/chat", tags=["Advisor"])
async def advisor_chat(request: AdvisorChatRequest, authorized: bool = Depends(verify_api_key)):
    try:
        response = await handle_advisor_chat(request)
        return response
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Advisor chat error: {str(ex)}")
