import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { SectionData, useVendorStore } from '@/hooks/useVendorStore';
import { 
  Layers, Plus, Pencil, Trash2, GripVertical, 
  UtensilsCrossed, Coffee, ShoppingBag, Wrench, Loader2 
} from 'lucide-react';

interface VendorSectionsManagerProps {
  sections: SectionData[];
  onRefresh: () => void;
}

const sectionTypes = [
  { value: 'food', label: 'Food', icon: UtensilsCrossed },
  { value: 'beverage', label: 'Beverages', icon: Coffee },
  { value: 'product', label: 'Products', icon: ShoppingBag },
  { value: 'service', label: 'Services', icon: Wrench },
];

const VendorSectionsManager = ({ sections, onRefresh }: VendorSectionsManagerProps) => {
  const { createSection, updateSection, deleteSection } = useVendorStore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionData | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'product',
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'product',
      is_active: true,
    });
    setEditingSection(null);
  };

  const handleEdit = (section: SectionData) => {
    setEditingSection(section);
    setFormData({
      title: section.title,
      description: section.description || '',
      type: section.type || 'product',
      is_active: section.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingSection) {
        await updateSection(editingSection.id, formData);
        toast({ title: 'Section updated successfully' });
      } else {
        await createSection(formData);
        toast({ title: 'Section created successfully' });
      }
      setIsDialogOpen(false);
      resetForm();
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      await deleteSection(sectionId);
      toast({ title: 'Section deleted successfully' });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (section: SectionData) => {
    try {
      await updateSection(section.id, { is_active: !section.is_active });
      toast({ 
        title: section.is_active ? 'Section hidden' : 'Section visible',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getSectionIcon = (type: string) => {
    const sectionType = sectionTypes.find(t => t.value === type);
    if (!sectionType) return ShoppingBag;
    return sectionType.icon;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6" />
            Store Sections
          </h2>
          <p className="text-muted-foreground">
            Organize your products into sections for easy navigation
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSection ? 'Edit Section' : 'Create New Section'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Section Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Fresh Produce, Beverages"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what's in this section..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Section Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Visible to Customers</Label>
                  <p className="text-sm text-muted-foreground">
                    Show this section in your store
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingSection ? (
                  'Update Section'
                ) : (
                  'Create Section'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Layers className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No sections yet</h3>
            <p className="text-muted-foreground mb-4">
              Create sections to organize your products
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sections.map((section, index) => {
            const IconComponent = getSectionIcon(section.type || 'product');
            return (
              <Card key={section.id} className={!section.is_active ? 'opacity-60' : ''}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground cursor-move">
                      <GripVertical className="h-5 w-5" />
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{section.title}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {section.type || 'product'}
                          </Badge>
                          {!section.is_active && (
                            <Badge variant="outline" className="text-xs">
                              Hidden
                            </Badge>
                          )}
                        </div>
                        {section.description && (
                          <p className="text-sm text-muted-foreground">
                            {section.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={section.is_active}
                        onCheckedChange={() => handleToggleActive(section)}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(section)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorSectionsManager;
