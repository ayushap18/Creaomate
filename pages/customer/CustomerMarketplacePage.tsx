import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useLocalization } from '../../hooks/useLocalization';
import type { Product, Role } from '../../types';

const CustomerMarketplacePage: React.FC = () => {
    const { t } = useLocalization();
    const { products, artisans, setSelectedProduct, toggleFavorite, isFavorite, setSelectedPortfolioUser } = useContext(AppContext)!;
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    
    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        const categoryIcons: Record<string, string> = {
            [t('categories.pottery')]: '🏺',
            [t('categories.textiles')]: '🧵',
            [t('categories.jewelry')]: '💍',
            [t('categories.homeDecor')]: '🛋️',
            [t('categories.paintings')]: '🎨',
            [t('categories.sarees')]: '🥻',
        };
        return uniqueCategories.map((cat: string) => ({ name: cat, icon: categoryIcons[cat] || '✨' }));
    }, [products, t]);

    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'All') {
            return products;
        }
        return products.filter(p => p.category === selectedCategory);
    }, [products, selectedCategory]);

    const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
        const favorite = isFavorite(product.id);
        const artisan = artisans.find(a => a.id === product.artisanId);

        const handleArtisanClick = (e: React.MouseEvent) => {
            e.stopPropagation(); // Prevent card's onClick from firing
            if (artisan) {
                setSelectedPortfolioUser(artisan);
            }
        };
        
        return (
            <Card className="p-0 overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col">
                <div className="relative overflow-hidden aspect-square cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                    <p className="text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:underline" onClick={handleArtisanClick}>by {artisan?.name || 'Unknown Artisan'}</p>
                    <div className="mt-auto pt-3">
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-50">₹{product.price.toLocaleString()}</p>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="relative h-[60vh] rounded-b-3xl overflow-hidden mb-16">
                <img src="https://images.hindustantimes.com/rf/image_size_630x354/HT/p2/2020/05/20/Pictures/_10059fa6-9a46-11ea-b5cf-22f71a9413fe.jpg" alt="Artisan craft" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                    <h1 className="text-5xl md:text-7xl font-bold">{t('customer.marketplace.heroTitle')}</h1>
                    <p className="mt-4 text-lg md:text-xl max-w-2xl">{t('customer.marketplace.heroSubtitle')}</p>
                    <Button className="mt-8 px-10 py-4 text-lg">{t('customer.marketplace.heroButton')}</Button>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Categories Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-8">{t('customer.marketplace.browseCategories')}</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-6 py-3 rounded-full font-semibold transition-colors ${selectedCategory === 'All' ? 'bg-teal-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm'}`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.name}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors ${selectedCategory === cat.name ? 'bg-teal-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm'}`}
                            >
                                <span className="text-xl">{cat.icon}</span>
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Products Section */}
                <section>
                    <h2 className="text-3xl font-bold text-center mb-8">{t('customer.marketplace.featuredProducts')}</h2>
                     {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
                        </div>
                    ) : (
                         <div className="text-center py-10">
                            <p className="text-slate-500 font-semibold text-lg">{t('marketplace.shop.noResults')}</p>
                            <p className="text-slate-400 mt-2">{t('marketplace.shop.noResultsHint')}</p>
                        </div>
                    )}
                </section>
            </div>
            <style>{`.animate-fade-in { animation: fade-in 0.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};

export default CustomerMarketplacePage;
