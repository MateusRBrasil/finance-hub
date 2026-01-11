"""
Gasto Model
"""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Date, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Gasto(Base):
    __tablename__ = "gastos"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    grupo_id = Column(String(36), ForeignKey("grupos.id", ondelete="SET NULL"), nullable=True)  # NULL = gasto pessoal
    categoria_id = Column(String(36), ForeignKey("categorias.id", ondelete="SET NULL"), nullable=True)
    valor = Column(Float, nullable=False)
    data = Column(Date, default=date.today)
    descricao = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="gastos")
    user = relationship("User", back_populates="gastos")
    grupo = relationship("Grupo", back_populates="gastos")
    categoria = relationship("Categoria", back_populates="gastos")
    
    def __repr__(self):
        return f"<Gasto {self.valor} - {self.descricao}>"
