// Smart Search Utility - Fuzzy matching, typo tolerance, and category detection

// Common product term mappings (variations -> canonical form)
const TERM_SYNONYMS: Record<string, string[]> = {
  'tshirt': ['t-shirt', 't shirt', 'tee', 'teeshirt', 'tee-shirt', 't-shit', 't shit', 'tshit'],
  'shirt': ['shrt', 'shrit', 'shitr'],
  'pants': ['pant', 'trouser', 'trousers', 'jeans', 'jean', 'slacks'],
  'dress': ['dres', 'drss', 'frock', 'gown'],
  'jacket': ['jaket', 'jackt', 'coat', 'blazer', 'hoodie', 'hoody', 'sweater'],
  'shoes': ['shoe', 'sneakers', 'sneaker', 'boots', 'boot', 'footwear', 'sandals', 'sandal'],
  'bag': ['bags', 'purse', 'handbag', 'backpack', 'tote', 'clutch', 'satchel'],
  'watch': ['watches', 'wristwatch', 'timepiece'],
  'jewelry': ['jewellery', 'jewlry', 'jwelry', 'accessories', 'necklace', 'bracelet', 'ring', 'earring', 'earings'],
  'hat': ['hats', 'cap', 'caps', 'beanie', 'beanies'],
  'skirt': ['skrt', 'mini', 'maxi'],
  'shorts': ['short', 'bermuda', 'bermudas'],
  'socks': ['sock', 'stockings', 'hosiery'],
  'underwear': ['undergarment', 'briefs', 'boxers', 'lingerie', 'panties', 'bra'],
  'scarf': ['scarves', 'scarfs', 'shawl', 'wrap'],
  'belt': ['belts'],
  'sunglasses': ['sunglass', 'shades', 'eyewear', 'glasses'],
  'kids': ['kid', 'children', 'child', 'baby', 'toddler', 'infant'],
  'men': ['man', 'mens', "men's", 'male', 'boys', 'boy'],
  'women': ['woman', 'womens', "women's", 'female', 'girls', 'girl', 'ladies', 'lady'],
};

// Category keywords for smart detection
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'clothing': ['wear', 'apparel', 'garment', 'outfit', 'attire', 'fashion', 'clothes'],
  'formal': ['office', 'business', 'professional', 'work', 'suit', 'formal'],
  'casual': ['casual', 'everyday', 'relaxed', 'comfortable', 'comfort'],
  'sport': ['sports', 'athletic', 'gym', 'workout', 'fitness', 'running', 'training', 'activewear'],
  'summer': ['summer', 'beach', 'tropical', 'hot', 'warm'],
  'winter': ['winter', 'cold', 'warm', 'cozy', 'thermal'],
};

// Color variations
const COLOR_SYNONYMS: Record<string, string[]> = {
  'black': ['blk', 'noir', 'dark', 'ebony'],
  'white': ['wht', 'cream', 'ivory', 'snow'],
  'red': ['crimson', 'scarlet', 'ruby', 'maroon', 'burgundy'],
  'blue': ['navy', 'azure', 'cobalt', 'indigo', 'teal', 'cyan', 'turquoise'],
  'green': ['olive', 'emerald', 'lime', 'mint', 'forest', 'sage'],
  'yellow': ['gold', 'golden', 'mustard', 'lemon'],
  'pink': ['rose', 'blush', 'coral', 'salmon', 'magenta', 'fuchsia'],
  'purple': ['violet', 'lavender', 'plum', 'mauve'],
  'orange': ['tangerine', 'peach', 'apricot'],
  'brown': ['tan', 'beige', 'camel', 'khaki', 'chocolate', 'coffee'],
  'gray': ['grey', 'silver', 'charcoal', 'slate'],
};

// Size variations
const SIZE_SYNONYMS: Record<string, string[]> = {
  'xs': ['extra small', 'extrasmall', 'x-small'],
  's': ['small', 'sm'],
  'm': ['medium', 'med'],
  'l': ['large', 'lg'],
  'xl': ['extra large', 'extralarge', 'x-large'],
  'xxl': ['2xl', 'extra extra large', 'double xl'],
  'xxxl': ['3xl', 'triple xl'],
};

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  
  return dp[m][n];
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLen;
}

/**
 * Normalize a search term by removing common typos and variations
 */
export function normalizeSearchTerm(term: string): string[] {
  const normalized = term.toLowerCase().trim();
  const terms = new Set<string>([normalized]);
  
  // Remove common separators and combine
  const noSeparators = normalized.replace(/[-_\s]/g, '');
  terms.add(noSeparators);
  
  // Check synonyms
  for (const [canonical, variations] of Object.entries(TERM_SYNONYMS)) {
    if (variations.includes(normalized) || variations.includes(noSeparators) || canonical === normalized) {
      terms.add(canonical);
      variations.forEach(v => terms.add(v.replace(/[-_\s]/g, '')));
    }
  }
  
  // Check color synonyms
  for (const [canonical, variations] of Object.entries(COLOR_SYNONYMS)) {
    if (variations.includes(normalized) || canonical === normalized) {
      terms.add(canonical);
    }
  }
  
  // Check size synonyms
  for (const [canonical, variations] of Object.entries(SIZE_SYNONYMS)) {
    if (variations.includes(normalized) || canonical === normalized) {
      terms.add(canonical);
    }
  }
  
  return Array.from(terms);
}

/**
 * Get suggested search terms based on input
 */
export function getSuggestedTerms(input: string): string[] {
  const normalized = input.toLowerCase().trim();
  const suggestions: string[] = [];
  
  // Check all synonyms for close matches
  for (const [canonical, variations] of Object.entries(TERM_SYNONYMS)) {
    if (canonical.includes(normalized) || normalized.includes(canonical)) {
      suggestions.push(canonical);
    }
    for (const variation of variations) {
      if (calculateSimilarity(normalized, variation) > 0.6) {
        suggestions.push(canonical);
        break;
      }
    }
  }
  
  return [...new Set(suggestions)].slice(0, 5);
}

/**
 * Detect potential categories from search query
 */
export function detectCategories(query: string): string[] {
  const normalized = query.toLowerCase();
  const detectedCategories: string[] = [];
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        detectedCategories.push(category);
        break;
      }
    }
  }
  
  return [...new Set(detectedCategories)];
}

/**
 * Smart search matching with fuzzy logic
 */
export function smartMatch(searchQuery: string, targetText: string, threshold = 0.65): boolean {
  const queryTerms = searchQuery.toLowerCase().split(/\s+/);
  const targetLower = targetText.toLowerCase();
  
  for (const term of queryTerms) {
    // Get all normalized variations of the search term
    const variations = normalizeSearchTerm(term);
    
    // Check if any variation matches
    const hasMatch = variations.some(variation => {
      // Exact substring match
      if (targetLower.includes(variation)) return true;
      
      // Check each word in target for fuzzy match
      const targetWords = targetLower.split(/\s+/);
      return targetWords.some(word => calculateSimilarity(variation, word) >= threshold);
    });
    
    if (hasMatch) return true;
  }
  
  return false;
}

/**
 * Calculate relevance score for search results
 */
export function calculateRelevanceScore(query: string, product: {
  name: string;
  category: string;
  description?: string;
  colors?: string[];
  sizes?: string[];
}): number {
  let score = 0;
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/);
  
  for (const term of queryTerms) {
    const variations = normalizeSearchTerm(term);
    
    for (const variation of variations) {
      // Name match (highest priority)
      if (product.name.toLowerCase().includes(variation)) {
        score += 100;
      } else {
        const nameSimilarity = Math.max(
          ...product.name.toLowerCase().split(/\s+/).map(w => calculateSimilarity(variation, w))
        );
        score += nameSimilarity * 50;
      }
      
      // Category match (high priority)
      if (product.category.toLowerCase().includes(variation)) {
        score += 80;
      }
      
      // Description match (medium priority)
      if (product.description?.toLowerCase().includes(variation)) {
        score += 40;
      }
      
      // Color match
      if (product.colors?.some(c => {
        const colorLower = c.toLowerCase();
        if (colorLower.includes(variation)) return true;
        // Check color synonyms
        for (const [canonical, synonyms] of Object.entries(COLOR_SYNONYMS)) {
          if ((canonical === variation || synonyms.includes(variation)) && 
              (colorLower === canonical || synonyms.some(s => colorLower.includes(s)))) {
            return true;
          }
        }
        return false;
      })) {
        score += 30;
      }
      
      // Size match
      if (product.sizes?.some(s => {
        const sizeLower = s.toLowerCase();
        if (sizeLower === variation) return true;
        for (const [canonical, synonyms] of Object.entries(SIZE_SYNONYMS)) {
          if ((canonical === variation || synonyms.includes(variation)) && sizeLower === canonical) {
            return true;
          }
        }
        return false;
      })) {
        score += 20;
      }
    }
  }
  
  return score;
}

/**
 * Parse search query for advanced features
 */
export function parseSearchQuery(query: string): {
  terms: string[];
  colors: string[];
  sizes: string[];
  priceRange?: { min?: number; max?: number };
} {
  const terms: string[] = [];
  const colors: string[] = [];
  const sizes: string[] = [];
  let priceRange: { min?: number; max?: number } | undefined;
  
  const words = query.toLowerCase().split(/\s+/);
  
  for (const word of words) {
    // Check for price indicators
    const priceMatch = word.match(/^(\$|under|over|below|above)?(\d+)(\$)?$/);
    if (priceMatch) {
      const value = parseInt(priceMatch[2]);
      if (word.includes('under') || word.includes('below')) {
        priceRange = { ...priceRange, max: value };
      } else if (word.includes('over') || word.includes('above')) {
        priceRange = { ...priceRange, min: value };
      }
      continue;
    }
    
    // Check for colors
    for (const [canonical, synonyms] of Object.entries(COLOR_SYNONYMS)) {
      if (canonical === word || synonyms.includes(word)) {
        colors.push(canonical);
        break;
      }
    }
    
    // Check for sizes
    for (const [canonical, synonyms] of Object.entries(SIZE_SYNONYMS)) {
      if (canonical === word || synonyms.includes(word)) {
        sizes.push(canonical);
        break;
      }
    }
    
    // Add as search term
    terms.push(word);
  }
  
  return { terms, colors, sizes, priceRange };
}

/**
 * Get search autocomplete suggestions
 */
export function getAutocompleteSuggestions(
  input: string,
  products: { name: string; category: string }[],
  maxSuggestions = 8
): string[] {
  if (!input.trim()) return [];
  
  const inputLower = input.toLowerCase().trim();
  const suggestions = new Set<string>();
  
  // Add matching product names
  for (const product of products) {
    if (product.name.toLowerCase().includes(inputLower)) {
      suggestions.add(product.name);
    }
    if (product.category.toLowerCase().includes(inputLower)) {
      suggestions.add(product.category);
    }
    if (suggestions.size >= maxSuggestions * 2) break;
  }
  
  // Add synonym suggestions
  const synonymSuggestions = getSuggestedTerms(inputLower);
  synonymSuggestions.forEach(s => suggestions.add(s));
  
  // Sort by relevance and return
  return Array.from(suggestions)
    .sort((a, b) => {
      const aStartsWith = a.toLowerCase().startsWith(inputLower) ? 0 : 1;
      const bStartsWith = b.toLowerCase().startsWith(inputLower) ? 0 : 1;
      return aStartsWith - bStartsWith;
    })
    .slice(0, maxSuggestions);
}
