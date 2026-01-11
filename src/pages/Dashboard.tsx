import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  TrendingUp,
  Users,
  User,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardStats {
  total_gastos: number;
  gastos_pessoais: number;
  gastos_grupo: number;
  total_mes_atual: number;
  gastos_por_categoria: { categoria: string; valor: number }[];
  gastos_por_mes: { mes: string; valor: number }[];
}

// Demo data for when API is not connected
const demoStats: DashboardStats = {
  total_gastos: 4580.50,
  gastos_pessoais: 1850.00,
  gastos_grupo: 2730.50,
  total_mes_atual: 1580.00,
  gastos_por_categoria: [
    { categoria: 'Alimentação', valor: 1200 },
    { categoria: 'Transporte', valor: 850 },
    { categoria: 'Lazer', valor: 650 },
    { categoria: 'Contas', valor: 980 },
    { categoria: 'Outros', valor: 900.50 },
  ],
  gastos_por_mes: [
    { mes: 'Ago', valor: 2100 },
    { mes: 'Set', valor: 1800 },
    { mes: 'Out', valor: 2300 },
    { mes: 'Nov', valor: 1950 },
    { mes: 'Dez', valor: 2500 },
    { mes: 'Jan', valor: 1580 },
  ],
};


export default function Dashboard() {
  const { currentTenant, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(demoStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentTenant) {
        setStats(demoStats);
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (error) {
        // Use demo data if API fails
        setStats(demoStats);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [currentTenant]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            {currentTenant ? `Visão geral de ${currentTenant.nome}` : 'Selecione um tenant para começar'}
          </p>
        </div>
        <Link to="/gastos">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Gasto
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Gastos
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.total_gastos)}
            </div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gastos Pessoais
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.gastos_pessoais)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowDownRight className="mr-1 h-3 w-3 text-destructive" />
              {((stats.gastos_pessoais / stats.total_gastos) * 100).toFixed(0)}% do total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gastos em Grupo
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.gastos_grupo)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-primary" />
              {((stats.gastos_grupo / stats.total_gastos) * 100).toFixed(0)}% do total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mês Atual
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.total_mes_atual)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.gastos_por_categoria.length} categorias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Bar Chart - Por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
            <CardDescription>Distribuição de gastos no período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.gastos_por_categoria} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tickFormatter={(v) => `R$${v}`} />
                  <YAxis type="category" dataKey="categoria" width={100} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Line Chart - Por Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Mês</CardTitle>
            <CardDescription>Evolução dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.gastos_por_mes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(v) => `R$${v}`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Bar dataKey="valor" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.gastos_por_categoria.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.categoria}</span>
                  <span className="font-medium">{formatCurrency(item.valor)}</span>
                </div>
              ))}
              {stats.gastos_por_categoria.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum gasto registrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/gastos" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                Registrar Gasto
              </Button>
            </Link>
            <Link to="/grupos" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Gerenciar Grupos
              </Button>
            </Link>
            <Link to="/categorias" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <TrendingUp className="h-4 w-4" />
                Ver Categorias
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Demo Notice */}
      {!currentTenant && (
        <Card className="border-dashed border-primary/50 bg-primary/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Modo Demonstração</p>
              <p className="text-sm text-muted-foreground">
                Os dados exibidos são de exemplo. Conecte sua API FastAPI para ver dados reais.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
