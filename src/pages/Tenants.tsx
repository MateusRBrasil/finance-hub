import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, Tenant } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Building2, Plus, Users, Calendar, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Tenants() {
  const { tenants, selectTenant, refreshTenants, currentTenant } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantPlano, setNewTenantPlano] = useState('free');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const tenant = await api.createTenant({
        nome: newTenantName,
        plano: newTenantPlano,
      });
      await refreshTenants();
      selectTenant(tenant);
      setIsCreateOpen(false);
      setNewTenantName('');
      toast({
        title: 'Tenant criado!',
        description: `${tenant.nome} foi criado com sucesso.`,
      });
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao criar tenant',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTenant = (tenant: Tenant) => {
    selectTenant(tenant);
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Seus Tenants</h1>
          <p className="text-muted-foreground">
            Gerencie suas organizações e grupos financeiros
          </p>
        </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Tenant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateTenant}>
                <DialogHeader>
                  <DialogTitle>Criar Novo Tenant</DialogTitle>
                  <DialogDescription>
                    Crie uma nova organização para gerenciar finanças com sua família, amigos ou equipe.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenant-name">Nome do Tenant</Label>
                    <Input
                      id="tenant-name"
                      placeholder="Ex: Família Silva, Viagem Europa"
                      value={newTenantName}
                      onChange={(e) => setNewTenantName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenant-plano">Plano</Label>
                    <Select value={newTenantPlano} onValueChange={setNewTenantPlano}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Criando...' : 'Criar Tenant'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tenants Grid */}
        {tenants.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium text-foreground">Nenhum tenant ainda</h3>
              <p className="mb-4 text-center text-muted-foreground">
                Crie seu primeiro tenant para começar a gerenciar suas finanças
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeiro Tenant
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tenants.map((tenant) => (
              <Card
                key={tenant.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  currentTenant?.id === tenant.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelectTenant(tenant)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    {currentTenant?.id === tenant.id && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        Ativo
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg">{tenant.nome}</CardTitle>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="rounded bg-secondary px-2 py-0.5 text-xs">
                      {tenant.plano}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-between">
                    Acessar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}
