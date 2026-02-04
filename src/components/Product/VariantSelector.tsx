import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Palette, Ruler, Package, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Types for variant system
export interface VariantOption {
  value: string;
  label: string;
  hex?: string;
  imageUrl?: string;
  disabled?: boolean;
  outOfStock?: boolean;
  priceModifier?: number;
}

export interface VariantGroup {
  id: string;
  name: string;
  displayType: 'button' | 'swatch' | 'dropdown' | 'image' | 'size-chart';
  values: VariantOption[];
  required?: boolean;
}

export interface ProductVariant {
  id: string;
  sku?: string;
  name: string;
  price?: number;
  originalPrice?: number;
  stock: number;
  attributes: Record<string, string>;
  imageUrl?: string;
}

interface VariantSelectorProps {
  groups: VariantGroup[];
  variants?: ProductVariant[];
  selectedAttributes: Record<string, string>;
  onAttributeChange: (attribute: string, value: string) => void;
  onVariantSelect?: (variant: ProductVariant | null) => void;
  showStock?: boolean;
  className?: string;
}

// Find matching variant based on selected attributes
const findMatchingVariant = (
  variants: ProductVariant[],
  selectedAttributes: Record<string, string>
): ProductVariant | null => {
  if (!variants.length) return null;
  
  return variants.find(variant => {
    return Object.entries(selectedAttributes).every(
      ([key, value]) => variant.attributes[key] === value
    );
  }) || null;
};

// Check if a specific option is available based on other selections
const isOptionAvailable = (
  variants: ProductVariant[],
  selectedAttributes: Record<string, string>,
  groupName: string,
  optionValue: string
): boolean => {
  if (!variants.length) return true;
  
  const testAttributes = { ...selectedAttributes, [groupName]: optionValue };
  
  // Find any variant that matches
  return variants.some(variant => {
    return Object.entries(testAttributes).every(
      ([key, value]) => !value || variant.attributes[key] === value
    ) && variant.stock > 0;
  });
};

// Color Swatch Component
const ColorSwatch = ({ 
  option, 
  selected, 
  available,
  onClick 
}: { 
  option: VariantOption;
  selected: boolean;
  available: boolean;
  onClick: () => void;
}) => {
  const isHexColor = option.hex?.startsWith('#');
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            type="button"
            onClick={onClick}
            disabled={!available}
            className={cn(
              "relative h-10 w-10 rounded-full border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              selected 
                ? "border-primary ring-2 ring-primary/30" 
                : "border-border/50 hover:border-primary/50",
              !available && "opacity-40 cursor-not-allowed"
            )}
            style={{
              backgroundColor: isHexColor ? option.hex : undefined,
              backgroundImage: option.imageUrl ? `url(${option.imageUrl})` : undefined,
              backgroundSize: 'cover',
            }}
            whileHover={available ? { scale: 1.1 } : {}}
            whileTap={available ? { scale: 0.95 } : {}}
          >
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center",
                    isHexColor && parseInt(option.hex!.slice(1), 16) > 0x888888 
                      ? "bg-black/60" 
                      : "bg-white/60"
                  )}>
                    <Check className="h-3 w-3 text-foreground" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Out of stock line */}
            {!available && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-destructive/80 rotate-45" />
              </div>
            )}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{option.label}</p>
          {!available && <p className="text-destructive text-xs">Out of stock</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Size Button Component
const SizeButton = ({
  option,
  selected,
  available,
  onClick
}: {
  option: VariantOption;
  selected: boolean;
  available: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!available}
      className={cn(
        "relative min-w-[48px] h-11 px-4 rounded-lg border-2 font-medium text-sm transition-all",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border/50 hover:border-primary/50 bg-muted/30",
        !available && "opacity-40 cursor-not-allowed line-through"
      )}
      whileHover={available ? { scale: 1.05 } : {}}
      whileTap={available ? { scale: 0.95 } : {}}
    >
      {option.label}
      {option.priceModifier && option.priceModifier > 0 && (
        <span className="text-xs text-primary ml-1">+{option.priceModifier}</span>
      )}
    </motion.button>
  );
};

// Image Option Component
const ImageOption = ({
  option,
  selected,
  available,
  onClick
}: {
  option: VariantOption;
  selected: boolean;
  available: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!available}
      className={cn(
        "relative h-16 w-16 rounded-lg border-2 overflow-hidden transition-all",
        selected
          ? "border-primary ring-2 ring-primary/30"
          : "border-border/50 hover:border-primary/50",
        !available && "opacity-40 cursor-not-allowed"
      )}
      whileHover={available ? { scale: 1.05 } : {}}
      whileTap={available ? { scale: 0.95 } : {}}
    >
      {option.imageUrl ? (
        <img 
          src={option.imageUrl} 
          alt={option.label} 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center text-xs">
          {option.label}
        </div>
      )}
      
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center"
        >
          <Check className="h-2.5 w-2.5 text-primary-foreground" />
        </motion.div>
      )}
    </motion.button>
  );
};

// Main Variant Selector Component
export const VariantSelector = ({
  groups,
  variants = [],
  selectedAttributes,
  onAttributeChange,
  onVariantSelect,
  showStock = true,
  className
}: VariantSelectorProps) => {
  const [matchedVariant, setMatchedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (variants.length) {
      const matched = findMatchingVariant(variants, selectedAttributes);
      setMatchedVariant(matched);
      onVariantSelect?.(matched);
    }
  }, [selectedAttributes, variants, onVariantSelect]);

  const getGroupIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('color') || lowerName.includes('colour')) {
      return <Palette className="h-4 w-4" />;
    }
    if (lowerName.includes('size')) {
      return <Ruler className="h-4 w-4" />;
    }
    return <Package className="h-4 w-4" />;
  };

  return (
    <div className={cn("space-y-5", className)}>
      {groups.map((group, groupIndex) => (
        <motion.div
          key={group.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIndex * 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getGroupIcon(group.name)}
              <label className="text-sm font-medium">{group.name}</label>
              {group.required && <span className="text-destructive">*</span>}
            </div>
            {selectedAttributes[group.name] && (
              <Badge variant="secondary" className="text-xs">
                {selectedAttributes[group.name]}
              </Badge>
            )}
          </div>

          {/* Swatch Display (for colors) */}
          {group.displayType === 'swatch' && (
            <div className="flex flex-wrap gap-2">
              {group.values.map((option) => {
                const available = isOptionAvailable(variants, selectedAttributes, group.name, option.value);
                return (
                  <ColorSwatch
                    key={option.value}
                    option={option}
                    selected={selectedAttributes[group.name] === option.value}
                    available={available && !option.outOfStock}
                    onClick={() => onAttributeChange(group.name, option.value)}
                  />
                );
              })}
            </div>
          )}

          {/* Button Display (for sizes) */}
          {(group.displayType === 'button' || group.displayType === 'size-chart') && (
            <div className="flex flex-wrap gap-2">
              {group.values.map((option) => {
                const available = isOptionAvailable(variants, selectedAttributes, group.name, option.value);
                return (
                  <SizeButton
                    key={option.value}
                    option={option}
                    selected={selectedAttributes[group.name] === option.value}
                    available={available && !option.outOfStock}
                    onClick={() => onAttributeChange(group.name, option.value)}
                  />
                );
              })}
            </div>
          )}

          {/* Image Display */}
          {group.displayType === 'image' && (
            <div className="flex flex-wrap gap-3">
              {group.values.map((option) => {
                const available = isOptionAvailable(variants, selectedAttributes, group.name, option.value);
                return (
                  <ImageOption
                    key={option.value}
                    option={option}
                    selected={selectedAttributes[group.name] === option.value}
                    available={available && !option.outOfStock}
                    onClick={() => onAttributeChange(group.name, option.value)}
                  />
                );
              })}
            </div>
          )}

          {/* Dropdown Display */}
          {group.displayType === 'dropdown' && (
            <Select
              value={selectedAttributes[group.name] || ''}
              onValueChange={(value) => onAttributeChange(group.name, value)}
            >
              <SelectTrigger className="w-full max-w-xs bg-muted/50">
                <SelectValue placeholder={`Select ${group.name}`} />
              </SelectTrigger>
              <SelectContent>
                {group.values.map((option) => {
                  const available = isOptionAvailable(variants, selectedAttributes, group.name, option.value);
                  return (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      disabled={!available}
                    >
                      <span className={cn(!available && "line-through text-muted-foreground")}>
                        {option.label}
                        {!available && " (Out of stock)"}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </motion.div>
      ))}

      {/* Stock indicator for matched variant */}
      {showStock && matchedVariant && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 text-sm"
        >
          {matchedVariant.stock > 0 ? (
            <>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-600 dark:text-green-400">
                {matchedVariant.stock <= 5 
                  ? `Only ${matchedVariant.stock} left!` 
                  : 'In stock'}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-destructive">Out of stock</span>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default VariantSelector;
