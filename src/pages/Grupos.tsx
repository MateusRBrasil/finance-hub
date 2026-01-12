import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, Grupo, CreateGrupoData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Plane, Calendar, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const tipoIcons = { familia: Users, viagem: Plane, evento: Calendar };
const tipoLabels = { familia: 'Família', viagem: 'Viagem', evento: 'Evento' };

export default function Grupos() {
  const { currentTenant } = useAuth();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateGrupoData>({ nome: '', tipo: 'familia' });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGrupos = async () => {
      if (!currentTenant) {
        setIsLoadingData(false);
        return;
      }

      setIsLoadingData(true);
      try {
        const data = await api.getGrupos();
        setGrupos(data);
      } catch (error) {
        toast({
          title: 'Erro ao carregar grupos',
          description: error instanceof Error ? error.message : 'Erro de conexão',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchGrupos();
  }, [currentTenant, toast]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({ title: 'Informe o nome do grupo', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const newGrupo = await api.createGrupo({
        nome: formData.nome.trim(),
        tipo: formData.tipo,
      });
      setGrupos([...grupos, newGrupo]);
      setIsOpen(false);
      setFormData({ nome: '', tipo: 'familia' });
      toast({ title: 'Grupo criado!' });
    } catch (error) {
      toast({ 
        title: 'Erro ao criar grupo', 
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteGrupo(id);
      setGrupos(grupos.filter(g => g.id !== id));
      toast({ title: 'Grupo excluído' });
    } catch (error) {
      toast({ 
        title: 'Erro ao excluir', 
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
  };

  if (!currentTenant) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Selecione um tenant para ver os grupos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grupos</h1>
          <p className="text-muted-foreground">Gerencie grupos para gastos compartilhados</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Novo Grupo</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader><DialogTitle>Criar Grupo</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input 
                    value={formData.nome} 
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })} 
                    placeholder="Ex: Família Silva, Viagem SP..."
                    required 
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(v: 'familia' | 'viagem' | 'evento') => setFormData({ ...formData, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="familia">Família</SelectItem>
                      <SelectItem value="viagem">Viagem</SelectItem>
                      <SelectItem value="evento">Evento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Criando...' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingData ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : grupos.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-muted-foreground">Nenhum grupo criado</CardTitle>
            <CardDescription className="text-center mt-1">
              Crie grupos para compartilhar gastos com família, amigos ou em viagens.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grupos.map((grupo) => {
            const Icon = tipoIcons[grupo.tipo];
            return (
              <Card key={grupo.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{grupo.nome}</CardTitle>
                        <CardDescription>{tipoLabels[grupo.tipo]}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(grupo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
