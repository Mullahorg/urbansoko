import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Database, Copy, Check, AlertTriangle, FileText, Shield } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

const AdminDatabaseExport = () => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exportedSql, setExportedSql] = useState('');
  const [importSql, setImportSql] = useState('');
  const [copied, setCopied] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [importResult, setImportResult] = useState<any>(null);
  const { toast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('export-database', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const sqlContent = response.data.sql;
      setExportedSql(sqlContent);

      // Download file
      const blob = new Blob([sqlContent], { type: 'text/sql' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-export-${new Date().toISOString().split('T')[0]}.sql`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: 'Database exported and downloaded',
      });
    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportedSql);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'SQL data copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
    if (!importSql.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste SQL data first',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('import-database', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { sql: importSql, dryRun },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setImportResult(response.data);

      toast({
        title: dryRun ? 'Validation Complete' : 'Import Complete',
        description: response.data.message,
      });
    } catch (error: any) {
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setImportSql(text);
      toast({
        title: 'File loaded',
        description: `Loaded ${file.name}`,
      });
    } catch (error: any) {
      toast({
        title: 'File load failed',
        description: error.message,
        variant: 'destructive',
      });
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold">Database Management</h2>
        <p className="text-muted-foreground text-sm md:text-base">Export and import database data</p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Security Notice</AlertTitle>
        <AlertDescription className="text-xs md:text-sm">
          User roles and authentication data are excluded from exports for security.
          Imports are restricted to safe tables only.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export" className="text-xs md:text-sm">
            <Download className="h-4 w-4 mr-1 md:mr-2" />
            Export
          </TabsTrigger>
          <TabsTrigger value="import" className="text-xs md:text-sm">
            <Upload className="h-4 w-4 mr-1 md:mr-2" />
            Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Database className="h-5 w-5" />
                Export Database
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Download all data as SQL INSERT statements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleExport} 
                disabled={exporting}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {exporting ? 'Exporting...' : 'Export & Download SQL'}
              </Button>

              {exportedSql && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Label className="text-sm">Exported SQL</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyToClipboard}
                      className="gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span className="hidden sm:inline">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span className="hidden sm:inline">Copy to Clipboard</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={exportedSql}
                    readOnly
                    rows={12}
                    className="font-mono text-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4 mt-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription className="text-xs md:text-sm">
              Importing data can modify your database. Always test with "Dry Run" first.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Upload className="h-5 w-5" />
                Import Database
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Upload or paste SQL to import data (INSERT statements only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sql-file" className="text-sm">Upload SQL File</Label>
                <input
                  id="sql-file"
                  type="file"
                  accept=".sql,.txt"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 mt-2"
                />
              </div>

              <div>
                <Label htmlFor="sql-paste" className="text-sm">Or Paste SQL</Label>
                <Textarea
                  id="sql-paste"
                  placeholder="Paste your SQL INSERT statements here..."
                  value={importSql}
                  onChange={(e) => setImportSql(e.target.value)}
                  rows={10}
                  className="font-mono text-xs mt-2"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="dry-run" className="text-sm font-medium">Dry Run Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Validate without making changes
                  </p>
                </div>
                <Switch
                  id="dry-run"
                  checked={dryRun}
                  onCheckedChange={setDryRun}
                />
              </div>

              <Button 
                onClick={handleImport}
                disabled={importing || !importSql.trim()}
                className="w-full"
                variant={dryRun ? "outline" : "default"}
              >
                <FileText className="mr-2 h-4 w-4" />
                {importing ? 'Processing...' : dryRun ? 'Validate SQL' : 'Execute Import'}
              </Button>

              {importResult && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-sm mb-2">
                      {importResult.dryRun ? 'Validation Result' : 'Import Result'}
                    </h4>
                    <div className="space-y-2 text-xs">
                      <p><strong>Status:</strong> {importResult.message}</p>
                      <p><strong>Statements Found:</strong> {importResult.statementsFound || 0}</p>
                      {importResult.successCount !== undefined && (
                        <p><strong>Successful:</strong> {importResult.successCount}</p>
                      )}
                      {importResult.errorCount !== undefined && importResult.errorCount > 0 && (
                        <p className="text-destructive"><strong>Errors:</strong> {importResult.errorCount}</p>
                      )}
                      {importResult.allowedTables && (
                        <div>
                          <strong>Allowed Tables:</strong>
                          <p className="text-muted-foreground break-words">
                            {importResult.allowedTables.join(', ')}
                          </p>
                        </div>
                      )}
                      {importResult.preview && importResult.preview.length > 0 && (
                        <div>
                          <strong>Preview (first 10):</strong>
                          <pre className="mt-1 p-2 bg-background rounded text-xs overflow-x-auto max-h-40">
                            {importResult.preview.join('\n')}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDatabaseExport;
