"""
Categoria Model
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Categoria(Base):
    __tablename__ = "categorias"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    nome = Column(String(255), nullable=False)
    tipo = Column(String(50), default="despesa")  # despesa, receita
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="categorias")
    gastos = relationship("Gasto", back_populates="categoria")
    
    def __repr__(self):
        return f"<Categoria {self.nome}>"
