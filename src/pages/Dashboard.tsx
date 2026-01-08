import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, Gasto } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardStats {
  total_gastos: number;
  gastos_pessoais: number;
  gastos_grupo: number;
  por_categoria: { categoria: string; total: number }[];
  por_grupo: { grupo: string; total: number }[];
  ultimos_gastos: Gasto[];
}

// Demo data for when API is not connected
const demoStats: DashboardStats = {
  total_gastos: 4580.50,
  gastos_pessoais: 1850.00,
  gastos_grupo: 2730.50,
  por_categoria: [
    { categoria: 'Alimentação', total: 1200 },
    { categoria: 'Transporte', total: 850 },
    { categoria: 'Lazer', total: 650 },
    { categoria: 'Contas', total: 980 },
    { categoria: 'Outros', total: 900.50 },
  ],
  por_grupo: [
    { grupo: 'Família', total: 1500 },
    { grupo: 'Viagem SP', total: 730.50 },
    { grupo: 'Churras', total: 500 },
  ],
  ultimos_gastos: [
    {
      id: '1',
      tenant_id: '1',
      user_id: '1',
      grupo_id: null,
      categoria_id: '1',
      valor: 150.00,
      data: new Date().toISOString(),
      descricao: 'Supermercado',
      created_at: new Date().toISOString(),
      categoria_nome: 'Alimentação',
    },
    {
      id: '2',
      tenant_id: '1',
      user_id: '1',
      grupo_id: '1',
      categoria_id: '2',
      valor: 85.00,
      data: new Date().toISOString(),
      descricao: 'Uber para reunião',
      created_at: new Date().toISOString(),
      categoria_nome: 'Transporte',
      grupo_nome: 'Família',
    },
    {
      id: '3',
      tenant_id: '1',
      user_id: '1',
      grupo_id: null,
      categoria_id: '3',
      valor: 250.00,
      data: new Date().toISOString(),
      descricao: 'Cinema e jantar',
      created_at: new Date().toISOString(),
      categoria_nome: 'Lazer',
    },
  ],
};

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

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
              Categorias
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.por_categoria.length}
            </div>
            <p className="text-xs text-muted-foreground">Categorias ativas</p>
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
                <BarChart data={stats.por_categoria} layout="vertical">
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
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Por Grupo */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Grupo</CardTitle>
            <CardDescription>Divisão entre grupos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.por_grupo}
                    dataKey="total"
                    nameKey="grupo"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ grupo, percent }) => `${grupo} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {stats.por_grupo.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Últimos Gastos</CardTitle>
            <CardDescription>Transações recentes do tenant</CardDescription>
          </div>
          <Link to="/gastos">
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.ultimos_gastos.map((gasto) => (
              <div
                key={gasto.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      gasto.grupo_id
                        ? 'bg-primary/10 text-primary'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {gasto.grupo_id ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{gasto.descricao}</p>
                    <p className="text-sm text-muted-foreground">
                      {gasto.categoria_nome}
                      {gasto.grupo_nome && ` • ${gasto.grupo_nome}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {formatCurrency(gasto.valor)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(gasto.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
