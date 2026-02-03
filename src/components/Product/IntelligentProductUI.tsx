import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Cpu, Leaf, Sparkles, Zap, Clock, Shield, Ruler, Layers } from 'lucide-react';
import { ProductUIConfig } from '@/hooks/useIntelligentProductUI';

interface IntelligentProductBadgesProps {
  product: any;
  config: ProductUIConfig;
}

export const IntelligentProductBadges = ({ product, config }: IntelligentProductBadgesProps) => {
  const getBadgeIcon = () => {
    switch (config.badgeStyle) {
      case 'tech': return <Cpu className="h-3 w-3 mr-1" />;
      case 'fresh': return <Leaf className="h-3 w-3 mr-1" />;
      case 'fashion': return <Sparkles className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  const getBadgeClass = () => {
    switch (config.badgeStyle) {
      case 'tech': return 'bg-gradient-to-r from-primary to-secondary text-primary-foreground';
      case 'fresh': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'fashion': return 'bg-gradient-to-r from-secondary to-accent text-secondary-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <motion.div 
      className="flex flex-wrap gap-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Badge variant="secondary" className="text-xs">
        {product.category}
      </Badge>
      
      {product.isNew && (
        <Badge className={`text-xs ${getBadgeClass()}`}>
          {getBadgeIcon()}
          {config.category === 'electronics' ? 'Latest' : config.category === 'fashion' ? 'New Season' : 'New'}
        </Badge>
      )}
      
      {config.showFreshnessIndicator && product.freshness && (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
          <Leaf className="h-3 w-3 mr-1" />
          Farm Fresh
        </Badge>
      )}
      
      {config.showWarranty && product.warranty && (
        <Badge variant="outline" className="text-xs border-primary/30">
          <Shield className="h-3 w-3 mr-1" />
          {product.warranty}
        </Badge>
      )}
      
      {product.featured && (
        <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
          <Zap className="h-3 w-3 mr-1" />
          Featured
        </Badge>
      )}
    </motion.div>
  );
};

interface IntelligentSpecificationsProps {
  product: any;
  config: ProductUIConfig;
}

export const IntelligentSpecifications = ({ product, config }: IntelligentSpecificationsProps) => {
  if (!config.showSpecifications && !config.showDimensions && !config.showMaterials) {
    return null;
  }

  const specs = [];

  if (config.showDimensions && product.dimensions) {
    specs.push({ icon: Ruler, label: 'Dimensions', value: product.dimensions });
  }
  if (config.showMaterials && product.materials) {
    specs.push({ icon: Layers, label: 'Materials', value: product.materials });
  }
  if (config.showWarranty && product.warranty) {
    specs.push({ icon: Shield, label: 'Warranty', value: product.warranty });
  }

  if (specs.length === 0) return null;

  return (
    <motion.div 
      className="grid grid-cols-2 gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {specs.map((spec, index) => (
        <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          <spec.icon className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">{spec.label}</p>
            <p className="text-sm font-medium">{spec.value}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

interface IntelligentPriceDisplayProps {
  product: any;
  config: ProductUIConfig;
  quantity: number;
}

export const IntelligentPriceDisplay = ({ product, config, quantity }: IntelligentPriceDisplayProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-3xl font-bold text-gradient-primary">
          {formatPrice(product.price)}
        </span>
        
        {product.originalPrice && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
            <Badge className="bg-accent/10 text-accent border-accent/20">
              Save {discountPercentage}%
            </Badge>
          </>
        )}
      </div>

      {config.priceDisplay === 'per-unit' && product.unit && (
        <p className="text-sm text-muted-foreground">
          {formatPrice(product.price / (product.quantity || 1))} per {product.unit}
        </p>
      )}

      {config.priceDisplay === 'subscription' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Subscribe & save 10% - {formatPrice(product.price * 0.9)}/month</span>
        </div>
      )}

      {quantity > 1 && (
        <p className="text-sm text-primary font-medium">
          Total: {formatPrice(product.price * quantity)}
        </p>
      )}
    </motion.div>
  );
};

interface IntelligentCTAButtonsProps {
  config: ProductUIConfig;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
  disabled?: boolean;
}

export const IntelligentCTAButtons = ({ 
  config, 
  onPrimaryClick, 
  onSecondaryClick, 
  disabled 
}: IntelligentCTAButtonsProps) => {
  return (
    <div className="space-y-3">
      <motion.button
        className="w-full py-4 rounded-xl font-semibold text-lg btn-cyber disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onPrimaryClick}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        <Zap className="inline h-5 w-5 mr-2" />
        {config.primaryCTA}
      </motion.button>
      
      <motion.button
        className="w-full py-3 rounded-xl font-medium border border-primary/30 hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50"
        onClick={onSecondaryClick}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        {config.secondaryCTA}
      </motion.button>
    </div>
  );
};
