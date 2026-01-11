"""
Dashboard Routes
"""
from typing import List
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user
from app.api.v1.deps import get_current_tenant
from app.models.user import User
from app.models.tenant import Tenant
from app.models.gasto import Gasto
from app.models.categoria import Categoria
from pydantic import BaseModel

router = APIRouter()

class DashboardStats(BaseModel):
    total_gastos: float
    gastos_pessoais: float
    gastos_grupo: float
    total_mes_atual: float
    gastos_por_categoria: List[dict]
    gastos_por_mes: List[dict]

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for current tenant"""
    
    # Total gastos
    total = db.query(func.sum(Gasto.valor)).filter(
        Gasto.tenant_id == current_tenant.id
    ).scalar() or 0
    
    # Gastos pessoais (grupo_id is null)
    pessoais = db.query(func.sum(Gasto.valor)).filter(
        Gasto.tenant_id == current_tenant.id,
        Gasto.grupo_id == None
    ).scalar() or 0
    
    # Gastos em grupo
    grupo = db.query(func.sum(Gasto.valor)).filter(
        Gasto.tenant_id == current_tenant.id,
        Gasto.grupo_id != None
    ).scalar() or 0
    
    # Gastos mês atual
    hoje = date.today()
    primeiro_dia_mes = date(hoje.year, hoje.month, 1)
    mes_atual = db.query(func.sum(Gasto.valor)).filter(
        Gasto.tenant_id == current_tenant.id,
        Gasto.data >= primeiro_dia_mes
    ).scalar() or 0
    
    # Gastos por categoria
    gastos_cat = db.query(
        Categoria.nome,
        func.sum(Gasto.valor).label('total')
    ).join(Gasto, Categoria.id == Gasto.categoria_id).filter(
        Gasto.tenant_id == current_tenant.id
    ).group_by(Categoria.nome).all()
    
    gastos_por_categoria = [
        {"categoria": cat, "valor": float(total)}
        for cat, total in gastos_cat
    ]
    
    # Gastos por mês (últimos 6 meses)
    gastos_por_mes = []
    for i in range(5, -1, -1):
        data_ref = hoje - timedelta(days=30 * i)
        primeiro_dia = date(data_ref.year, data_ref.month, 1)
        if data_ref.month == 12:
            ultimo_dia = date(data_ref.year + 1, 1, 1) - timedelta(days=1)
        else:
            ultimo_dia = date(data_ref.year, data_ref.month + 1, 1) - timedelta(days=1)
        
        total_mes = db.query(func.sum(Gasto.valor)).filter(
            Gasto.tenant_id == current_tenant.id,
            Gasto.data >= primeiro_dia,
            Gasto.data <= ultimo_dia
        ).scalar() or 0
        
        meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        
        gastos_por_mes.append({
            "mes": meses[data_ref.month - 1],
            "valor": float(total_mes)
        })
    
    return DashboardStats(
        total_gastos=float(total),
        gastos_pessoais=float(pessoais),
        gastos_grupo=float(grupo),
        total_mes_atual=float(mes_atual),
        gastos_por_categoria=gastos_por_categoria,
        gastos_por_mes=gastos_por_mes
    )
