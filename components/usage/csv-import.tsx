'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, Download, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function CSVImport() {
  const [file, setFile] = useState<File | null>(null);
  const [provider, setProvider] = useState<string>('');
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [dryRun, setDryRun] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file || !provider) {
      setError('Please select a file and provider');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('provider', provider);
      formData.append('skipDuplicates', skipDuplicates.toString());
      formData.append('dryRun', dryRun.toString());

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/usage/import', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = async (selectedProvider: string) => {
    try {
      const response = await fetch(`/api/usage/import?provider=${selectedProvider}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedProvider}-template.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download template:', error);
    }
  };

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import Usage Data from CSV
        </CardTitle>
        <CardDescription>
          Upload historical usage data exported from your AI provider dashboards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger id="provider">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="claude">Claude/Anthropic</SelectItem>
              <SelectItem value="gemini">Google Gemini</SelectItem>
              <SelectItem value="grok">X.AI Grok</SelectItem>
              <SelectItem value="generic">Generic Format</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Download Template */}
        {provider && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadTemplate(provider)}
              className="bg-gray-800 border-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
            <span className="text-sm text-muted-foreground">
              Use this template to format your data correctly
            </span>
          </div>
        )}

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file">CSV File</Label>
          <div className="flex items-center gap-4">
            <input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('file')?.click()}
              className="bg-gray-800 border-gray-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              {file ? file.name : 'Choose File'}
            </Button>
            {file && (
              <span className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </span>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="skipDuplicates"
              checked={skipDuplicates}
              onCheckedChange={(checked) => setSkipDuplicates(checked as boolean)}
            />
            <Label htmlFor="skipDuplicates" className="text-sm">
              Skip duplicate records
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dryRun"
              checked={dryRun}
              onCheckedChange={(checked) => setDryRun(checked as boolean)}
            />
            <Label htmlFor="dryRun" className="text-sm">
              Dry run (preview without importing)
            </Label>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              Processing CSV file...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="border-red-900/50 bg-red-950/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-400">Import Error</AlertTitle>
            <AlertDescription className="text-gray-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Result */}
        {result && result.success && (
          <Alert className="border-green-900/50 bg-green-950/30">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertTitle className="text-green-400">Import Successful</AlertTitle>
            <AlertDescription className="text-gray-400">
              <div className="space-y-2 mt-2">
                <p>{result.message}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Processed: {result.details.processed}</div>
                  <div>Imported: {result.details.imported}</div>
                  <div>Skipped: {result.details.skipped}</div>
                  <div>Errors: {result.details.errors.length}</div>
                </div>
                {result.summary && (
                  <div className="mt-2 p-2 bg-gray-800 rounded">
                    <p className="font-medium">Summary:</p>
                    <p>Total Cost: ${result.summary.totalCost.toFixed(2)}</p>
                    <p>Total Tokens: {result.summary.totalTokens.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Info Alert */}
        <Alert className="border-blue-900/50 bg-blue-950/30">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertTitle className="text-blue-400">How to Export Data</AlertTitle>
          <AlertDescription className="text-gray-400">
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>OpenAI:</strong> Dashboard → Usage → Export</li>
              <li><strong>Claude:</strong> Console → Usage → Download CSV</li>
              <li><strong>Gemini:</strong> Cloud Console → Billing → Reports</li>
              <li><strong>Grok:</strong> Dashboard → Usage section</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Import Button */}
        <Button
          onClick={handleImport}
          disabled={!file || !provider || isUploading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          {dryRun ? 'Preview Import' : 'Import Data'}
        </Button>
      </CardContent>
    </Card>
  );
}