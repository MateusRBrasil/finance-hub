"""
Tenant and TenantUser Models
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class RoleEnum(str, enum.Enum):
    owner = "owner"
    admin = "admin"
    member = "member"

class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String(255), nullable=False)
    plano = Column(String(50), default="free")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tenant_users = relationship("TenantUser", back_populates="tenant", cascade="all, delete-orphan")
    grupos = relationship("Grupo", back_populates="tenant", cascade="all, delete-orphan")
    categorias = relationship("Categoria", back_populates="tenant", cascade="all, delete-orphan")
    gastos = relationship("Gasto", back_populates="tenant", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Tenant {self.nome}>"

class TenantUser(Base):
    __tablename__ = "tenant_users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.member)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="tenant_users")
    user = relationship("User", back_populates="tenant_users")
    
    def __repr__(self):
        return f"<TenantUser {self.user_id} in {self.tenant_id}>"
