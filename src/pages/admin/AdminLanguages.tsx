import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Save, Trash2, Globe, Edit2, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface LanguagePack {
  id: string;
  code: string;
  name: string;
  native_name: string;
  is_default: boolean;
  is_active: boolean;
  translations: Record<string, string>;
  created_at: string;
  updated_at: string;
}

const translationCategories = {
  nav: 'Navigation',
  common: 'Common',
  products: 'Products',
  hero: 'Hero Section',
  footer: 'Footer',
  profile: 'Profile',
  checkout: 'Checkout',
};

const AdminLanguages = () => {
  const [languages, setLanguages] = useState<LanguagePack[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLang, setEditingLang] = useState<LanguagePack | null>(null);
  const [newLang, setNewLang] = useState({
    code: '',
    name: '',
    native_name: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('language_packs')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) throw error;
      setLanguages((data as LanguagePack[]) || []);
    } catch (error: any) {
      toast({
        title: 'Error loading languages',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLanguage = async () => {
    if (!newLang.code || !newLang.name || !newLang.native_name) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Get English translations as template
      const englishLang = languages.find((l) => l.code === 'en');
      const templateTranslations = englishLang?.translations || {};

      const { error } = await supabase.from('language_packs').insert({
        code: newLang.code.toLowerCase(),
        name: newLang.name,
        native_name: newLang.native_name,
        translations: templateTranslations,
        is_active: true,
      });

      if (error) throw error;

      toast({ title: 'Language pack added successfully' });
      setNewLang({ code: '', name: '', native_name: '' });
      setDialogOpen(false);
      fetchLanguages();
    } catch (error: any) {
      toast({
        title: 'Error adding language',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (lang: LanguagePack) => {
    if (lang.is_default) {
      toast({
        title: 'Cannot disable default language',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('language_packs')
        .update({ is_active: !lang.is_active })
        .eq('id', lang.id);

      if (error) throw error;

      setLanguages(
        languages.map((l) =>
          l.id === lang.id ? { ...l, is_active: !l.is_active } : l
        )
      );
      toast({ title: `Language ${lang.is_active ? 'disabled' : 'enabled'}` });
    } catch (error: any) {
      toast({
        title: 'Error updating language',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSetDefault = async (lang: LanguagePack) => {
    try {
      // First, unset all defaults
      await supabase
        .from('language_packs')
        .update({ is_default: false })
        .neq('id', lang.id);

      // Set new default
      const { error } = await supabase
        .from('language_packs')
        .update({ is_default: true, is_active: true })
        .eq('id', lang.id);

      if (error) throw error;

      setLanguages(
        languages.map((l) => ({
          ...l,
          is_default: l.id === lang.id,
          is_active: l.id === lang.id ? true : l.is_active,
        }))
      );
      toast({ title: `${lang.name} set as default language` });
    } catch (error: any) {
      toast({
        title: 'Error setting default',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLanguage = async (lang: LanguagePack) => {
    if (lang.is_default) {
      toast({
        title: 'Cannot delete default language',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('language_packs')
        .delete()
        .eq('id', lang.id);

      if (error) throw error;

      setLanguages(languages.filter((l) => l.id !== lang.id));
      toast({ title: 'Language deleted' });
    } catch (error: any) {
      toast({
        title: 'Error deleting language',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleTranslationChange = (
    langId: string,
    key: string,
    value: string
  ) => {
    setLanguages(
      languages.map((l) =>
        l.id === langId
          ? { ...l, translations: { ...l.translations, [key]: value } }
          : l
      )
    );
  };

  const handleSaveTranslations = async (lang: LanguagePack) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('language_packs')
        .update({ translations: lang.translations })
        .eq('id', lang.id);

      if (error) throw error;
      toast({ title: `${lang.name} translations saved` });
    } catch (error: any) {
      toast({
        title: 'Error saving translations',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getTranslationsByCategory = (translations: Record<string, string>) => {
    const categories: Record<string, Record<string, string>> = {};

    Object.entries(translations).forEach(([key, value]) => {
      const category = key.split('.')[0];
      if (!categories[category]) {
        categories[category] = {};
      }
      categories[category][key] = value;
    });

    return categories;
  };

  if (loading) {
    return <div className="p-6">Loading languages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Language Packs</h2>
          <p className="text-muted-foreground">
            Manage translations for your site
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Language
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Language Pack</DialogTitle>
              <DialogDescription>
                Create a new language pack for your site. English translations
                will be used as a template.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Language Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., fr, de, es"
                  value={newLang.code}
                  onChange={(e) =>
                    setNewLang({ ...newLang, code: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Language Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., French, German, Spanish"
                  value={newLang.name}
                  onChange={(e) =>
                    setNewLang({ ...newLang, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="native_name">Native Name</Label>
                <Input
                  id="native_name"
                  placeholder="e.g., Français, Deutsch, Español"
                  value={newLang.native_name}
                  onChange={(e) =>
                    setNewLang({ ...newLang, native_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLanguage} disabled={saving}>
                {saving ? 'Adding...' : 'Add Language'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {languages.map((lang) => (
          <Card key={lang.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {lang.name} ({lang.code})
                      {lang.is_default && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                      {!lang.is_active && (
                        <Badge variant="outline">Disabled</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{lang.native_name}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${lang.id}`} className="text-sm">
                      Active
                    </Label>
                    <Switch
                      id={`active-${lang.id}`}
                      checked={lang.is_active}
                      onCheckedChange={() => handleToggleActive(lang)}
                      disabled={lang.is_default}
                    />
                  </div>
                  {!lang.is_default && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(lang)}
                      >
                        Set Default
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Language?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {lang.name}? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteLanguage(lang)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="translations">
                  <AccordionTrigger>
                    Edit Translations ({Object.keys(lang.translations).length}{' '}
                    keys)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pt-4">
                      {Object.entries(
                        getTranslationsByCategory(lang.translations)
                      ).map(([category, translations]) => (
                        <div key={category} className="space-y-3">
                          <h4 className="font-semibold text-sm uppercase text-muted-foreground">
                            {translationCategories[
                              category as keyof typeof translationCategories
                            ] || category}
                          </h4>
                          <div className="grid gap-3">
                            {Object.entries(translations).map(([key, value]) => (
                              <div
                                key={key}
                                className="grid grid-cols-3 gap-2 items-center"
                              >
                                <Label className="text-xs font-mono text-muted-foreground">
                                  {key}
                                </Label>
                                <Input
                                  className="col-span-2"
                                  value={value}
                                  onChange={(e) =>
                                    handleTranslationChange(
                                      lang.id,
                                      key,
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <Button
                        onClick={() => handleSaveTranslations(lang)}
                        disabled={saving}
                        className="mt-4"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Translations'}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminLanguages;
