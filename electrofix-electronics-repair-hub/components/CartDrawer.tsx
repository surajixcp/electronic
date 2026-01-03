
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { getAppState, removeFromCart, updateCartQuantity, clearCart } from '../services/storage';
import { CartItem } from '../types';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const navigate = useNavigate();
    const { products } = getAppState();

    const updateCart = () => {
        const { cart } = getAppState();
        setCartItems(cart || []);
    };

    useEffect(() => {
        if (isOpen) {
            updateCart();
        }
        window.addEventListener('cart-updated', updateCart);
        return () => window.removeEventListener('cart-updated', updateCart);
    }, [isOpen]);

    if (!isOpen) return null;

    const enrichedCart = cartItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
            ...item,
            product
        };
    }).filter(item => item.product);

    const totalAmount = enrichedCart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

    const handleCheckout = () => {
        onClose();
        navigate('/booking?mode=cart');
    };

    return (
        <div className="fixed inset-0 z-[150] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
                        <ShoppingBag className="text-emerald-500" /> Your Cart
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {enrichedCart.length > 0 ? (
                        enrichedCart.map(({ product, quantity }) => (
                            <div key={product!.id} className="flex gap-4 group">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0">
                                    <img src={product!.images[0]} alt={product!.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{product!.name}</h3>
                                    <p className="text-slate-500 text-sm mb-2">₹{product!.price}</p>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                            <button
                                                onClick={() => updateCartQuantity(product!.id, -1)}
                                                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-shadow shadow-sm"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                                            <button
                                                onClick={() => updateCartQuantity(product!.id, 1)}
                                                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-shadow shadow-sm"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(product!.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="font-bold text-right">
                                    ₹{product!.price * quantity}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                <ShoppingBag className="text-slate-300" size={32} />
                            </div>
                            <p className="text-slate-500 font-bold">Your cart is empty</p>
                            <button onClick={onClose} className="text-emerald-500 font-bold hover:underline">Start Shopping</button>
                        </div>
                    )}
                </div>

                {enrichedCart.length > 0 && (
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-slate-500 font-bold">Total</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">₹{totalAmount}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                        >
                            Checkout Now <ArrowRight size={20} />
                        </button>
                        <button
                            onClick={clearCart}
                            className="w-full mt-3 py-2 text-slate-400 text-xs font-bold hover:text-red-500 transition-colors"
                        >
                            Clear Cart
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
