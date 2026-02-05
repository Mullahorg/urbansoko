import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, GripVertical, Upload, Download, FileSpreadsheet, Hexagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', icon: '', display_order: 0, is_active: true });
  const { toast } = useToast();

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({ title: 'Error loading categories', description: error.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = formData.slug || generateSlug(formData.name);
      if (editingId) {
        const { error } = await supabase.from('categories').update({ ...formData, slug }).eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Category updated' });
      } else {
        const { error } = await supabase.from('categories').insert([{ ...formData, slug }]);
        if (error) throw error;
        toast({ title: 'Category created' });
      }
      handleCancel();
      fetchCategories();
    } catch (error: any) { toast({ title: 'Error saving category', description: error.message, variant: 'destructive' }); }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, slug: category.slug, description: category.description || '', icon: category.icon || '', display_order: category.display_order, is_active: category.is_active });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Category deleted' });
      fetchCategories();
    } catch (error: any) { toast({ title: 'Error deleting', description: error.message, variant: 'destructive' }); }
  };

  const handleCancel = () => { setShowForm(false); setEditingId(null); setFormData({ name: '', slug: '', description: '', icon: '', display_order: 0, is_active: true }); };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) throw new Error('CSV must have header and data rows');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const nameIndex = headers.findIndex(h => h === 'name');
      const descIndex = headers.findIndex(h => h === 'description');
      const iconIndex = headers.findIndex(h => h === 'icon');
      const orderIndex = headers.findIndex(h => h.includes('order'));
      if (nameIndex === -1) throw new Error('CSV must have "name" column');
      const categoriesToImport = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const name = values[nameIndex];
        if (!name) continue;
        categoriesToImport.push({ name, slug: generateSlug(name), description: descIndex !== -1 ? values[descIndex] || null : null, icon: iconIndex !== -1 ? values[iconIndex] || null : null, display_order: orderIndex !== -1 ? parseInt(values[orderIndex]) || i : i, is_active: true });
      }
      if (categoriesToImport.length === 0) throw new Error('No valid categories found');
      const { error } = await supabase.from('categories').upsert(categoriesToImport, { onConflict: 'slug' });
      if (error) throw error;
      toast({ title: 'Categories imported!', description: `Imported ${categoriesToImport.length} categories` });
      setShowImportDialog(false);
      fetchCategories();
    } catch (error: any) { toast({ title: 'Import failed', description: error.message, variant: 'destructive' }); }
    finally { setImporting(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleCSVExport = () => {
    const headers = ['name', 'slug', 'description', 'icon', 'display_order', 'is_active'];
    const rows = categories.map(cat => [`"${cat.name}"`, `"${cat.slug}"`, `"${cat.description || ''}"`, `"${cat.icon || ''}"`, cat.display_order, cat.is_active]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'urbansoko-categories.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Categories exported' });
  };

  const handleDownloadTemplate = () => {
    const template = `name,description,icon,display_order\nElectronics,"Tech gadgets",📱,1\nFashion,"Clothing",👕,2\nFood,"Groceries",🍎,3`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'categories-template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center p-8">Loading categories...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Hexagon className="h-8 w-8 text-primary" />Categories</h1>
          <p className="text-muted-foreground">Manage product categories for UrbanSoko</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild><Button variant="outline"><Upload className="h-4 w-4 mr-2" />Import CSV</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Import Categories from CSV</DialogTitle><DialogDescription>Upload a CSV file. Required: name. Optional: description, icon, display_order</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <Input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVImport} className="max-w-xs mx-auto" disabled={importing} />
                  <p className="text-sm text-muted-foreground mt-2">{importing ? 'Importing...' : 'Select a CSV file'}</p>
                </div>
                <Button variant="outline" onClick={handleDownloadTemplate} className="w-full"><Download className="h-4 w-4 mr-2" />Download Template</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleCSVExport}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          {!showForm && <Button onClick={() => setShowForm(true)} className="btn-cyber"><Plus className="h-4 w-4 mr-2" />Add Category</Button>}
        </div>
      </div>

      {showForm && (
        <Card className="card-cyber">
          <CardHeader><CardTitle>{editingId ? 'Edit Category' : 'New Category'}</CardTitle><CardDescription>{editingId ? 'Update category details' : 'Create a new product category'}</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="name">Category Name *</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-muted/50" /></div>
                <div className="space-y-2"><Label htmlFor="slug">Slug</Label><Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder={generateSlug(formData.name)} className="bg-muted/50" /></div>
                <div className="space-y-2"><Label htmlFor="icon">Icon (emoji)</Label><Input id="icon" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="📱" className="bg-muted/50" /></div>
                <div className="space-y-2"><Label htmlFor="display_order">Display Order</Label><Input id="display_order" type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })} className="bg-muted/50" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="bg-muted/50" /></div>
              <div className="flex items-center space-x-2"><Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} /><Label htmlFor="is_active">Active</Label></div>
              <div className="flex gap-2"><Button type="submit" className="btn-cyber"><Save className="h-4 w-4 mr-2" />{editingId ? 'Update' : 'Create'}</Button><Button type="button" variant="outline" onClick={handleCancel}><X className="h-4 w-4 mr-2" />Cancel</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="card-cyber">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow><TableHead className="w-12"></TableHead><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Icon</TableHead><TableHead>Order</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12"><FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No categories yet. Create or import from CSV.</p></TableCell></TableRow>
              ) : categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell><GripVertical className="h-4 w-4 text-muted-foreground" /></TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell className="text-2xl">{category.icon}</TableCell>
                  <TableCell>{category.display_order}</TableCell>
                  <TableCell><Badge variant={category.is_active ? 'default' : 'secondary'}>{category.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => handleEdit(category)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCategories;
