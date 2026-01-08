import { useState } from 'react';
import { api, Categoria, CreateCategoriaData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Tags, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const demoCategorias: Categoria[] = [
  { id: '1', tenant_id: '1', nome: 'Alimentação', tipo: 'despesa' },
  { id: '2', tenant_id: '1', nome: 'Transporte', tipo: 'despesa' },
  { id: '3', tenant_id: '1', nome: 'Lazer', tipo: 'despesa' },
  { id: '4', tenant_id: '1', nome: 'Contas', tipo: 'despesa' },
  { id: '5', tenant_id: '1', nome: 'Saúde', tipo: 'despesa' },
];

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>(demoCategorias);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCategoriaData>({ nome: '', tipo: 'despesa' });
  const { toast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCat = await api.createCategoria(formData);
      setCategorias([...categorias, newCat]);
      setIsOpen(false);
      setFormData({ nome: '', tipo: 'despesa' });
      toast({ title: 'Categoria criada!' });
    } catch { toast({ title: 'Erro', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
          <p className="text-muted-foreground">Organize seus gastos por categoria</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nova Categoria</Button></DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader><DialogTitle>Criar Categoria</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required />
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
              <DialogFooter><Button type="submit">Criar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categorias.map((cat) => (
          <Card key={cat.id} className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Tags className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{cat.nome}</p>
                <p className="text-sm text-muted-foreground capitalize">{cat.tipo}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
