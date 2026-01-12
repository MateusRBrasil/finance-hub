import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, Categoria, CreateCategoriaData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Tags, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Categorias() {
  const { currentTenant } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCategoriaData>({ nome: '', tipo: 'despesa' });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategorias = async () => {
      if (!currentTenant) {
        setIsLoadingData(false);
        return;
      }

      setIsLoadingData(true);
      try {
        const data = await api.getCategorias();
        setCategorias(data);
      } catch (error) {
        toast({
          title: 'Erro ao carregar categorias',
          description: error instanceof Error ? error.message : 'Erro de conexão',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchCategorias();
  }, [currentTenant, toast]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({ title: 'Informe o nome da categoria', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const newCat = await api.createCategoria({
        nome: formData.nome.trim(),
        tipo: formData.tipo,
      });
      setCategorias([...categorias, newCat]);
      setIsOpen(false);
      setFormData({ nome: '', tipo: 'despesa' });
      toast({ title: 'Categoria criada!' });
    } catch (error) {
      toast({ 
        title: 'Erro ao criar categoria', 
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteCategoria(id);
      setCategorias(categorias.filter(c => c.id !== id));
      toast({ title: 'Categoria excluída' });
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
        <p className="text-muted-foreground">Selecione um tenant para ver as categorias</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
          <p className="text-muted-foreground">Organize seus gastos por categoria</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nova Categoria</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader><DialogTitle>Criar Categoria</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input 
                    value={formData.nome} 
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })} 
                    placeholder="Ex: Alimentação, Transporte..."
                    required 
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="despesa">Despesa</SelectItem>
                      <SelectItem value="receita">Receita</SelectItem>
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
      ) : categorias.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tags className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhuma categoria criada ainda.
            </p>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Clique em "Nova Categoria" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categorias.map((cat) => (
            <Card key={cat.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Tags className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{cat.nome}</p>
                    <p className="text-sm text-muted-foreground capitalize">{cat.tipo}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(cat.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
