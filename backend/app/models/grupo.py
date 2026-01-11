"""
Grupo Model
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class TipoGrupoEnum(str, enum.Enum):
    familia = "familia"
    viagem = "viagem"
    evento = "evento"

class Grupo(Base):
    __tablename__ = "grupos"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    nome = Column(String(255), nullable=False)
    tipo = Column(Enum(TipoGrupoEnum), default=TipoGrupoEnum.familia)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="grupos")
    gastos = relationship("Gasto", back_populates="grupo", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Grupo {self.nome}>"
