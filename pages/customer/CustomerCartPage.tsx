import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { CartItem } from '../../types';

const CustomerCartPage: React.FC = () => {
    const { cart, removeFromCart, updateCartQuantity, setActivePage, t } = useContext(AppContext)!;

    const subtotal = cart.reduce((sum, item) => sum + item.offerPrice * item.quantity, 0);
    const shipping = subtotal > 0 ? 150 : 0;
    const tax = subtotal * 0.12;
    const total = subtotal + shipping + tax;

    const CartItemRow: React.FC<{ item: CartItem }> = ({ item }) => (
        <div className="grid grid-cols-1 sm:grid-cols-6 items-center py-4 border-b border-slate-200 dark:border-slate-700 gap-4">
            <div className="sm:col-span-3 flex items-center gap-4">
                <img src={item.product.image} alt={item.product.name} className="w-24 h-24 rounded-lg object-cover" />
                <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">{item.product.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        <span className="line-through mr-2">₹{item.product.price.toLocaleString()}</span>
                        <span className="text-teal-600 font-semibold">₹{item.offerPrice.toLocaleString()}</span>
                    </p>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-xs text-slate-500 hover:text-red-500 mt-1">
                        Remove
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-2 justify-self-center">
                <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-md">-</button>
                <span className="w-10 text-center font-semibold">{item.quantity}</span>
                <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-md">+</button>
            </div>
            <p className="sm:col-span-2 w-full sm:w-24 text-right font-semibold text-lg">₹{(item.offerPrice * item.quantity).toLocaleString()}</p>
        </div>
    );
    
    if (cart.length === 0) {
        return (
            <div className="text-center py-20 container mx-auto">
                <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <h2 className="mt-6 text-2xl font-bold text-slate-800 dark:text-slate-100">{t('cart.empty')}</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">{t('cart.emptyDescription')}</p>
                <Button onClick={() => setActivePage('customer-marketplace')} className="mt-8">{t('cart.continueShopping')}</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
            <h1 className="text-4xl font-bold mb-8">{t('cart.title')}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent>
                            <div className="hidden sm:grid grid-cols-6 text-sm font-semibold text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-700">
                                <p className="col-span-3">{t('cart.table.product')}</p>
                                <p className="text-center">{t('cart.table.quantity')}</p>
                                <p className="col-span-2 text-right">{t('cart.table.total')}</p>
                            </div>
                            {cart.map(item => <CartItemRow key={item.product.id} item={item} />)}
                        </CardContent>
                    </Card>
                </div>

                <div className="sticky top-28">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('cart.summary')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                <span>{t('cart.subtotal')}</span>
                                <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                <span>{t('cart.shipping')}</span>
                                <span className="font-semibold">₹{shipping.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-300 pb-4 border-b border-slate-200 dark:border-slate-700">
                                <span>{t('cart.tax')}</span>
                                <span className="font-semibold">₹{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-slate-800 dark:text-slate-100 font-bold text-xl">
                                <span>{t('cart.total')}</span>
                                <span>₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <Button className="w-full mt-4 text-lg" onClick={() => setActivePage('customer-checkout')}>
                                {t('cart.checkout')}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
             <style>{`.animate-fade-in { animation: fade-in 0.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};

export default CustomerCartPage;
