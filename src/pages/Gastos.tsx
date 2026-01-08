import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, Gasto, Categoria, Grupo, CreateGastoData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Trash2, Edit, Users, User, Filter, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Demo data
const demoCategorias: Categoria[] = [
  { id: '1', tenant_id: '1', nome: 'Alimentação', tipo: 'despesa' },
  { id: '2', tenant_id: '1', nome: 'Transporte', tipo: 'despesa' },
  { id: '3', tenant_id: '1', nome: 'Lazer', tipo: 'despesa' },
  { id: '4', tenant_id: '1', nome: 'Contas', tipo: 'despesa' },
];

const demoGrupos: Grupo[] = [
  { id: '1', tenant_id: '1', nome: 'Família', tipo: 'familia', created_at: new Date().toISOString() },
  { id: '2', tenant_id: '1', nome: 'Viagem SP', tipo: 'viagem', created_at: new Date().toISOString() },
];

const demoGastos: Gasto[] = [
  {
    id: '1', tenant_id: '1', user_id: '1', grupo_id: null, categoria_id: '1',
    valor: 150.00, data: new Date().toISOString(), descricao: 'Supermercado',
    created_at: new Date().toISOString(), categoria_nome: 'Alimentação'
  },
  {
    id: '2', tenant_id: '1', user_id: '1', grupo_id: '1', categoria_id: '2',
    valor: 85.00, data: new Date().toISOString(), descricao: 'Uber para reunião',
    created_at: new Date().toISOString(), categoria_nome: 'Transporte', grupo_nome: 'Família'
  },
  {
    id: '3', tenant_id: '1', user_id: '1', grupo_id: null, categoria_id: '3',
    valor: 250.00, data: new Date().toISOString(), descricao: 'Cinema e jantar',
    created_at: new Date().toISOString(), categoria_nome: 'Lazer'
  },
  {
    id: '4', tenant_id: '1', user_id: '1', grupo_id: '2', categoria_id: '1',
    valor: 320.00, data: new Date().toISOString(), descricao: 'Restaurante em grupo',
    created_at: new Date().toISOString(), categoria_nome: 'Alimentação', grupo_nome: 'Viagem SP'
  },
];

export default function Gastos() {
  const { currentTenant } = useAuth();
  const [gastos, setGastos] = useState<Gasto[]>(demoGastos);
  const [categorias, setCategorias] = useState<Categoria[]>(demoCategorias);
  const [grupos, setGrupos] = useState<Grupo[]>(demoGrupos);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrupo, setFilterGrupo] = useState<string>('all');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<CreateGastoData>({
    categoria_id: '',
    grupo_id: null,
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    descricao: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!currentTenant) return;
      
      try {
        const [gastosData, categoriasData, gruposData] = await Promise.all([
          api.getGastos(),
          api.getCategorias(),
          api.getGrupos(),
        ]);
        setGastos(gastosData);
        setCategorias(categoriasData);
        setGrupos(gruposData);
      } catch (error) {
        // Keep demo data
      }
    };

    fetchData();
  }, [currentTenant]);

  const handleCreateGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newGasto = await api.createGasto(formData);
      setGastos([newGasto, ...gastos]);
      setIsCreateOpen(false);
      setFormData({
        categoria_id: '',
        grupo_id: null,
        valor: 0,
        data: new Date().toISOString().split('T')[0],
        descricao: '',
      });
      toast({ title: 'Gasto registrado!', description: 'O gasto foi adicionado com sucesso.' });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar gasto',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGasto = async (id: string) => {
    try {
      await api.deleteGasto(id);
      setGastos(gastos.filter((g) => g.id !== id));
      toast({ title: 'Gasto excluído', description: 'O gasto foi removido.' });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir gasto',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const filteredGastos = gastos.filter((gasto) => {
    const matchesSearch = gasto.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrupo = filterGrupo === 'all' || 
      (filterGrupo === 'personal' && !gasto.grupo_id) ||
      gasto.grupo_id === filterGrupo;
    const matchesCategoria = filterCategoria === 'all' || gasto.categoria_id === filterCategoria;
    return matchesSearch && matchesGrupo && matchesCategoria;
  });

  const totalFiltered = filteredGastos.reduce((sum, g) => sum + g.valor, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gastos</h1>
          <p className="text-muted-foreground">
            Gerencie seus gastos pessoais e em grupo
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Gasto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateGasto}>
              <DialogHeader>
                <DialogTitle>Registrar Gasto</DialogTitle>
                <DialogDescription>
                  Adicione um novo gasto pessoal ou de grupo
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Ex: Supermercado, Uber, Restaurante..."
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={formData.valor || ''}
                      onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={formData.categoria_id}
                    onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grupo">Grupo (opcional)</Label>
                  <Select
                    value={formData.grupo_id || 'personal'}
                    onValueChange={(value) => setFormData({ ...formData, grupo_id: value === 'personal' ? null : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Gasto pessoal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Gasto Pessoal
                        </div>
                      </SelectItem>
                      {grupos.map((grupo) => (
                        <SelectItem key={grupo.id} value={grupo.id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {grupo.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Salvando...' : 'Salvar Gasto'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar gastos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterGrupo} onValueChange={setFilterGrupo}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar por grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="personal">Apenas Pessoais</SelectItem>
              {grupos.map((grupo) => (
                <SelectItem key={grupo.id} value={grupo.id}>
                  {grupo.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategoria} onValueChange={setFilterCategoria}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {filteredGastos.length} gasto(s) encontrado(s)
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-xl font-bold text-foreground">{formatCurrency(totalFiltered)}</p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGastos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum gasto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredGastos.map((gasto) => (
                  <TableRow key={gasto.id}>
                    <TableCell className="font-medium">{gasto.descricao}</TableCell>
                    <TableCell>{gasto.categoria_nome}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {gasto.grupo_id ? (
                          <>
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-sm">{gasto.grupo_nome}</span>
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Pessoal</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(gasto.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(gasto.valor)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteGasto(gasto.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
