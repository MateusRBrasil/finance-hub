"""
Gasto Schemas
"""
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel

class GastoCreate(BaseModel):
    grupo_id: Optional[str] = None  # NULL = gasto pessoal
    categoria_id: Optional[str] = None
    valor: float
    data: date
    descricao: Optional[str] = None

class GastoUpdate(BaseModel):
    grupo_id: Optional[str] = None
    categoria_id: Optional[str] = None
    valor: Optional[float] = None
    data: Optional[date] = None
    descricao: Optional[str] = None

class GastoResponse(BaseModel):
    id: str
    tenant_id: str
    user_id: str
    grupo_id: Optional[str] = None
    categoria_id: Optional[str] = None
    valor: float
    data: date
    descricao: Optional[str] = None
    created_at: datetime
    categoria_nome: Optional[str] = None
    grupo_nome: Optional[str] = None
    user_nome: Optional[str] = None
    
    class Config:
        from_attributes = True
