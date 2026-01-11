"""
Categoria Routes
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.api.v1.deps import get_current_tenant
from app.models.user import User
from app.models.tenant import Tenant
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate, CategoriaResponse

router = APIRouter()

@router.get("", response_model=List[CategoriaResponse])
def get_categorias(
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Get all categorias for current tenant"""
    categorias = db.query(Categoria).filter(Categoria.tenant_id == current_tenant.id).all()
    return [CategoriaResponse.model_validate(c) for c in categorias]

@router.post("", response_model=CategoriaResponse)
def create_categoria(
    categoria_data: CategoriaCreate,
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Create a new categoria"""
    categoria = Categoria(
        tenant_id=current_tenant.id,
        nome=categoria_data.nome,
        tipo=categoria_data.tipo
    )
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    
    return CategoriaResponse.model_validate(categoria)

@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_categoria(
    categoria_id: str,
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Delete a categoria"""
    categoria = db.query(Categoria).filter(
        Categoria.id == categoria_id,
        Categoria.tenant_id == current_tenant.id
    ).first()
    
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria not found"
        )
    
    db.delete(categoria)
    db.commit()
