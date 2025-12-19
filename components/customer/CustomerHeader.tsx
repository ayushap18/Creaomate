import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { LogoIcon } from '../common/Icons';
import { useLocalization } from '../../hooks/useLocalization';
import Button from '../common/Button';
import type { Role } from '../../types';

const RoleSwitcher: React.FC = () => {
    const { currentUser, switchUserRole } = useContext(AppContext)!;

    if (!currentUser) return null;

    const roles: Role[] = ['artisan', 'volunteer', 'customer'];
    const otherRoles = roles.filter(r => r !== currentUser.role);

    const roleColors: Record<Role, string> = {
        artisan: 'text-teal-600 bg-teal-50 hover:bg-teal-100 dark:text-teal-400 dark:bg-teal-500/10 dark:hover:bg-teal-500/20',
        volunteer: 'text-sky-600 bg-sky-50 hover:bg-sky-100 dark:text-sky-400 dark:bg-sky-500/10 dark:hover:bg-sky-500/20',
        customer: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20',
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 hidden lg:inline">Switch View:</span>
            {otherRoles.map(role => (
                <Button 
                    key={role} 
                    onClick={() => switchUserRole(role)}
                    className={`!px-3 !py-1.5 text-xs sm:!px-4 sm:!py-2 sm:text-sm capitalize ${roleColors[role]}`}
                >
                    {role}
                </Button>
            ))}
        </div>
    );
};


const CustomerHeader: React.FC = () => {
    const { t } = useLocalization();
    const { cart, favorites, setActivePage, logout, products } = useContext(AppContext)!;
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);

    return (
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Left Section */}
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2 cursor-pointer" onClick={logout}>
                            <LogoIcon />
                            <span className="text-xl font-bold text-teal-600">ArtisanX</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-6">
                            <div className="relative">
                                <button
                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                    className="text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 font-semibold flex items-center"
                                >
                                    {t('customer.header.allProducts')}
                                    <svg className={`w-4 h-4 ml-1 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {isCategoryOpen && (
                                    <div className="absolute top-full mt-2 w-56 bg-white dark:bg-slate-700 rounded-lg shadow-lg py-2 z-50">
                                        {categories.map(cat => (
                                            <a href="#" key={cat} className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">{cat}</a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Center Section: Search (Hidden on small screens) */}
                    <div className="flex-1 px-8 lg:px-16 hidden sm:block">
                         <div className="relative">
                            <input
                                type="search"
                                placeholder={t('customer.header.searchPlaceholder')}
                                className="w-full bg-slate-100 dark:bg-slate-700 border-transparent rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <RoleSwitcher />
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 hidden sm:block"></div>
                        <button onClick={() => setActivePage('customer-chat')} className="p-3 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors relative">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </button>
                        <button onClick={() => setActivePage('customer-favorites')} className="p-3 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors relative">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                            {favorites.length > 0 && <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{favorites.length}</span>}
                        </button>
                         <button onClick={() => setActivePage('customer-cart')} className="p-3 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors relative">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartItemCount}</span>}
                        </button>
                        <div className="relative">
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-offset-2 ring-teal-500">
                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&q=80" alt="Profile" />
                            </button>
                            {isProfileOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-lg py-2 z-50">
                                    <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('customer-profile'); setIsProfileOpen(false); }} className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">{t('customer.header.profile')}</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('customer-orders'); setIsProfileOpen(false); }} className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">{t('customer.header.orders')}</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('customer-offers'); setIsProfileOpen(false); }} className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">{t('customer.header.offersAndRequests')}</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('customer-chat'); setIsProfileOpen(false); }} className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">{t('customer.header.messages')}</a>
                                    <div className="border-t border-slate-200 dark:border-slate-600 my-1"></div>
                                    <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">{t('customer.header.logout')}</a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default CustomerHeader;