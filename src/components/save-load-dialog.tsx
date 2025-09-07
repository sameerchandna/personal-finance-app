"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Save, 
  Download, 
  Trash2, 
  Calendar,
  DollarSign,
  TrendingUp,
  Home,
  X
} from 'lucide-react';

interface SavedCalculation {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface SaveLoadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  savedCalculations: SavedCalculation[];
  onSave: (name: string) => Promise<void>;
  onLoad: (calculation: SavedCalculation) => void;
  onDelete: (id: string) => Promise<void>;
  type: 'investment' | 'mortgage';
  loading?: boolean;
}

export function SaveLoadDialog({
  isOpen,
  onClose,
  savedCalculations,
  onSave,
  onLoad,
  onDelete,
  type,
  loading = false
}: SaveLoadDialogProps) {
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave(saveName.trim());
      setSaveName('');
    } catch (error) {
      console.error('Error saving calculation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Error deleting calculation:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              {type === 'investment' ? (
                <>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Investment Calculator
                </>
              ) : (
                <>
                  <Home className="h-5 w-5 text-blue-600" />
                  Mortgage Calculator
                </>
              )}
              <span className="text-sm font-normal text-gray-500">Save & Load</span>
            </CardTitle>
            <CardDescription>
              Save your calculations and load them later
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Save Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4 text-green-600" />
              <h3 className="font-semibold">Save Current Calculation</h3>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="save-name" className="sr-only">
                  Calculation Name
                </Label>
                <Input
                  id="save-name"
                  placeholder="Enter a name for this calculation..."
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
              <Button 
                onClick={handleSave} 
                disabled={!saveName.trim() || isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Load Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold">Load Saved Calculation</h3>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading calculations...</p>
              </div>
            ) : savedCalculations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No saved calculations yet</p>
                <p className="text-sm">Save your first calculation above</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedCalculations.map((calculation) => (
                  <div
                    key={calculation.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{calculation.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(calculation.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLoad(calculation)}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Load
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(calculation.id)}
                        disabled={deletingId === calculation.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingId === calculation.id ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
