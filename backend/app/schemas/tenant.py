"""
Tenant Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class TenantCreate(BaseModel):
    nome: str
    plano: Optional[str] = "free"

class TenantResponse(BaseModel):
    id: str
    nome: str
    plano: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class TenantUserResponse(BaseModel):
    id: str
    tenant_id: str
    user_id: str
    role: str
    user_nome: Optional[str] = None
    user_email: Optional[str] = None
    
    class Config:
        from_attributes = True

class JoinTenantRequest(BaseModel):
    tenant_id: str
