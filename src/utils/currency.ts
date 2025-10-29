export const formatPrice = (price: number): string => {
  return `KSh ${price.toLocaleString('en-KE')}`;
};

export const formatKES = (price: number): string => {
  return `KSh ${price.toLocaleString('en-KE')}`;
};

export const formatPriceRange = (minPrice: number, maxPrice: number): string => {
  return `KSh ${minPrice.toLocaleString('en-KE')} - KSh ${maxPrice.toLocaleString('en-KE')}`;
};