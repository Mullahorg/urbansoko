import { Product } from '@/components/Product/ProductCard';

export const products: Product[] = [
  // Shirts
  {
    id: '1',
    name: 'African Print Button-Up Shirt',
    price: 4500,
    originalPrice: 6000,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=600&fit=crop',
    category: 'Shirts',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Blue', 'Black', 'Gold'],
    inStock: true,
    isNew: true,
    isSale: true
  },
  {
    id: '2',
    name: 'Kente Pattern Polo Shirt',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=400&h=600&fit=crop',
    category: 'Shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Multi', 'Black', 'Gold'],
    inStock: true,
    isNew: true
  },
  {
    id: '3',
    name: 'Dashiki Inspired Casual Shirt',
    price: 5000,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=600&fit=crop',
    category: 'Shirts',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Orange', 'Blue', 'Green'],
    inStock: true
  },
  {
    id: '4',
    name: 'Modern African Print Shirt',
    price: 4200,
    originalPrice: 5500,
    image: 'https://images.unsplash.com/photo-1622470952794-aa9c70b0fb9e?w=400&h=600&fit=crop',
    category: 'Shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Gold', 'Red'],
    inStock: true,
    isSale: true
  },
  {
    id: '25',
    name: 'Swahili Coast Linen Shirt',
    price: 5500,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=600&fit=crop',
    category: 'Shirts',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Cream', 'Light Blue'],
    inStock: true,
    isNew: true
  },
  {
    id: '26',
    name: 'Coastal Breeze Cotton Shirt',
    price: 4800,
    originalPrice: 6200,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=600&fit=crop',
    category: 'Shirts',
    sizes: ['M', 'L', 'XL'],
    colors: ['Turquoise', 'White', 'Navy'],
    inStock: true,
    isSale: true
  },

  // Pants
  {
    id: '5',
    name: 'African Print Chino Pants',
    price: 6500,
    image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=600&fit=crop',
    category: 'Pants',
    sizes: ['30', '32', '34', '36', '38'],
    colors: ['Navy', 'Black', 'Khaki'],
    inStock: true,
    isNew: true
  },
  {
    id: '6',
    name: 'Kente Accent Trousers',
    price: 7000,
    originalPrice: 8500,
    image: 'https://images.unsplash.com/photo-1506629905607-e5168b1e4390?w=400&h=600&fit=crop',
    category: 'Pants',
    sizes: ['30', '32', '34', '36'],
    colors: ['Black', 'Gold', 'Multi'],
    inStock: true,
    isSale: true
  },
  {
    id: '7',
    name: 'Traditional Style Joggers',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=600&fit=crop',
    category: 'Pants',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Grey', 'Navy'],
    inStock: true
  },
  {
    id: '8',
    name: 'Dashiki Print Dress Pants',
    price: 7500,
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=600&fit=crop',
    category: 'Pants',
    sizes: ['30', '32', '34', '36', '38', '40'],
    colors: ['Blue', 'Black', 'Brown'],
    inStock: false
  },
  {
    id: '27',
    name: 'Coastal Linen Trousers',
    price: 6800,
    image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=600&fit=crop',
    category: 'Pants',
    sizes: ['30', '32', '34', '36', '38'],
    colors: ['Beige', 'White', 'Light Grey'],
    inStock: true,
    isNew: true
  },

  // Suits
  {
    id: '9',
    name: 'African Inspired Business Suit',
    price: 25000,
    originalPrice: 32000,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    category: 'Suits',
    sizes: ['38', '40', '42', '44', '46'],
    colors: ['Black', 'Navy', 'Charcoal'],
    inStock: true,
    isSale: true
  },
  {
    id: '10',
    name: 'Kente Trim Formal Suit',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1594736797933-d0ddba82faa3?w=400&h=600&fit=crop',
    category: 'Suits',
    sizes: ['38', '40', '42', '44'],
    colors: ['Black', 'Gold', 'Multi'],
    inStock: true,
    isNew: true
  },
  {
    id: '11',
    name: 'Modern Dashiki Blazer Set',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=400&h=600&fit=crop',
    category: 'Suits',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black', 'Gold'],
    inStock: true
  },

  // Sport Shoes
  {
    id: '12',
    name: 'African Print Sneakers',
    price: 8500,
    originalPrice: 11000,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=600&fit=crop',
    category: 'Sport Shoes',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Multi', 'Black', 'White'],
    inStock: true,
    isSale: true
  },
  {
    id: '28',
    name: 'Coastal Running Shoes',
    price: 9500,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=600&fit=crop',
    category: 'Sport Shoes',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Ocean Blue', 'White', 'Coral'],
    inStock: true,
    isNew: true
  },
  {
    id: '29',
    name: 'Beach Basketball Shoes',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=600&fit=crop',
    category: 'Sport Shoes',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Sand', 'White', 'Blue'],
    inStock: true
  },
  {
    id: '30',
    name: 'Swahili Football Boots',
    price: 15000,
    originalPrice: 18000,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=600&fit=crop',
    category: 'Sport Shoes',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Green', 'Gold', 'White'],
    inStock: true,
    isSale: true
  },
  {
    id: '31',
    name: 'Marathon Coast Edition',
    price: 11500,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=600&fit=crop',
    category: 'Sport Shoes',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Teal', 'Orange', 'Black'],
    inStock: true,
    isNew: true
  },

  // Formal Shoes
  {
    id: '13',
    name: 'Kente Pattern Loafers',
    price: 9500,
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=600&fit=crop',
    category: 'Formal Shoes',
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['Black', 'Brown', 'Gold'],
    inStock: true,
    isNew: true
  },
  {
    id: '14',
    name: 'Traditional Leather Boots',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=600&fit=crop',
    category: 'Formal Shoes',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Brown', 'Black', 'Tan'],
    inStock: true
  },
  {
    id: '15',
    name: 'Modern African Oxford Shoes',
    price: 10500,
    originalPrice: 13000,
    image: 'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=400&h=600&fit=crop',
    category: 'Formal Shoes',
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['Black', 'Brown', 'Navy'],
    inStock: true,
    isSale: true
  },

  // Accessories
  {
    id: '16',
    name: 'Kente Pattern Bow Tie',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1588287576500-aa8507b0b2e0?w=400&h=600&fit=crop',
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Multi', 'Gold', 'Black'],
    inStock: true,
    isNew: true
  },
  {
    id: '17',
    name: 'African Print Pocket Square',
    price: 1500,
    originalPrice: 2000,
    image: 'https://images.unsplash.com/photo-1581515073119-0a7d55fea3b1?w=400&h=600&fit=crop',
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Multi', 'Blue', 'Red'],
    inStock: true,
    isSale: true
  },
  {
    id: '18',
    name: 'Dashiki Pattern Belt',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=600&fit=crop',
    category: 'Accessories',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Brown', 'Gold'],
    inStock: true
  },
  {
    id: '19',
    name: 'African Inspired Watch',
    price: 15000,
    originalPrice: 20000,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=600&fit=crop',
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Gold', 'Black', 'Silver'],
    inStock: true,
    isSale: true
  },
  {
    id: '20',
    name: 'Kente Kufi Hat',
    price: 4000,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5c?w=400&h=600&fit=crop',
    category: 'Accessories',
    sizes: ['S', 'M', 'L'],
    colors: ['Multi', 'Black', 'Gold'],
    inStock: true,
    isNew: true
  },
  {
    id: '32',
    name: 'Coastal Prayer Beads',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=600&fit=crop',
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Brown', 'Black', 'Natural'],
    inStock: true,
    isNew: true
  },
  {
    id: '33',
    name: 'Swahili Leather Bracelet',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=600&fit=crop',
    category: 'Accessories',
    sizes: ['S', 'M', 'L'],
    colors: ['Brown', 'Black', 'Tan'],
    inStock: true
  },
  {
    id: '34',
    name: 'Coastal Shell Necklace',
    price: 3200,
    originalPrice: 4000,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=600&fit=crop',
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Natural', 'White', 'Turquoise'],
    inStock: true,
    isSale: true
  },

  // Coast Traditional Wear
  {
    id: '35',
    name: 'Traditional Kanzu',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=600&fit=crop',
    category: 'Traditional Wear',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Cream', 'Light Blue'],
    inStock: true,
    isNew: true
  },
  {
    id: '36',
    name: 'Swahili Wedding Suit',
    price: 28000,
    originalPrice: 35000,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    category: 'Traditional Wear',
    sizes: ['38', '40', '42', '44', '46'],
    colors: ['Gold', 'White', 'Cream'],
    inStock: true,
    isSale: true
  },
  {
    id: '37',
    name: 'Coastal Kikoy Wrap',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=600&fit=crop',
    category: 'Traditional Wear',
    sizes: ['One Size'],
    colors: ['Multi', 'Blue', 'Green', 'Red'],
    inStock: true,
    isNew: true
  },
  {
    id: '38',
    name: 'Fisherman Traditional Shirt',
    price: 4200,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=600&fit=crop',
    category: 'Traditional Wear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Blue', 'Navy'],
    inStock: true
  }
];