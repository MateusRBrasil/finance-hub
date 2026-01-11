"""
Categoria Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CategoriaCreate(BaseModel):
    nome: str
    tipo: Optional[str] = "despesa"  # despesa, receita

class CategoriaResponse(BaseModel):
    id: str
    tenant_id: str
    nome: str
    tipo: str
    created_at: datetime
    
    class Config:
        from_attributes = True
