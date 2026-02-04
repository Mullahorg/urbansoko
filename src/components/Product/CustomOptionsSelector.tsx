import { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, ListChecks, ToggleLeft, Hash, Gift, Palette, PenTool, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatPrice } from '@/utils/currency';

export interface CustomOption {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'color' | 'date';
  options?: { label: string; value: string; price?: number }[];
  required?: boolean;
  priceModifier?: number;
  maxLength?: number;
  placeholder?: string;
  description?: string;
  min?: number;
  max?: number;
}

interface CustomOptionsSelectorProps {
  options: CustomOption[];
  selectedOptions: Record<string, any>;
  onOptionChange: (optionId: string, value: any) => void;
  className?: string;
}

// Calculate additional price from custom options
export const calculateCustomOptionsPrice = (
  options: CustomOption[],
  selectedOptions: Record<string, any>
): number => {
  return options.reduce((total, option) => {
    const value = selectedOptions[option.id];
    
    if (!value) return total;
    
    // Add base price modifier
    if (option.priceModifier) {
      total += option.priceModifier;
    }
    
    // For select type, check if selected option has price
    if (option.type === 'select' && option.options) {
      const selectedOpt = option.options.find(o => o.value === value);
      if (selectedOpt?.price) {
        total += selectedOpt.price;
      }
    }
    
    // For checkbox with options (like gift wrap)
    if (option.type === 'checkbox' && value === true && option.options?.[0]?.price) {
      total += option.options[0].price;
    }
    
    return total;
  }, 0);
};

// Validate required options
export const validateCustomOptions = (
  options: CustomOption[],
  selectedOptions: Record<string, any>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  options.forEach(option => {
    if (option.required) {
      const value = selectedOptions[option.id];
      if (value === undefined || value === '' || value === null) {
        errors.push(`${option.name} is required`);
      }
    }
  });
  
  return { valid: errors.length === 0, errors };
};

const getOptionIcon = (type: string) => {
  switch (type) {
    case 'text': return <Type className="h-4 w-4" />;
    case 'textarea': return <PenTool className="h-4 w-4" />;
    case 'select': return <ListChecks className="h-4 w-4" />;
    case 'checkbox': return <ToggleLeft className="h-4 w-4" />;
    case 'number': return <Hash className="h-4 w-4" />;
    case 'color': return <Palette className="h-4 w-4" />;
    default: return <Gift className="h-4 w-4" />;
  }
};

export const CustomOptionsSelector = ({
  options,
  selectedOptions,
  onOptionChange,
  className
}: CustomOptionsSelectorProps) => {
  if (!options.length) return null;

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Gift className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Customize Your Order</span>
      </div>

      {options.map((option, index) => (
        <motion.div
          key={option.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getOptionIcon(option.type)}
              <Label htmlFor={option.id} className="text-sm font-medium">
                {option.name}
                {option.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {option.description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">{option.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {option.priceModifier && option.priceModifier > 0 && (
              <Badge variant="secondary" className="text-xs">
                +{formatPrice(option.priceModifier)}
              </Badge>
            )}
          </div>

          {/* Text Input */}
          {option.type === 'text' && (
            <Input
              id={option.id}
              value={selectedOptions[option.id] || ''}
              onChange={(e) => onOptionChange(option.id, e.target.value)}
              placeholder={option.placeholder || `Enter ${option.name.toLowerCase()}`}
              maxLength={option.maxLength}
              className="bg-muted/50"
            />
          )}

          {/* Textarea */}
          {option.type === 'textarea' && (
            <Textarea
              id={option.id}
              value={selectedOptions[option.id] || ''}
              onChange={(e) => onOptionChange(option.id, e.target.value)}
              placeholder={option.placeholder || `Enter ${option.name.toLowerCase()}`}
              maxLength={option.maxLength}
              className="bg-muted/50 min-h-[80px]"
            />
          )}

          {/* Number Input */}
          {option.type === 'number' && (
            <Input
              id={option.id}
              type="number"
              value={selectedOptions[option.id] || ''}
              onChange={(e) => onOptionChange(option.id, parseInt(e.target.value) || '')}
              placeholder={option.placeholder}
              min={option.min}
              max={option.max}
              className="bg-muted/50 w-32"
            />
          )}

          {/* Select */}
          {option.type === 'select' && option.options && (
            <Select
              value={selectedOptions[option.id] || ''}
              onValueChange={(value) => onOptionChange(option.id, value)}
            >
              <SelectTrigger className="w-full max-w-xs bg-muted/50">
                <SelectValue placeholder={option.placeholder || `Select ${option.name}`} />
              </SelectTrigger>
              <SelectContent>
                {option.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center justify-between gap-4">
                      {opt.label}
                      {opt.price && opt.price > 0 && (
                        <span className="text-xs text-primary">+{formatPrice(opt.price)}</span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Checkbox */}
          {option.type === 'checkbox' && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30">
              <Checkbox
                id={option.id}
                checked={selectedOptions[option.id] || false}
                onCheckedChange={(checked) => onOptionChange(option.id, checked)}
              />
              <div className="flex-1">
                <Label htmlFor={option.id} className="cursor-pointer">
                  {option.options?.[0]?.label || option.name}
                </Label>
                {option.options?.[0]?.price && option.options[0].price > 0 && (
                  <span className="ml-2 text-xs text-primary">
                    +{formatPrice(option.options[0].price)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Color Picker */}
          {option.type === 'color' && (
            <div className="flex items-center gap-3">
              <input
                type="color"
                id={option.id}
                value={selectedOptions[option.id] || '#000000'}
                onChange={(e) => onOptionChange(option.id, e.target.value)}
                className="h-10 w-14 rounded-lg border border-border cursor-pointer"
              />
              <Input
                value={selectedOptions[option.id] || ''}
                onChange={(e) => onOptionChange(option.id, e.target.value)}
                placeholder="#000000"
                className="w-28 bg-muted/50 font-mono text-sm"
              />
            </div>
          )}

          {/* Date */}
          {option.type === 'date' && (
            <Input
              id={option.id}
              type="date"
              value={selectedOptions[option.id] || ''}
              onChange={(e) => onOptionChange(option.id, e.target.value)}
              className="bg-muted/50 w-48"
            />
          )}

          {/* Character count for text inputs */}
          {(option.type === 'text' || option.type === 'textarea') && option.maxLength && (
            <p className="text-xs text-muted-foreground">
              {(selectedOptions[option.id]?.length || 0)} / {option.maxLength} characters
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default CustomOptionsSelector;
