"""
FastAPI Application Entry Point
SaaS Multi-tenant de Controle Financeiro
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, tenants, grupos, categorias, gastos, dashboard
from app.core.config import settings
from app.core.database import engine, Base

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(tenants.router, prefix=f"{settings.API_V1_STR}/tenants", tags=["tenants"])
app.include_router(grupos.router, prefix=f"{settings.API_V1_STR}/grupos", tags=["grupos"])
app.include_router(categorias.router, prefix=f"{settings.API_V1_STR}/categorias", tags=["categorias"])
app.include_router(gastos.router, prefix=f"{settings.API_V1_STR}/gastos", tags=["gastos"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["dashboard"])

@app.get("/")
def root():
    return {"message": "API de Controle Financeiro Multi-tenant", "version": settings.VERSION}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
