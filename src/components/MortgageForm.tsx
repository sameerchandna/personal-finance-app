"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Home, Calculator, TrendingUp, Calendar, DollarSign, Save, ExternalLink } from "lucide-react";
import Link from "next/link";

interface MortgageData {
  id?: string; // For editing existing mortgages
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

interface MortgageFormProps {
  onSave: (data: MortgageData) => void;
  initialData?: Partial<MortgageData>;
}

export default function MortgageForm({ onSave, initialData }: MortgageFormProps) {
  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper function to get date 5 years from today
  const getFixedRateEndDate = () => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setFullYear(today.getFullYear() + 5);
    return endDate.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<MortgageData>({
    id: initialData?.id || undefined,
    name: initialData?.name || "",
    propertyType: initialData?.propertyType || "primary",
    propertyValue: initialData?.propertyValue || "",
    mortgageAmount: initialData?.mortgageAmount || "",
    interestRate: initialData?.interestRate || "",
    termYears: initialData?.termYears || "25",
    paymentType: initialData?.paymentType || "repayment",
    extraPayment: initialData?.extraPayment || "0",
    startDate: initialData?.startDate || getTodayString(),
    fixedRateEndDate: initialData?.fixedRateEndDate || getFixedRateEndDate(),
    variableRate: initialData?.variableRate || "8.0",
    variableRateEnabled: initialData?.variableRateEnabled || false,
  });

  const [errors, setErrors] = useState<Partial<MortgageData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<MortgageData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter a name for this mortgage";
    }

    if (!formData.propertyValue || isNaN(Number(formData.propertyValue)) || Number(formData.propertyValue) <= 0) {
      newErrors.propertyValue = "Please enter a valid property value";
    }

    if (!formData.mortgageAmount || isNaN(Number(formData.mortgageAmount)) || Number(formData.mortgageAmount) <= 0) {
      newErrors.mortgageAmount = "Please enter a valid mortgage amount";
    }

    if (!formData.interestRate || isNaN(Number(formData.interestRate)) || Number(formData.interestRate) <= 0) {
      newErrors.interestRate = "Please enter a valid interest rate";
    }

    if (formData.extraPayment && (isNaN(Number(formData.extraPayment)) || Number(formData.extraPayment) < 0)) {
      newErrors.extraPayment = "Please enter a valid extra payment amount";
    }

    if (formData.variableRateEnabled && (!formData.variableRate || isNaN(Number(formData.variableRate)) || Number(formData.variableRate) <= 0)) {
      newErrors.variableRate = "Please enter a valid variable rate";
    }

    // Validate that mortgage amount is not greater than property value
    if (Number(formData.mortgageAmount) > Number(formData.propertyValue)) {
      newErrors.mortgageAmount = "Mortgage amount cannot be greater than property value";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof MortgageData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const TooltipField = ({ 
    children, 
    tooltip, 
    icon: Icon 
  }: { 
    children: React.ReactNode; 
    tooltip: string; 
    icon: React.ComponentType<any>;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            {children}
            <Icon className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Mortgage Details
        </CardTitle>
        <CardDescription>
          Enter your mortgage information for retirement planning calculations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" onClick={(e) => e.stopPropagation()}>
          {/* Mortgage Name */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="Give this mortgage a name to help you identify it (e.g., 'Primary Home', 'Holiday Home', 'Buy-to-Let Property')."
              icon={Home}
            >
              <Label htmlFor="name">Mortgage Name *</Label>
            </TooltipField>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Primary Home"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="Select the type of property this mortgage is for. This helps with retirement planning and tax considerations."
              icon={Home}
            >
              <Label htmlFor="propertyType">Property Type *</Label>
            </TooltipField>
            <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary Residence</SelectItem>
                <SelectItem value="holiday">Holiday Home</SelectItem>
                <SelectItem value="buy-to-let">Buy-to-Let Property</SelectItem>
                <SelectItem value="commercial">Commercial Property</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Value */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="The current market value of your property. This helps calculate your equity and overall net worth for retirement planning."
              icon={DollarSign}
            >
              <Label htmlFor="propertyValue">Property Value (£) *</Label>
            </TooltipField>
            <Input
              id="propertyValue"
              type="number"
              placeholder="e.g., 500000"
              value={formData.propertyValue}
              onChange={(e) => handleInputChange("propertyValue", e.target.value)}
              className={errors.propertyValue ? "border-red-500" : ""}
            />
            {errors.propertyValue && (
              <p className="text-sm text-red-500">{errors.propertyValue}</p>
            )}
          </div>

          {/* Mortgage Amount */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="The outstanding balance on your mortgage. This is used to calculate your equity and remaining debt for retirement planning."
              icon={Calculator}
            >
              <Label htmlFor="mortgageAmount">Outstanding Mortgage Amount (£) *</Label>
            </TooltipField>
            <Input
              id="mortgageAmount"
              type="number"
              placeholder="e.g., 300000"
              value={formData.mortgageAmount}
              onChange={(e) => handleInputChange("mortgageAmount", e.target.value)}
              className={errors.mortgageAmount ? "border-red-500" : ""}
            />
            {errors.mortgageAmount && (
              <p className="text-sm text-red-500">{errors.mortgageAmount}</p>
            )}
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="Your current fixed mortgage interest rate. This is the rate that applies during your fixed rate period. If you have a variable rate after the fixed period, you can specify that separately below."
              icon={TrendingUp}
            >
              <Label htmlFor="interestRate">Fixed Interest Rate (%) *</Label>
            </TooltipField>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              placeholder="e.g., 3.5"
              value={formData.interestRate}
              onChange={(e) => handleInputChange("interestRate", e.target.value)}
              className={errors.interestRate ? "border-red-500" : ""}
            />
            {errors.interestRate && (
              <p className="text-sm text-red-500">{errors.interestRate}</p>
            )}
          </div>

          {/* Term Years */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="The number of years remaining on your mortgage term. This helps calculate when you'll be mortgage-free in retirement."
              icon={Calendar}
            >
              <Label htmlFor="termYears">Years Remaining *</Label>
            </TooltipField>
            <Select value={formData.termYears} onValueChange={(value) => handleInputChange("termYears", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select years remaining" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 years</SelectItem>
                <SelectItem value="10">10 years</SelectItem>
                <SelectItem value="15">15 years</SelectItem>
                <SelectItem value="20">20 years</SelectItem>
                <SelectItem value="25">25 years</SelectItem>
                <SelectItem value="30">30 years</SelectItem>
                <SelectItem value="35">35 years</SelectItem>
                <SelectItem value="40">40 years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Extra Payment */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="Additional monthly payment above your regular mortgage payment. This helps pay down your mortgage faster and reduces total interest paid."
              icon={DollarSign}
            >
              <Label htmlFor="extraPayment">Extra Monthly Payment (£)</Label>
            </TooltipField>
            <Input
              id="extraPayment"
              type="number"
              placeholder="e.g., 200"
              value={formData.extraPayment}
              onChange={(e) => handleInputChange("extraPayment", e.target.value)}
              className={errors.extraPayment ? "border-red-500" : ""}
            />
            {errors.extraPayment && (
              <p className="text-sm text-red-500">{errors.extraPayment}</p>
            )}
          </div>

          {/* Payment Type */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="Repayment mortgages pay off both interest and principal, while interest-only mortgages only pay interest. This affects your equity building and retirement planning."
              icon={Calculator}
            >
              <Label htmlFor="paymentType">Payment Type *</Label>
            </TooltipField>
            <Select value={formData.paymentType} onValueChange={(value) => handleInputChange("paymentType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="repayment">Repayment</SelectItem>
                <SelectItem value="interest-only">Interest Only</SelectItem>
              </SelectContent>
            </Select>
          </div>


          {/* Start Date */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="When your current mortgage started. This helps calculate how long you've been paying and your remaining term."
              icon={Calendar}
            >
              <Label htmlFor="startDate">Mortgage Start Date *</Label>
            </TooltipField>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
            />
          </div>

          {/* Fixed Rate End Date */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="When your fixed rate period ends. After this date, your rate may change to variable if applicable."
              icon={Calendar}
            >
              <Label htmlFor="fixedRateEndDate">Fixed Rate End Date</Label>
            </TooltipField>
            <Input
              id="fixedRateEndDate"
              type="date"
              value={formData.fixedRateEndDate}
              onChange={(e) => handleInputChange("fixedRateEndDate", e.target.value)}
            />
          </div>

          {/* Variable Rate Enabled */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="Enable this if your mortgage will switch to a variable rate after the fixed period ends."
              icon={TrendingUp}
            >
              <Label htmlFor="variableRateEnabled">Variable Rate After Fixed Period</Label>
            </TooltipField>
            <div className="flex items-center space-x-2">
              <Switch
                id="variableRateEnabled"
                checked={formData.variableRateEnabled}
                onCheckedChange={(checked) => handleInputChange("variableRateEnabled", checked.toString())}
              />
              <Label htmlFor="variableRateEnabled" className="text-sm">
                {formData.variableRateEnabled ? "Yes" : "No"}
              </Label>
            </div>
          </div>

          {/* Variable Rate */}
          {formData.variableRateEnabled && (
            <div className="space-y-2">
              <TooltipField 
                tooltip="The variable interest rate that will apply after your fixed rate period ends."
                icon={TrendingUp}
              >
                <Label htmlFor="variableRate">Variable Rate (%) *</Label>
              </TooltipField>
              <Input
                id="variableRate"
                type="number"
                step="0.01"
                placeholder="e.g., 8.0"
                value={formData.variableRate}
                onChange={(e) => handleInputChange("variableRate", e.target.value)}
                className={errors.variableRate ? "border-red-500" : ""}
              />
              {errors.variableRate && (
                <p className="text-sm text-red-500">{errors.variableRate}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 space-y-4">
            <Button type="submit" className="w-full" size="lg">
              <Save className="h-4 w-4 mr-2" />
              Save Mortgage Information
            </Button>
            
            {/* Link to detailed mortgage calculator */}
            <div className="text-center">
              <Button variant="outline" asChild className="w-full">
                <Link href="/mortgage">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Use Detailed Mortgage Calculator
                </Link>
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
