import { useState, useEffect, useMemo, useCallback } from 'react';
import { VariantGroup, ProductVariant, VariantOption } from '@/components/Product/VariantSelector';
import { CustomOption } from '@/components/Product/CustomOptionsSelector';

interface UseProductVariantsOptions {
  productId: string;
  product?: any; // Product data with sizes/colors for fallback
}

interface UseProductVariantsReturn {
  variantGroups: VariantGroup[];
  variants: ProductVariant[];
  customOptions: CustomOption[];
  selectedAttributes: Record<string, string>;
  selectedCustomOptions: Record<string, any>;
  selectedVariant: ProductVariant | null;
  setSelectedAttributes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setSelectedCustomOptions: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  handleAttributeChange: (attribute: string, value: string) => void;
  handleCustomOptionChange: (optionId: string, value: any) => void;
  calculateTotalPrice: (basePrice: number) => number;
  isLoading: boolean;
  error: string | null;
}

// Map common color names to hex values
const getColorHex = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#EF4444',
    'blue': '#3B82F6',
    'green': '#22C55E',
    'yellow': '#EAB308',
    'orange': '#F97316',
    'purple': '#A855F7',
    'pink': '#EC4899',
    'gray': '#6B7280',
    'grey': '#6B7280',
    'brown': '#92400E',
    'navy': '#1E3A5F',
    'beige': '#F5F5DC',
    'cream': '#FFFDD0',
    'gold': '#FFD700',
    'silver': '#C0C0C0',
    'olive': '#808000',
    'maroon': '#800000',
    'teal': '#008080',
    'cyan': '#00FFFF',
    'coral': '#FF7F50',
    'burgundy': '#800020',
    'charcoal': '#36454F',
    'tan': '#D2B48C',
    'khaki': '#C3B091',
  };
  
  return colorMap[colorName.toLowerCase()] || '#888888';
};

// Generate variant groups from product's simple sizes/colors arrays
const generateVariantGroups = (product: any): VariantGroup[] => {
  const groups: VariantGroup[] = [];
  
  if (product?.colors?.length > 0) {
    groups.push({
      id: 'color',
      name: 'Color',
      displayType: 'swatch',
      values: product.colors.map((color: string) => ({
        value: color,
        label: color,
        hex: getColorHex(color),
      })),
      required: true,
    });
  }
  
  if (product?.sizes?.length > 0) {
    groups.push({
      id: 'size',
      name: 'Size',
      displayType: 'button',
      values: product.sizes.map((size: string) => ({
        value: size,
        label: size,
      })),
      required: true,
    });
  }
  
  return groups;
};

// Generate custom options based on product category
const generateCustomOptions = (product: any): CustomOption[] => {
  const category = (product?.category || '').toLowerCase();
  const options: CustomOption[] = [];
  
  // Common option for all products
  options.push({
    id: 'gift_wrap',
    name: 'Gift Wrapping',
    type: 'checkbox',
    options: [{ label: 'Add premium gift wrapping', value: 'yes', price: 150 }],
    description: 'Elegant gift box with ribbon and personalized message card',
  });
  
  // Category-specific options
  if (category.includes('fashion') || category.includes('clothing') || category.includes('apparel')) {
    options.push({
      id: 'monogram',
      name: 'Add Monogram',
      type: 'text',
      placeholder: 'Enter initials (max 3 letters)',
      maxLength: 3,
      priceModifier: 200,
      description: 'Add your initials embroidered on the item',
    });
  }
  
  if (category.includes('electronics') || category.includes('tech') || category.includes('gadget')) {
    options.push({
      id: 'warranty',
      name: 'Extended Warranty',
      type: 'select',
      options: [
        { label: 'No extended warranty', value: 'none', price: 0 },
        { label: '1 Year Extended', value: '1year', price: 500 },
        { label: '2 Years Extended', value: '2year', price: 800 },
      ],
    });
  }
  
  if (category.includes('jewelry') || category.includes('accessory') || category.includes('watch')) {
    options.push({
      id: 'engraving',
      name: 'Engraving Text',
      type: 'text',
      placeholder: 'Enter text to engrave',
      maxLength: 20,
      priceModifier: 300,
      description: 'Personalize with custom engraving',
    });
  }
  
  if (category.includes('food') || category.includes('gift') || category.includes('hamper')) {
    options.push({
      id: 'message',
      name: 'Gift Message',
      type: 'textarea',
      placeholder: 'Write your personal message...',
      maxLength: 200,
      description: 'Include a personalized message with your gift',
    });
  }

  if (category.includes('home') || category.includes('furniture') || category.includes('decor')) {
    options.push({
      id: 'assembly',
      name: 'Assembly Service',
      type: 'checkbox',
      options: [{ label: 'Include professional assembly', value: 'yes', price: 500 }],
      description: 'Our team will assemble the item at your location',
    });
  }
  
  return options;
};

export const useProductVariants = ({ 
  productId, 
  product 
}: UseProductVariantsOptions): UseProductVariantsReturn => {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedCustomOptions, setSelectedCustomOptions] = useState<Record<string, any>>({});

  // Generate variant groups from product data
  const variantGroups = useMemo(() => {
    return generateVariantGroups(product);
  }, [product]);

  // Generate custom options based on category
  const customOptions = useMemo(() => {
    return generateCustomOptions(product);
  }, [product]);

  // Initialize selected attributes with first values
  useEffect(() => {
    if (variantGroups.length > 0) {
      const initial: Record<string, string> = {};
      variantGroups.forEach(group => {
        if (group.values.length > 0 && !selectedAttributes[group.name]) {
          initial[group.name] = group.values[0].value;
        }
      });
      if (Object.keys(initial).length > 0) {
        setSelectedAttributes(prev => ({ ...prev, ...initial }));
      }
    }
  }, [variantGroups]);

  const handleAttributeChange = useCallback((attribute: string, value: string) => {
    setSelectedAttributes(prev => ({ ...prev, [attribute]: value }));
  }, []);

  const handleCustomOptionChange = useCallback((optionId: string, value: any) => {
    setSelectedCustomOptions(prev => ({ ...prev, [optionId]: value }));
  }, []);

  // Calculate total price including custom option modifiers
  const calculateTotalPrice = useCallback((basePrice: number): number => {
    let total = basePrice;
    
    // Add custom option prices
    customOptions.forEach(option => {
      const value = selectedCustomOptions[option.id];
      if (!value) return;
      
      if (option.priceModifier && value) {
        total += option.priceModifier;
      }
      
      if (option.type === 'select' && option.options) {
        const selected = option.options.find(o => o.value === value);
        if (selected?.price) total += selected.price;
      }
      
      if (option.type === 'checkbox' && value === true && option.options?.[0]?.price) {
        total += option.options[0].price;
      }
    });
    
    return total;
  }, [customOptions, selectedCustomOptions]);

  return {
    variantGroups,
    variants: [], // Empty until database tables exist
    customOptions,
    selectedAttributes,
    selectedCustomOptions,
    selectedVariant: null, // No variant matching without database
    setSelectedAttributes,
    setSelectedCustomOptions,
    handleAttributeChange,
    handleCustomOptionChange,
    calculateTotalPrice,
    isLoading: false,
    error: null,
  };
};

export default useProductVariants;
