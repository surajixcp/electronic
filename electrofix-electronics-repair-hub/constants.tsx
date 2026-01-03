
import { ProductCondition, ProductCategory, Product, RepairService } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'iPhone 15 Pro Max',
    description: 'The latest flagship from Apple with Titanium design and A17 Pro chip.',
    price: 1399,
    category: ProductCategory.MOBILE,
    condition: ProductCondition.NEW,
    images: ['/smart phones.webp', '/electrical 2.jpg', '/electrical 3.jpg', '/industries-consumer-electronics.jpeg'],
    specs: {
      'Display': '6.7-inch Super Retina XDR',
      'Processor': 'A17 Pro chip',
      'Camera': '48MP Main | 12MP Ultra Wide | 12MP Telephoto',
      'Battery': 'Up to 29 hours video playback'
    },
    warranty: '1 Year Apple Warranty',
    featured: true,
    reviews: [],
    rating: 4.9,
    reviewCount: 128
  },
  {
    id: 'p2',
    name: 'MacBook Pro 14" M3',
    description: 'Blazing fast M3 chip with beautiful Liquid Retina XDR display.',
    price: 1599,
    category: ProductCategory.LAPTOP,
    condition: ProductCondition.NEW,
    images: ['/mac 1.webp', '/electrical 4.jpg', '/electrical 2.jpg'],
    specs: {
      'Memory': '8GB Unified Memory',
      'Storage': '512GB SSD',
      'Chip': 'Apple M3 chip'
    },
    warranty: '1 Year Apple Warranty',
    featured: true,
    reviews: [],
    rating: 4.8,
    reviewCount: 64
  },
  {
    id: 'p3',
    name: 'Galaxy Watch 6 (Used)',
    description: 'Gently used Galaxy Watch 6. Screen is flawless, minor scratches on band.',
    price: 199,
    category: ProductCategory.ACCESSORIES,
    condition: ProductCondition.USED,
    images: ['/electrical 3.jpg', '/smart phones.webp', '/electrical 2.jpg'],
    specs: {
      'Size': '44mm',
      'Connectivity': 'Bluetooth / Wi-Fi',
      'Health': 'Heart rate, ECG, Sleep tracking'
    },
    warranty: '30 Days Seller Warranty',
    featured: false,
    reviews: [],
    rating: 4.5,
    reviewCount: 12
  },
  {
    id: 'p4',
    name: 'Dell XPS 13 (Refurbished)',
    description: 'Certified refurbished Dell XPS. Like new performance at a fraction of cost.',
    price: 850,
    category: ProductCategory.LAPTOP,
    condition: ProductCondition.REFURBISHED,
    images: ['/electrical 4.jpg', '/mac 1.webp', '/electrical 3.jpg'],
    specs: {
      'RAM': '16GB',
      'Storage': '512GB NVMe SSD',
      'Display': '13.4" FHD+'
    },
    warranty: '6 Months Seller Warranty',
    featured: true,
    reviews: [],
    rating: 4.7,
    reviewCount: 32
  }
];

export const INITIAL_SERVICES: RepairService[] = [
  {
    id: 's1',
    title: 'iPhone Screen Replacement',
    category: 'Mobile Repair',
    basePrice: 120,
    description: 'Expert screen replacement for all iPhone models using high-quality parts.'
  },
  {
    id: 's2',
    title: 'MacBook Battery Swap',
    category: 'Laptop Repair',
    basePrice: 80,
    description: 'Original battery replacement to bring your MacBook back to full life.'
  },
  {
    id: 's3',
    title: 'Data Recovery',
    category: 'Other Electronics Repair',
    basePrice: 50,
    description: 'Retrieving lost data from corrupted hard drives or water damaged devices.'
  }
];

export const APP_THEME = {
  primary: 'emerald-500',
  secondary: 'slate-900',
  accent: 'emerald-100',
};
