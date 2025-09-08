"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Calendar, Users, Briefcase, Target, TrendingUp, MapPin, Save, Loader2 } from "lucide-react";

interface PersonalInformationData {
  dateOfBirth: string;
  maritalStatus: string;
  numberOfDependents: string;
  employmentStatus: string;
  annualGrossIncome: string;
  riskTolerance: string;
  country: string;
}

interface PersonalInformationFormProps {
  onSave: (data: PersonalInformationData) => void;
  initialData?: Partial<PersonalInformationData>;
  saving?: boolean;
}

export default function PersonalInformationForm({ onSave, initialData, saving = false }: PersonalInformationFormProps) {
  const [formData, setFormData] = useState<PersonalInformationData>({
    dateOfBirth: initialData?.dateOfBirth || "",
    maritalStatus: initialData?.maritalStatus || "",
    numberOfDependents: initialData?.numberOfDependents || "0",
    employmentStatus: initialData?.employmentStatus || "",
    annualGrossIncome: initialData?.annualGrossIncome || "",
    riskTolerance: initialData?.riskTolerance || "",
    country: initialData?.country || "UK",
  });

  const [errors, setErrors] = useState<Partial<PersonalInformationData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<PersonalInformationData> = {};

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18 || age > 100) {
        newErrors.dateOfBirth = "Please enter a valid date of birth";
      }
    }

    if (!formData.maritalStatus) {
      newErrors.maritalStatus = "Marital status is required";
    }

    if (!formData.employmentStatus) {
      newErrors.employmentStatus = "Employment status is required";
    }

    if (!formData.annualGrossIncome || isNaN(Number(formData.annualGrossIncome)) || Number(formData.annualGrossIncome) <= 0) {
      newErrors.annualGrossIncome = "Please enter a valid annual income";
    }


    if (!formData.riskTolerance) {
      newErrors.riskTolerance = "Risk tolerance is required";
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

  const handleInputChange = (field: keyof PersonalInformationData, value: string) => {
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
          <Users className="h-5 w-5" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Tell us about yourself to get personalized retirement projections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" onClick={(e) => e.stopPropagation()}>
          {/* Date of Birth */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="Your age is crucial for calculating how many years you have to save for retirement and determining your investment timeline. Younger investors can take more risk, while those closer to retirement need more conservative strategies."
              icon={Calendar}
            >
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            </TooltipField>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              className={errors.dateOfBirth ? "border-red-500" : ""}
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* Marital Status */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="Marital status affects tax planning, pension contributions, and estate planning. Married couples often have different tax allowances and can benefit from joint financial planning strategies."
              icon={Users}
            >
              <Label htmlFor="maritalStatus">Marital Status *</Label>
            </TooltipField>
            <Select value={formData.maritalStatus} onValueChange={(value) => handleInputChange("maritalStatus", value)}>
              <SelectTrigger className={errors.maritalStatus ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
                <SelectItem value="civil-partnership">Civil Partnership</SelectItem>
              </SelectContent>
            </Select>
            {errors.maritalStatus && (
              <p className="text-sm text-red-500">{errors.maritalStatus}</p>
            )}
          </div>

          {/* Number of Dependents */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="Dependents affect your financial planning by increasing living expenses and potentially reducing your ability to save. This helps us calculate realistic retirement income needs and current financial obligations."
              icon={Users}
            >
              <Label htmlFor="numberOfDependents">Number of Dependents *</Label>
            </TooltipField>
            <Select value={formData.numberOfDependents} onValueChange={(value) => handleInputChange("numberOfDependents", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select number of dependents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5+">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employment Status */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="Your employment status determines your income stability, pension contributions, and available benefits. This affects how we calculate your retirement savings potential and investment strategy."
              icon={Briefcase}
            >
              <Label htmlFor="employmentStatus">Employment Status *</Label>
            </TooltipField>
            <Select value={formData.employmentStatus} onValueChange={(value) => handleInputChange("employmentStatus", value)}>
              <SelectTrigger className={errors.employmentStatus ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your employment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employed">Employed</SelectItem>
                <SelectItem value="self-employed">Self-Employed</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="unemployed">Unemployed</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="part-time">Part-Time</SelectItem>
              </SelectContent>
            </Select>
            {errors.employmentStatus && (
              <p className="text-sm text-red-500">{errors.employmentStatus}</p>
            )}
          </div>

          {/* Annual Gross Income */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="Your annual income is the foundation for calculating how much you can save for retirement. We use this to determine your savings rate, tax implications, and realistic retirement income goals."
              icon={TrendingUp}
            >
              <Label htmlFor="annualGrossIncome">Annual Gross Income (£) *</Label>
            </TooltipField>
            <Input
              id="annualGrossIncome"
              type="number"
              placeholder="e.g., 50000"
              value={formData.annualGrossIncome}
              onChange={(e) => handleInputChange("annualGrossIncome", e.target.value)}
              className={errors.annualGrossIncome ? "border-red-500" : ""}
            />
            {errors.annualGrossIncome && (
              <p className="text-sm text-red-500">{errors.annualGrossIncome}</p>
            )}
          </div>


          {/* Risk Tolerance */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="Your risk tolerance determines your investment strategy. Conservative investors prefer stable, lower-return investments. Aggressive investors can handle market volatility for potentially higher returns. This affects your portfolio allocation."
              icon={TrendingUp}
            >
              <Label htmlFor="riskTolerance">Risk Tolerance *</Label>
            </TooltipField>
            <Select value={formData.riskTolerance} onValueChange={(value) => handleInputChange("riskTolerance", value)}>
              <SelectTrigger className={errors.riskTolerance ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your risk tolerance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative - Stable, lower risk</SelectItem>
                <SelectItem value="moderate">Moderate - Balanced approach</SelectItem>
                <SelectItem value="aggressive">Aggressive - Higher risk, higher potential returns</SelectItem>
              </SelectContent>
            </Select>
            {errors.riskTolerance && (
              <p className="text-sm text-red-500">{errors.riskTolerance}</p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-2">
            <TooltipField 
              tooltip="Your country determines the tax rules, retirement systems, and investment options available to you. This ensures our calculations use the correct regulations and allowances for your location."
              icon={MapPin}
            >
              <Label htmlFor="country">Country *</Label>
            </TooltipField>
            <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button type="submit" className="w-full" size="lg" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Personal Information
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
