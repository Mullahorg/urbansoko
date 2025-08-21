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

  // Shoes
  {
    id: '12',
    name: 'African Print Sneakers',
    price: 8500,
    originalPrice: 11000,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=600&fit=crop',
    category: 'Shoes',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Multi', 'Black', 'White'],
    inStock: true,
    isSale: true
  },
  {
    id: '13',
    name: 'Kente Pattern Loafers',
    price: 9500,
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=600&fit=crop',
    category: 'Shoes',
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
    category: 'Shoes',
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
    category: 'Shoes',
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
  }
];