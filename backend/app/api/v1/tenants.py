"""
Tenant Routes
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.tenant import Tenant, TenantUser, RoleEnum
from app.schemas.tenant import TenantCreate, TenantResponse, TenantUserResponse, JoinTenantRequest

router = APIRouter()

@router.get("", response_model=List[TenantResponse])
def get_my_tenants(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tenants the current user belongs to"""
    tenant_users = db.query(TenantUser).filter(TenantUser.user_id == current_user.id).all()
    tenant_ids = [tu.tenant_id for tu in tenant_users]
    tenants = db.query(Tenant).filter(Tenant.id.in_(tenant_ids)).all()
    return [TenantResponse.model_validate(t) for t in tenants]

@router.post("", response_model=TenantResponse)
def create_tenant(
    tenant_data: TenantCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new tenant and set current user as owner"""
    tenant = Tenant(
        nome=tenant_data.nome,
        plano=tenant_data.plano
    )
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    
    # Add current user as owner
    tenant_user = TenantUser(
        tenant_id=tenant.id,
        user_id=current_user.id,
        role=RoleEnum.owner
    )
    db.add(tenant_user)
    db.commit()
    
    return TenantResponse.model_validate(tenant)

@router.post("/join", response_model=TenantResponse)
def join_tenant(
    request: JoinTenantRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join an existing tenant as a member"""
    tenant = db.query(Tenant).filter(Tenant.id == request.tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Check if already a member
    existing = db.query(TenantUser).filter(
        TenantUser.tenant_id == request.tenant_id,
        TenantUser.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already a member of this tenant"
        )
    
    # Add as member
    tenant_user = TenantUser(
        tenant_id=tenant.id,
        user_id=current_user.id,
        role=RoleEnum.member
    )
    db.add(tenant_user)
    db.commit()
    
    return TenantResponse.model_validate(tenant)

@router.get("/{tenant_id}/users", response_model=List[TenantUserResponse])
def get_tenant_users(
    tenant_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all users in a tenant"""
    # Verify user has access
    access = db.query(TenantUser).filter(
        TenantUser.tenant_id == tenant_id,
        TenantUser.user_id == current_user.id
    ).first()
    
    if not access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No access to this tenant"
        )
    
    tenant_users = db.query(TenantUser).filter(TenantUser.tenant_id == tenant_id).all()
    
    result = []
    for tu in tenant_users:
        user = db.query(User).filter(User.id == tu.user_id).first()
        result.append(TenantUserResponse(
            id=tu.id,
            tenant_id=tu.tenant_id,
            user_id=tu.user_id,
            role=tu.role.value,
            user_nome=user.nome if user else None,
            user_email=user.email if user else None
        ))
    
    return result
