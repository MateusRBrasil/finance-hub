"""
Gasto Routes
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.api.v1.deps import get_current_tenant
from app.models.user import User
from app.models.tenant import Tenant
from app.models.gasto import Gasto
from app.models.categoria import Categoria
from app.models.grupo import Grupo
from app.schemas.gasto import GastoCreate, GastoUpdate, GastoResponse

router = APIRouter()

def enrich_gasto_response(gasto: Gasto, db: Session) -> GastoResponse:
    """Add related names to gasto response"""
    categoria = db.query(Categoria).filter(Categoria.id == gasto.categoria_id).first() if gasto.categoria_id else None
    grupo = db.query(Grupo).filter(Grupo.id == gasto.grupo_id).first() if gasto.grupo_id else None
    user = db.query(User).filter(User.id == gasto.user_id).first()
    
    return GastoResponse(
        id=gasto.id,
        tenant_id=gasto.tenant_id,
        user_id=gasto.user_id,
        grupo_id=gasto.grupo_id,
        categoria_id=gasto.categoria_id,
        valor=gasto.valor,
        data=gasto.data,
        descricao=gasto.descricao,
        created_at=gasto.created_at,
        categoria_nome=categoria.nome if categoria else None,
        grupo_nome=grupo.nome if grupo else None,
        user_nome=user.nome if user else None
    )

@router.get("", response_model=List[GastoResponse])
def get_gastos(
    grupo_id: Optional[str] = Query(None),
    categoria_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Get all gastos for current tenant with optional filters"""
    query = db.query(Gasto).filter(Gasto.tenant_id == current_tenant.id)
    
    if grupo_id:
        query = query.filter(Gasto.grupo_id == grupo_id)
    if categoria_id:
        query = query.filter(Gasto.categoria_id == categoria_id)
    
    gastos = query.order_by(Gasto.data.desc()).all()
    return [enrich_gasto_response(g, db) for g in gastos]

@router.post("", response_model=GastoResponse)
def create_gasto(
    gasto_data: GastoCreate,
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Create a new gasto"""
    gasto = Gasto(
        tenant_id=current_tenant.id,
        user_id=current_user.id,
        grupo_id=gasto_data.grupo_id,
        categoria_id=gasto_data.categoria_id,
        valor=gasto_data.valor,
        data=gasto_data.data,
        descricao=gasto_data.descricao
    )
    db.add(gasto)
    db.commit()
    db.refresh(gasto)
    
    return enrich_gasto_response(gasto, db)

@router.put("/{gasto_id}", response_model=GastoResponse)
def update_gasto(
    gasto_id: str,
    gasto_data: GastoUpdate,
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Update a gasto"""
    gasto = db.query(Gasto).filter(
        Gasto.id == gasto_id,
        Gasto.tenant_id == current_tenant.id
    ).first()
    
    if not gasto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gasto not found"
        )
    
    # Update fields if provided
    if gasto_data.grupo_id is not None:
        gasto.grupo_id = gasto_data.grupo_id
    if gasto_data.categoria_id is not None:
        gasto.categoria_id = gasto_data.categoria_id
    if gasto_data.valor is not None:
        gasto.valor = gasto_data.valor
    if gasto_data.data is not None:
        gasto.data = gasto_data.data
    if gasto_data.descricao is not None:
        gasto.descricao = gasto_data.descricao
    
    db.commit()
    db.refresh(gasto)
    
    return enrich_gasto_response(gasto, db)

@router.delete("/{gasto_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gasto(
    gasto_id: str,
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Delete a gasto"""
    gasto = db.query(Gasto).filter(
        Gasto.id == gasto_id,
        Gasto.tenant_id == current_tenant.id
    ).first()
    
    if not gasto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gasto not found"
        )
    
    db.delete(gasto)
    db.commit()
