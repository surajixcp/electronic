
import { ProductCondition, ProductCategory, type Product, type RepairService } from './types';

export const INITIAL_PRODUCTS: Product[] = [
    {
        id: 'p1',
        name: 'iPhone 15 Pro Max',
        description: 'The latest flagship from Apple with Titanium design and A17 Pro chip.',
        price: 1399,
        category: ProductCategory.MOBILE,
        condition: ProductCondition.NEW,
        images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop'],
        specs: {
            'Display': '6.7-inch Super Retina XDR',
            'Processor': 'A17 Pro chip',
            'Camera': '48MP Main | 12MP Ultra Wide | 12MP Telephoto',
            'Battery': 'Up to 29 hours video playback'
        },
        warranty: '1 Year Apple Warranty',
        brand: 'Apple',
        featured: true,
        originalPrice: 1399,
        discount: 0
    },
    {
        id: 'p2',
        name: 'MacBook Pro 14" M3',
        description: 'Blazing fast M3 chip with beautiful Liquid Retina XDR display.',
        price: 1599,
        category: ProductCategory.LAPTOP,
        condition: ProductCondition.NEW,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop'],
        specs: {
            'Memory': '8GB Unified Memory',
            'Storage': '512GB SSD',
            'Chip': 'Apple M3 chip'
        },
        warranty: '1 Year Apple Warranty',
        brand: 'Apple',
        featured: true,
        originalPrice: 1599,
        discount: 0
    },
    {
        id: 'p3',
        name: 'Galaxy Watch 6 (Used)',
        description: 'Gently used Galaxy Watch 6. Screen is flawless, minor scratches on band.',
        price: 199,
        category: ProductCategory.ACCESSORIES,
        condition: ProductCondition.USED,
        images: ['https://images.unsplash.com/photo-1544117518-30df578096a4?q=80&w=800&auto=format&fit=crop'],
        specs: {
            'Size': '44mm',
            'Connectivity': 'Bluetooth / Wi-Fi',
            'Health': 'Heart rate, ECG, Sleep tracking'
        },
        warranty: '30 Days Seller Warranty',
        brand: 'Samsung',
        featured: false,
        originalPrice: 199,
        discount: 0
    },
    {
        id: 'p4',
        name: 'Dell XPS 13 (Refurbished)',
        description: 'Certified refurbished Dell XPS. Like new performance at a fraction of cost.',
        price: 850,
        category: ProductCategory.LAPTOP,
        condition: ProductCondition.REFURBISHED,
        images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800&auto=format&fit=crop'],
        specs: {
            'RAM': '16GB',
            'Storage': '512GB NVMe SSD',
            'Display': '13.4" FHD+'
        },
        warranty: '6 Months Seller Warranty',
        brand: 'Dell',
        featured: true,
        originalPrice: 850,
        discount: 0
    }
];

export const INITIAL_SERVICES: RepairService[] = [
    {
        id: 's1',
        title: 'iPhone Screen Replacement',
        category: 'Mobile Repair',
        basePrice: 120,
        description: 'Expert screen replacement for all iPhone models using high-quality parts.',
        brand: 'Apple',
        image: 'https://images.unsplash.com/photo-1621330396173-e41b1cafd17f?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 's2',
        title: 'MacBook Battery Swap',
        category: 'Laptop Repair',
        basePrice: 80,
        description: 'Original battery replacement to bring your MacBook back to full life.',
        brand: 'Apple',
        image: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 's3',
        title: 'Data Recovery',
        category: 'Other Electronics Repair',
        basePrice: 50,
        description: 'Retrieving lost data from corrupted hard drives or water damaged devices.',
        brand: 'Generic',
        image: 'https://images.unsplash.com/photo-1531297461136-82lw8?q=80&w=800&auto=format&fit=crop'
    }
];

export const APP_THEME = {
    primary: 'emerald-500',
    secondary: 'slate-900',
    accent: 'emerald-100',
};
