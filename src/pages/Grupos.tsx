import { useState, useEffect } from 'react';
import { api, Grupo, CreateGrupoData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Plane, Calendar, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const demoGrupos: Grupo[] = [
  { id: '1', tenant_id: '1', nome: 'Família Silva', tipo: 'familia', created_at: new Date().toISOString() },
  { id: '2', tenant_id: '1', nome: 'Viagem Europa 2024', tipo: 'viagem', created_at: new Date().toISOString() },
  { id: '3', tenant_id: '1', nome: 'Churras Fim de Ano', tipo: 'evento', created_at: new Date().toISOString() },
];

const tipoIcons = { familia: Users, viagem: Plane, evento: Calendar };
const tipoLabels = { familia: 'Família', viagem: 'Viagem', evento: 'Evento' };

export default function Grupos() {
  const [grupos, setGrupos] = useState<Grupo[]>(demoGrupos);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateGrupoData>({ nome: '', tipo: 'familia' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const data = await api.getGrupos();
        setGrupos(data);
      } catch {
        // Keep demo data
      }
    };
    fetchGrupos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newGrupo = await api.createGrupo(formData);
      setGrupos([...grupos, newGrupo]);
      setIsOpen(false);
      setFormData({ nome: '', tipo: 'familia' });
      toast({ title: 'Grupo criado!' });
    } catch {
      toast({ title: 'Erro ao criar grupo', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteGrupo(id);
      setGrupos(grupos.filter(g => g.id !== id));
      toast({ title: 'Grupo excluído' });
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grupos</h1>
          <p className="text-muted-foreground">Gerencie grupos para gastos compartilhados</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Novo Grupo</Button></DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader><DialogTitle>Criar Grupo</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(v: any) => setFormData({ ...formData, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="familia">Família</SelectItem>
                      <SelectItem value="viagem">Viagem</SelectItem>
                      <SelectItem value="evento">Evento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button type="submit" disabled={isLoading}>{isLoading ? 'Criando...' : 'Criar'}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
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
    </div>
  );
}
