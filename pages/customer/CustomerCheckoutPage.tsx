import React, { useContext, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';

const CustomerCheckoutPage: React.FC = () => {
    const { cart, t, setActivePage } = useContext(AppContext)!;
    const [orderPlaced, setOrderPlaced] = useState(false);

    const subtotal = cart.reduce((sum, item) => sum + item.offerPrice * item.quantity, 0);
    const shipping = subtotal > 0 ? 150 : 0;
    const tax = subtotal * 0.12;
    const total = subtotal + shipping + tax;

    const handlePlaceOrder = (e: React.FormEvent) => {
        e.preventDefault();
        setOrderPlaced(true);
    };

    if (orderPlaced) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-fade-in">
                 <div className="w-20 h-20 mx-auto bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <h1 className="text-4xl font-bold mt-6">{t('customer.checkout.orderPlaced')}</h1>
                 <p className="text-slate-500 mt-2">{t('customer.checkout.orderPlacedMsg')}</p>
                 <Button onClick={() => setActivePage('customer-marketplace')} className="mt-8">{t('cart.continueShopping')}</Button>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
            <h1 className="text-4xl font-bold mb-8">{t('customer.checkout.title')}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <form onSubmit={handlePlaceOrder} className="space-y-8">
                        <Card>
                            <CardHeader><CardTitle>{t('customer.checkout.shipping')}</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label htmlFor="fullName" className="font-semibold block mb-2">{t('customer.checkout.fullName')}</label>
                                    <input type="text" id="fullName" required className="w-full p-3 border border-slate-300 rounded-xl dark:bg-slate-700 dark:border-slate-600"/>
                                </div>
                                <div className="col-span-2">
                                    <label htmlFor="address" className="font-semibold block mb-2">{t('customer.checkout.address')}</label>
                                    <input type="text" id="address" required className="w-full p-3 border border-slate-300 rounded-xl dark:bg-slate-700 dark:border-slate-600"/>
                                </div>
                                <div>
                                    <label htmlFor="city" className="font-semibold block mb-2">{t('customer.checkout.city')}</label>
                                    <input type="text" id="city" required className="w-full p-3 border border-slate-300 rounded-xl dark:bg-slate-700 dark:border-slate-600"/>
                                </div>
                                <div>
                                    <label htmlFor="pincode" className="font-semibold block mb-2">{t('customer.checkout.pincode')}</label>
                                    <input type="text" id="pincode" required className="w-full p-3 border border-slate-300 rounded-xl dark:bg-slate-700 dark:border-slate-600"/>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader><CardTitle>{t('customer.checkout.payment')}</CardTitle></CardHeader>
                             <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label htmlFor="cardNumber" className="font-semibold block mb-2">{t('customer.checkout.cardNumber')}</label>
                                    <input type="text" id="cardNumber" placeholder="•••• •••• •••• ••••" required className="w-full p-3 border border-slate-300 rounded-xl dark:bg-slate-700 dark:border-slate-600"/>
                                </div>
                                <div>
                                    <label htmlFor="expiry" className="font-semibold block mb-2">{t('customer.checkout.expiry')}</label>
                                    <input type="text" id="expiry" placeholder="MM/YY" required className="w-full p-3 border border-slate-300 rounded-xl dark:bg-slate-700 dark:border-slate-600"/>
                                </div>
                                <div>
                                    <label htmlFor="cvc" className="font-semibold block mb-2">{t('customer.checkout.cvc')}</label>
                                    <input type="text" id="cvc" placeholder="•••" required className="w-full p-3 border border-slate-300 rounded-xl dark:bg-slate-700 dark:border-slate-600"/>
                                </div>
                            </CardContent>
                        </Card>
                         <Button type="submit" className="w-full text-lg">
                            {t('customer.checkout.placeOrder')}
                        </Button>
                    </form>
                </div>

                <div className="sticky top-28">
                    <Card>
                        <CardHeader><CardTitle>{t('cart.summary')}</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             {cart.map(item => (
                                <div key={item.product.id} className="flex justify-between items-center text-sm">
                                    <span className="truncate pr-4">{item.product.name} x {item.quantity}</span>
                                    <span className="font-semibold">₹{(item.offerPrice * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4 space-y-2">
                                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                    <span>{t('cart.subtotal')}</span>
                                    <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                    <span>{t('cart.shipping')}</span>
                                    <span className="font-semibold">₹{shipping.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                    <span>{t('cart.tax')}</span>
                                    <span className="font-semibold">₹{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-slate-800 dark:text-slate-100 font-bold text-xl pt-4 border-t border-slate-200 dark:border-slate-700">
                                <span>{t('cart.total')}</span>
                                <span>₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
             <style>{`.animate-fade-in { animation: fade-in 0.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};

export default CustomerCheckoutPage;
