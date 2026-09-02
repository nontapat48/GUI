import rawProducts from '../product.json';

export interface Product {
  id: number | string;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviewsCount: number;
  description: string;
  colors: string[];
  sizes: string[];
  isFeatured?: boolean;
}

export const CATEGORIES = ['All', 'GPU', 'SSD', 'RAM', 'CPU', 'Peripherals'];

export const PRODUCTS: Product[] = rawProducts as Product[];

