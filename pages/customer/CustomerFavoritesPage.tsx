import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useLocalization } from '../../hooks/useLocalization';
import type { Product } from '../../types';

const CustomerFavoritesPage: React.FC = () => {
    const { t } = useLocalization();
    const { products, favorites, artisans, setSelectedProduct, toggleFavorite, isFavorite, setActivePage } = useContext(AppContext)!;

    const favoriteProducts = products.filter(p => favorites.includes(p.id));

    const getArtisanName = (artisanId: string) => {
        return artisans.find(a => a.id === artisanId)?.name || 'Unknown Artisan';
    };

    const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
        const favorite = isFavorite(product.id);
        
        return (
            <Card className="p-0 overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col">
                <div className="relative overflow-hidden aspect-square cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                </div>
                <button 
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-slate-800/80 rounded-full backdrop-blur-sm transition-colors hover:bg-white dark:hover:bg-slate-700 z-10"
                >
                    <svg className={`w-6 h-6 ${favorite ? 'text-red-500' : 'text-slate-400'}`} fill={favorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                    </svg>
                </button>
                <div className="p-5 flex-grow flex flex-col">
                    <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">{product.category}</p>
                    <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 mt-1 truncate cursor-pointer" onClick={() => setSelectedProduct(product)}>{product.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">by {getArtisanName(product.artisanId)}</p>
                    <div className="mt-auto pt-3">
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-50">₹{product.price.toLocaleString()}</p>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
            <h1 className="text-4xl font-bold mb-8">{t('customer.favorites.title')}</h1>

            {favoriteProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {favoriteProducts.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
            ) : (
                <div className="text-center py-20">
                    <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                    <h2 className="mt-6 text-2xl font-bold text-slate-800 dark:text-slate-100">{t('customer.favorites.empty')}</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">{t('customer.favorites.emptyDescription')}</p>
                    <Button onClick={() => setActivePage('customer-marketplace')} className="mt-8">{t('customer.favorites.browse')}</Button>
                </div>
            )}
            <style>{`.animate-fade-in { animation: fade-in 0.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};

export default CustomerFavoritesPage;