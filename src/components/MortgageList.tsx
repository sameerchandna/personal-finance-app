"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  Calculator,
  TrendingUp,
  Calendar,
  DollarSign
} from "lucide-react";
import MortgageForm from "./MortgageForm";

interface MortgageData {
  id: string;
  name: string;
  propertyType: string;
  propertyValue: string;
  mortgageAmount: string;
  interestRate: string;
  termYears: string;
  paymentType: string;
  extraPayment: string;
  startDate: string;
  fixedRateEndDate: string;
  variableRate: string;
  variableRateEnabled: boolean;
}

interface MortgageListProps {
  mortgages: MortgageData[];
  onSave: (data: MortgageData) => void;
  onEdit: (data: MortgageData) => void;
  onDelete: (id: string) => void;
  maxMortgages?: number;
}

export default function MortgageList({ 
  mortgages, 
  onSave, 
  onEdit, 
  onDelete, 
  maxMortgages = 5 
}: MortgageListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingMortgage, setEditingMortgage] = useState<MortgageData | null>(null);

  const handleAddNew = () => {
    setEditingMortgage(null);
    setShowForm(true);
  };

  const handleEdit = (mortgage: MortgageData) => {
    setEditingMortgage(mortgage);
    setShowForm(true);
  };

  const handleSave = (data: MortgageData) => {
    if (editingMortgage) {
      onEdit({ ...data, id: editingMortgage.id });
    } else {
      onSave({ ...data, id: Date.now().toString() });
    }
    setShowForm(false);
    setEditingMortgage(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMortgage(null);
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case 'primary': return 'bg-blue-100 text-blue-800';
      case 'holiday': return 'bg-green-100 text-green-800';
      case 'buy-to-let': return 'bg-purple-100 text-purple-800';
      case 'commercial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'primary': return 'Primary Residence';
      case 'holiday': return 'Holiday Home';
      case 'buy-to-let': return 'Buy-to-Let';
      case 'commercial': return 'Commercial';
      default: return 'Other';
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const calculateEquity = (propertyValue: string, mortgageAmount: string) => {
    const equity = Number(propertyValue) - Number(mortgageAmount);
    return formatCurrency(equity.toString());
  };

  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            {editingMortgage ? 'Edit Mortgage' : 'Add New Mortgage'}
          </CardTitle>
          <CardDescription>
            {editingMortgage ? 'Update your mortgage information' : 'Add a new mortgage to your portfolio'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MortgageForm 
            onSave={handleSave}
            initialData={editingMortgage || undefined}
          />
          <div className="mt-4">
            <Button variant="outline" onClick={handleCancel} className="w-full">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Your Mortgages</h3>
          <p className="text-sm text-gray-600">
            {mortgages.length} of {maxMortgages} mortgages added
          </p>
        </div>
        {mortgages.length < maxMortgages && (
          <Button onClick={handleAddNew} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Mortgage
          </Button>
        )}
      </div>

      {/* Mortgages List */}
      {mortgages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-2">
            <Home className="h-6 w-6 mx-auto mb-2 text-gray-300" />
            <h3 className="text-sm font-medium mb-1">No Mortgages Added</h3>
            <p className="text-xs text-gray-600 mb-2">
              Add your mortgage information to get personalized insights.
            </p>
            <Button onClick={handleAddNew} size="sm" className="h-8 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add Your First Mortgage
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {mortgages.map((mortgage) => (
            <Card key={mortgage.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {/* Top row: Name and Property Type */}
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-base">{mortgage.name}</h4>
                      <Badge className={`${getPropertyTypeColor(mortgage.propertyType)} text-xs px-2 py-1`}>
                        {getPropertyTypeLabel(mortgage.propertyType)}
                      </Badge>
                    </div>
                    
                    {/* Bottom row: Key metrics in one line */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium text-gray-900">{formatCurrency(mortgage.propertyValue)}</span>
                      <span>|</span>
                      <span className="font-medium text-gray-900">{formatCurrency(mortgage.mortgageAmount)}</span>
                      <span>|</span>
                      <span className="font-medium text-gray-900">{mortgage.interestRate}%</span>
                      <span>|</span>
                      <span className="font-medium text-gray-900">{mortgage.termYears}y</span>
                      <span>|</span>
                      <span className="text-green-600 font-medium">
                        {calculateEquity(mortgage.propertyValue, mortgage.mortgageAmount)} equity
                      </span>
                      <span>|</span>
                      <span className="capitalize">{mortgage.paymentType}</span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-1 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(mortgage)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(mortgage.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {mortgages.length < maxMortgages && (
            <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
              <CardContent className="text-center py-3">
                <Button variant="ghost" onClick={handleAddNew} className="w-full h-10">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Mortgage
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
