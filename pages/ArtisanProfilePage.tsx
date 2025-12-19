import React, { useContext, useRef } from 'react';
import { AppContext } from '../contexts/AppContext';
import type { Artisan, Product } from '../types';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
    artisan: Artisan;
}

const ArtisanProfilePage: React.FC<Props> = ({ artisan }) => {
    const { t } = useLocalization();
    const { 
        products, 
        setSelectedPortfolioUser, 
        startChat, 
        currentUser, 
        updateUserProfile, 
        setSelectedProduct,
        connectionRequests,
        sendConnectionRequest
    } = useContext(AppContext)!;
    
    const isOwnProfile = currentUser?.id === artisan.id;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const artisanProducts = products.filter(p => p.artisanId === artisan.id);
    
    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newAvatar = reader.result as string;
                updateUserProfile({ avatar: newAvatar });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleProductClick = (product: Product) => {
        setSelectedPortfolioUser(null);
        setTimeout(() => {
            setSelectedProduct(product);
        }, 50);
    };
    
    const ConnectButton: React.FC = () => {
        if (isOwnProfile) return null;

        const existingRequest = connectionRequests.find(
            req => (req.senderId === currentUser?.id && req.receiverId === artisan.id) || (req.senderId === artisan.id && req.receiverId === currentUser?.id)
        );

        if (existingRequest) {
            if (existingRequest.status === 'accepted') {
                return <Button onClick={() => startChat(artisan)} className="w-full sm:w-auto px-8">{t('profile.message')}</Button>;
            }
            if (existingRequest.status === 'pending' && existingRequest.senderId === currentUser?.id) {
                return <Button disabled className="w-full sm:w-auto px-8">{t('profile.requestSent')}</Button>;
            }
        }
        
        return <Button onClick={() => sendConnectionRequest(artisan)} className="w-full sm:w-auto px-8">{t('profile.connect')}</Button>;
    };

    return (
        <div className="animate-fadeInUp">
            <Button variant="secondary" onClick={() => setSelectedPortfolioUser(null)} className="mb-6">
                &larr; {t('profile.back')}
            </Button>

            {/* Hero Section */}
            <div className="relative h-72 rounded-3xl overflow-hidden mb-[-8rem]">
                <img src={artisanProducts[0]?.image || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwFtGM9yvqXs3horfgXSPe4EiOSGi_BxuJEA&s'} alt={`${artisan.name}'s work`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            {/* Header Card */}
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="p-8 flex flex-col sm:flex-row items-center gap-8">
                    <div className="relative w-40 h-40 flex-shrink-0 -mt-28 sm:-mt-24">
                        <img src={artisan.avatar} alt={artisan.name} className="w-full h-full object-cover rounded-full ring-8 ring-white dark:ring-slate-800" />
                        {isOwnProfile && (
                            <>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-2 right-2 w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white hover:bg-teal-700 transition-transform transform hover:scale-110 shadow-md border-2 border-white dark:border-slate-800"
                                    aria-label="Upload new profile picture"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </button>
                            </>
                        )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">{artisan.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold mt-1">{artisan.location}</p>
                    </div>
                    <ConnectButton />
                </Card>
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
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
                                       <h3 className="text-white font-bold text-lg">{product.name}</h3>
                                   </div>
                               </div>
                            ))}
                         </div>
                    </div>
                </Card>
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

export default ArtisanProfilePage;