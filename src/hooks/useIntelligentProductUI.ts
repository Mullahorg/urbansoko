import { useMemo } from 'react';

// Product category types for intelligent UI customization
export type ProductCategory = 
  | 'electronics' 
  | 'fashion' 
  | 'food' 
  | 'beauty' 
  | 'home' 
  | 'sports' 
  | 'books' 
  | 'default';

export interface ProductUIConfig {
  category: ProductCategory;
  showSizeGuide: boolean;
  showColorPicker: boolean;
  showNutritionInfo: boolean;
  showSpecifications: boolean;
  showWarranty: boolean;
  showIngredients: boolean;
  showMaterials: boolean;
  showDimensions: boolean;
  showCompatibility: boolean;
  showDeliveryEstimate: boolean;
  showFreshnessIndicator: boolean;
  primaryCTA: string;
  secondaryCTA: string;
  badgeStyle: 'tech' | 'fresh' | 'fashion' | 'default';
  priceDisplay: 'standard' | 'per-unit' | 'subscription';
  imageLayout: 'gallery' | 'single' | 'zoom' | '360-view';
  reviewFocus: 'rating' | 'photos' | 'verified' | 'expert';
}

// Category detection from product data
export const detectCategory = (product: any): ProductCategory => {
  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  const combined = `${name} ${category} ${description}`;

  // Electronics
  if (/phone|laptop|tablet|computer|headphone|earphone|speaker|camera|tv|monitor|gaming|console|charger|cable|electronic|tech|gadget|smart|wireless|bluetooth/.test(combined)) {
    return 'electronics';
  }

  // Fashion
  if (/shirt|pant|dress|shoe|sneaker|jacket|coat|hat|cap|bag|watch|jewelry|accessory|fashion|clothing|apparel|wear|style|outfit|jeans|skirt|blouse|trouser/.test(combined)) {
    return 'fashion';
  }

  // Food & Beverages
  if (/food|drink|beverage|snack|fresh|fruit|vegetable|meat|fish|dairy|bread|rice|flour|oil|sauce|spice|organic|grocery|meal|coffee|tea|juice|water/.test(combined)) {
    return 'food';
  }

  // Beauty & Personal Care
  if (/beauty|cosmetic|makeup|skincare|haircare|perfume|fragrance|lotion|cream|soap|shampoo|conditioner|nail|lipstick|mascara|serum/.test(combined)) {
    return 'beauty';
  }

  // Home & Living
  if (/furniture|home|kitchen|bedding|decor|lamp|curtain|carpet|rug|table|chair|sofa|mattress|pillow|towel|utensil|cookware/.test(combined)) {
    return 'home';
  }

  // Sports & Fitness
  if (/sport|fitness|gym|exercise|workout|yoga|running|football|basketball|tennis|swim|bike|cycling|equipment|gear/.test(combined)) {
    return 'sports';
  }

  // Books & Media
  if (/book|novel|magazine|textbook|ebook|audiobook|reading|literature|educational/.test(combined)) {
    return 'books';
  }

  return 'default';
};

// Generate UI configuration based on category
export const getProductUIConfig = (product: any): ProductUIConfig => {
  const category = detectCategory(product);

  const baseConfig: ProductUIConfig = {
    category,
    showSizeGuide: false,
    showColorPicker: false,
    showNutritionInfo: false,
    showSpecifications: false,
    showWarranty: false,
    showIngredients: false,
    showMaterials: false,
    showDimensions: false,
    showCompatibility: false,
    showDeliveryEstimate: true,
    showFreshnessIndicator: false,
    primaryCTA: 'Buy Now',
    secondaryCTA: 'Add to Cart',
    badgeStyle: 'default',
    priceDisplay: 'standard',
    imageLayout: 'gallery',
    reviewFocus: 'rating',
  };

  switch (category) {
    case 'electronics':
      return {
        ...baseConfig,
        showSpecifications: true,
        showWarranty: true,
        showCompatibility: true,
        showDimensions: true,
        primaryCTA: 'Buy Now',
        secondaryCTA: 'Compare',
        badgeStyle: 'tech',
        imageLayout: '360-view',
        reviewFocus: 'expert',
      };

    case 'fashion':
      return {
        ...baseConfig,
        showSizeGuide: true,
        showColorPicker: true,
        showMaterials: true,
        primaryCTA: 'Buy Now',
        secondaryCTA: 'Try Virtual Fit',
        badgeStyle: 'fashion',
        imageLayout: 'gallery',
        reviewFocus: 'photos',
      };

    case 'food':
      return {
        ...baseConfig,
        showNutritionInfo: true,
        showIngredients: true,
        showFreshnessIndicator: true,
        primaryCTA: 'Order Fresh',
        secondaryCTA: 'Subscribe & Save',
        badgeStyle: 'fresh',
        priceDisplay: 'per-unit',
        imageLayout: 'single',
        reviewFocus: 'verified',
      };

    case 'beauty':
      return {
        ...baseConfig,
        showIngredients: true,
        showColorPicker: true,
        primaryCTA: 'Buy Now',
        secondaryCTA: 'Try Shade',
        badgeStyle: 'fashion',
        imageLayout: 'zoom',
        reviewFocus: 'photos',
      };

    case 'home':
      return {
        ...baseConfig,
        showDimensions: true,
        showMaterials: true,
        showColorPicker: true,
        primaryCTA: 'Buy Now',
        secondaryCTA: 'View in Room',
        badgeStyle: 'default',
        imageLayout: 'gallery',
        reviewFocus: 'photos',
      };

    case 'sports':
      return {
        ...baseConfig,
        showSizeGuide: true,
        showMaterials: true,
        showSpecifications: true,
        primaryCTA: 'Buy Now',
        secondaryCTA: 'View Workout Guide',
        badgeStyle: 'tech',
        imageLayout: 'gallery',
        reviewFocus: 'verified',
      };

    case 'books':
      return {
        ...baseConfig,
        showSpecifications: true,
        primaryCTA: 'Buy Now',
        secondaryCTA: 'Preview',
        badgeStyle: 'default',
        priceDisplay: 'standard',
        imageLayout: 'single',
        reviewFocus: 'expert',
      };

    default:
      return baseConfig;
  }
};

// Custom hook for intelligent product UI
export const useIntelligentProductUI = (product: any) => {
  const config = useMemo(() => {
    if (!product) return null;
    return getProductUIConfig(product);
  }, [product]);

  return config;
};

// Get category-specific badges
export const getCategoryBadges = (product: any, config: ProductUIConfig) => {
  const badges: { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }[] = [];

  switch (config.category) {
    case 'electronics':
      if (product.warranty) badges.push({ text: `${product.warranty} Warranty`, variant: 'secondary' });
      if (product.isNew) badges.push({ text: 'Latest Model', variant: 'default' });
      break;
    case 'food':
      if (product.organic) badges.push({ text: 'Organic', variant: 'secondary' });
      if (product.freshness === 'fresh') badges.push({ text: 'Farm Fresh', variant: 'default' });
      break;
    case 'fashion':
      if (product.isNew) badges.push({ text: 'New Season', variant: 'default' });
      if (product.limited) badges.push({ text: 'Limited Edition', variant: 'secondary' });
      break;
    default:
      if (product.isNew) badges.push({ text: 'New', variant: 'default' });
  }

  return badges;
};

// Get category-specific specifications display
export const getSpecificationsLayout = (product: any, config: ProductUIConfig) => {
  const specs: { label: string; value: string; icon?: string }[] = [];

  if (config.showDimensions && product.dimensions) {
    specs.push({ label: 'Dimensions', value: product.dimensions, icon: 'ruler' });
  }
  if (config.showMaterials && product.materials) {
    specs.push({ label: 'Materials', value: product.materials, icon: 'layers' });
  }
  if (config.showWarranty && product.warranty) {
    specs.push({ label: 'Warranty', value: product.warranty, icon: 'shield' });
  }
  if (config.showCompatibility && product.compatibility) {
    specs.push({ label: 'Compatible With', value: product.compatibility, icon: 'link' });
  }

  return specs;
};
