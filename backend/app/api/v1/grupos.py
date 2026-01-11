"""
Grupo Routes
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.api.v1.deps import get_current_tenant
from app.models.user import User
from app.models.tenant import Tenant
from app.models.grupo import Grupo
from app.schemas.grupo import GrupoCreate, GrupoResponse

router = APIRouter()

@router.get("", response_model=List[GrupoResponse])
def get_grupos(
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Get all grupos for current tenant"""
    grupos = db.query(Grupo).filter(Grupo.tenant_id == current_tenant.id).all()
    return [GrupoResponse.model_validate(g) for g in grupos]

@router.post("", response_model=GrupoResponse)
def create_grupo(
    grupo_data: GrupoCreate,
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Create a new grupo"""
    grupo = Grupo(
        tenant_id=current_tenant.id,
        nome=grupo_data.nome,
        tipo=grupo_data.tipo
    )
    db.add(grupo)
    db.commit()
    db.refresh(grupo)
    
    return GrupoResponse.model_validate(grupo)

@router.delete("/{grupo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_grupo(
    grupo_id: str,
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Delete a grupo"""
    grupo = db.query(Grupo).filter(
        Grupo.id == grupo_id,
        Grupo.tenant_id == current_tenant.id
    ).first()
    
    if not grupo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grupo not found"
        )
    
    db.delete(grupo)
    db.commit()
