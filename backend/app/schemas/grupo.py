"""
Grupo Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class GrupoCreate(BaseModel):
    nome: str
    tipo: Optional[str] = "familia"  # familia, viagem, evento

class GrupoResponse(BaseModel):
    id: str
    tenant_id: str
    nome: str
    tipo: str
    created_at: datetime
    
    class Config:
        from_attributes = True
