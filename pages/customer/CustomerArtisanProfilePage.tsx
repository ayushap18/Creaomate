import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import type { Artisan, Product } from '../../types';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useLocalization } from '../../hooks/useLocalization';

interface Props {
    artisan: Artisan;
}

const CustomerArtisanProfilePage: React.FC<Props> = ({ artisan }) => {
    const { t } = useLocalization();
    const { products, setSelectedProduct, setSelectedPortfolioUser, startChat, setActivePage, currentUser, connectionRequests, sendConnectionRequest } = useContext(AppContext)!;

    const artisanProducts = products.filter(p => p.artisanId === artisan.id);
    
    const handleMessageArtisan = () => {
        startChat({ id: artisan.id, name: artisan.name, avatar: artisan.avatar });
    };

    const handleProductClick = (product: Product) => {
        setSelectedPortfolioUser(null); // Hide artisan profile
        // Use a small timeout to ensure the state updates aren't jarring
        setTimeout(() => {
            setSelectedProduct(product);
        }, 50);
    };

    const ConnectOrMessageButton: React.FC = () => {
        if (!currentUser) return null;
    
        const existingRequest = connectionRequests.find(
            req => (req.senderId === currentUser.id && req.receiverId === artisan.id) || (req.senderId === artisan.id && req.receiverId === currentUser.id)
        );
    
        if (existingRequest) {
            if (existingRequest.status === 'accepted') {
                return <Button onClick={handleMessageArtisan} className="w-full sm:w-auto px-8">{t('profile.message')}</Button>;
            }
            if (existingRequest.status === 'pending') {
                if (existingRequest.senderId === currentUser.id) {
                    return <Button disabled className="w-full sm:w-auto px-8">{t('profile.requestSent')}</Button>;
                }
                return <Button onClick={() => setActivePage('customer-offers')} className="w-full sm:w-auto px-8">{t('profile.respondToRequest')}</Button>;
            }
        }
        
        return <Button onClick={() => sendConnectionRequest(artisan)} className="w-full sm:w-auto px-8">{t('profile.connect')}</Button>;
    };

    return (
        <div className="animate-fadeInUp bg-slate-100 dark:bg-slate-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Button variant="secondary" onClick={() => setSelectedPortfolioUser(null)} className="mb-6">
                    &larr; {t('customer.product.backToShop')}
                </Button>

                {/* Hero Section */}
                <div className="relative h-72 rounded-3xl overflow-hidden mb-[-8rem]">
                    <img src={artisanProducts[0]?.image || 'https://picsum.photos/seed/artisan-hero/1200/400'} alt={`${artisan.name}'s work`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Header Card */}
                <div className="relative">
                    <Card className="p-8 flex flex-col sm:flex-row items-center gap-8">
                        <img src={artisan.avatar} alt={artisan.name} className="w-40 h-40 rounded-full object-cover ring-8 ring-white dark:ring-slate-800 -mt-28 sm:-mt-24 flex-shrink-0" />
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">{artisan.name}</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-1">{artisan.location}</p>
                        </div>
                        <ConnectOrMessageButton />
                    </Card>
                </div>
                
                <div className="mt-8 space-y-8">
                    {/* About and Story Section */}
                    <Card>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
                            <div className="md:col-span-1">
                                <h2 className="text-2xl font-bold mb-4">{t('profile.artisan.about')}</h2>
                                <p className="text-slate-600 dark:text-slate-300 italic">{artisan.bio}</p>
                            </div>
                            <div className="md:col-span-2">
                                <h2 className="text-2xl font-bold mb-4">{t('profile.artisan.story')}</h2>
                                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{artisan.story}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Story Video Section */}
                    <Card>
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-center mb-6">{t('profile.artisan.storyVideo')}</h2>
                            <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden shadow-lg">
                            <video controls src={artisan.storyVideoUrl} className="w-full h-full" poster={artisanProducts[1]?.image || ''} />
                            </div>
                        </div>
                    </Card>

                    {/* Gallery Section */}
                    <Card>
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-center mb-6">{t('profile.artisan.gallery')}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {artisanProducts.map(product => (
                                <div key={product.id} className="group relative rounded-xl overflow-hidden cursor-pointer" onClick={() => handleProductClick(product)}>
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover aspect-square group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                                        <div>
                                            <h3 className="text-white font-bold text-lg">{product.name}</h3>
                                            <p className="text-white/80 font-semibold">₹{product.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default CustomerArtisanProfilePage;