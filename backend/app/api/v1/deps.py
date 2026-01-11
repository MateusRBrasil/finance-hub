"""
API Dependencies
"""
from typing import Optional
from fastapi import Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.tenant import Tenant, TenantUser

async def get_current_tenant(
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Tenant:
    """
    Get the current tenant from header and verify user access.
    Every request that needs tenant context must use this dependency.
    """
    if not x_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-Tenant-ID header is required"
        )
    
    # Verify tenant exists
    tenant = db.query(Tenant).filter(Tenant.id == x_tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Verify user has access to this tenant
    tenant_user = db.query(TenantUser).filter(
        TenantUser.tenant_id == x_tenant_id,
        TenantUser.user_id == current_user.id
    ).first()
    
    if not tenant_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have access to this tenant"
        )
    
    return tenant
