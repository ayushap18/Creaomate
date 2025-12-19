import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import CustomerHeader from '../components/customer/CustomerHeader';
import CustomerMarketplacePage from './customer/CustomerMarketplacePage';
import CustomerProductDetailPage from './customer/CustomerProductDetailPage';
import CustomerCartPage from './customer/CustomerCartPage';
import CustomerFavoritesPage from './customer/CustomerFavoritesPage';
import CustomerProfilePage from './customer/CustomerProfilePage';
import CustomerCheckoutPage from './customer/CustomerCheckoutPage';
import CustomerOrdersPage from './customer/CustomerOrdersPage';
import CustomerOffersPage from './customer/CustomerOffersPage';
import ChatPage from './ChatPage';
import CustomerArtisanProfilePage from './customer/CustomerArtisanProfilePage';
import type { Artisan, Notification } from '../types';

const CustomerApp: React.FC = () => {
    const { activePage, selectedProduct, artisans, selectedPortfolioUser, firestoreError, notifications, removeNotification, setActivePage } = useContext(AppContext)!;
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        if (firestoreError) {
            setShowError(true);
        }
    }, [firestoreError]);

    const NotificationToast: React.FC<{ notification: Notification, onClose: (id: string) => void }> = ({ notification, onClose }) => {
        const icons = {
            success: <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            info: <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            error: <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        };

        return (
            <div className="max-w-sm w-full bg-white dark:bg-slate-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black dark:ring-white/10 ring-opacity-5 overflow-hidden animate-fade-in-right">
                <div className="p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            {icons[notification.type]}
                        </div>
                        <div className="ml-3 w-0 flex-1 pt-0.5">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{notification.message}</p>
                            <div className="mt-2">
                                <button
                                    onClick={() => setActivePage('customer-offers')}
                                    className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500"
                                >
                                    View My Offers
                                </button>
                            </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button onClick={() => onClose(notification.id)} className="bg-white dark:bg-slate-800 rounded-md inline-flex text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                                <span className="sr-only">Close</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        // Artisan Profile view has top priority for customers
        if (selectedPortfolioUser && selectedPortfolioUser.role === 'artisan') {
            return <CustomerArtisanProfilePage artisan={selectedPortfolioUser as Artisan} />;
        }

        // The product detail page is a special case that overrides the activePage
        if (selectedProduct) {
            const artisan = artisans.find(a => a.id === selectedProduct.artisanId);
            return <CustomerProductDetailPage product={selectedProduct} artisan={artisan} />;
        }
        
        switch (activePage) {
            case 'customer-cart':
                return <CustomerCartPage />;
            case 'customer-favorites':
                return <CustomerFavoritesPage />;
            case 'customer-profile':
                return <CustomerProfilePage />;
            case 'customer-checkout':
                return <CustomerCheckoutPage />;
            case 'customer-orders':
                return <CustomerOrdersPage />;
            case 'customer-offers':
                return <CustomerOffersPage />;
            case 'customer-chat':
                return <ChatPage />;
            // The default is the marketplace
            case 'customer-marketplace':
            default:
                return <CustomerMarketplacePage />;
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200">
            <CustomerHeader />
            {/* Notification Container */}
            <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50 mt-20">
                <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                    {notifications.map((notification) => (
                        <NotificationToast key={notification.id} notification={notification} onClose={removeNotification} />
                    ))}
                </div>
            </div>
            {showError && (
                <div className="bg-amber-500 text-white text-sm flex items-center justify-between p-3 sticky top-20 z-30 shadow-md">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        <span>{firestoreError}</span>
                    </div>
                    <button onClick={() => setShowError(false)} className="p-1 rounded-full hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Dismiss">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            )}
            <main>
                {renderContent()}
            </main>
            <style>{`
                @keyframes fade-in-right {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-right { animation: fade-in-right 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default CustomerApp;