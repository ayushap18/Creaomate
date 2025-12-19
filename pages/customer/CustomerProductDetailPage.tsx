import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../../contexts/AppContext';
import type { Product, Artisan, Certificate } from '../../types';
import Button from '../../components/common/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { useLocalization } from '../../hooks/useLocalization';
import DigitalCertificate from '../../components/common/DigitalCertificate';
import { editImageWithAI } from '../../services/geminiService';

interface Props {
    product: Product;
    artisan?: Artisan;
}

const CustomerProductDetailPage: React.FC<Props> = ({ product, artisan }) => {
    const { t } = useLocalization();
    const { 
        setSelectedProduct, 
        toggleFavorite, 
        isFavorite, 
        startChat, 
        setSelectedPortfolioUser,
        createBargainRequest,
        bargainRequests,
        currentUser,
        connectionRequests,
        sendConnectionRequest,
        setActivePage,
        getCertificate,
    } = useContext(AppContext)!;

    const minOffer = Math.round(product.price * 0.7);
    const [offerPrice, setOfferPrice] = useState(product.price);
    const [offerSent, setOfferSent] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [fetchedCertificateData, setFetchedCertificateData] = useState<Certificate | null>(null);

    const favorite = isFavorite(product.id);
    
    const existingOffer = useMemo(() => {
        return bargainRequests.find(req => req.productId === product.id && req.customerId === currentUser?.id && (req.status === 'pending' || req.status === 'accepted'));
    }, [bargainRequests, product.id, currentUser?.id]);

    // AI Stylist State
    const [isStylistOpen, setIsStylistOpen] = useState(false);
    const [stylistStep, setStylistStep] = useState<'select' | 'generating' | 'result'>('select');
    const [styledImageUrl, setStyledImageUrl] = useState<string | null>(null);
    const [stylistError, setStylistError] = useState<string | null>(null);
    
    useEffect(() => {
        setOfferPrice(product.price); // Reset price when product changes
        setOfferSent(false);
    }, [product]);

    const handleMakeOffer = async () => {
        await createBargainRequest(product, offerPrice);
        setOfferSent(true);
    };
    
    const handleMessageArtisan = () => {
        if (!artisan) return;
        startChat({ id: artisan.id, name: artisan.name, avatar: artisan.avatar });
    };

    const handleViewCertificate = async () => {
        if (product.certificateId) {
            const cert = await getCertificate(product.certificateId);
            if (cert) {
                // Convert Firestore Timestamp to Date if it's not already
                const certWithDate = {
                    ...cert,
                    certifiedDate: cert.certifiedDate?.toDate ? cert.certifiedDate.toDate() : new Date(cert.certifiedDate),
                };
                setFetchedCertificateData(certWithDate);
                setShowCertificate(true);
            } else {
                alert("Certificate details could not be found.");
            }
        }
    };

    // Helper function to convert image URL to Base64
    const imageUrlToBase64 = async (url: string): Promise<{b64: string, mime: string}> => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = (reader.result as string).split(',')[1];
                resolve({ b64: base64data, mime: blob.type });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleStyleSelect = async (style: 'minimalist' | 'bohemian' | 'extravagant' | 'classic') => {
        setStylistStep('generating');
        setStylistError(null);
        
        try {
            const { b64, mime } = await imageUrlToBase64(product.image);
            const prompt = t(`customer.product.aiStylist.styles.${style}.prompt`, { productName: product.name });
            const resultParts = await editImageWithAI(b64, mime, prompt);
            
            const imagePart = resultParts.find(part => part.inlineData);
            if (imagePart && imagePart.inlineData) {
                setStyledImageUrl(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
                setStylistStep('result');
            } else {
                throw new Error("No image data returned from AI.");
            }

        } catch (error: any) {
            console.error("AI Stylist Error:", error);
            if (error.message === "QUOTA_EXCEEDED") {
                setStylistError(t('common.error.quota'));
            } else {
                setStylistError(t('customer.product.aiStylist.error'));
            }
            setStylistStep('select'); // Go back to selection on error
        }
    };
    
    const handleCloseStylist = () => {
        setIsStylistOpen(false);
        // Delay resetting state to allow for closing animation
        setTimeout(() => {
            setStylistStep('select');
            setStyledImageUrl(null);
            setStylistError(null);
        }, 300);
    };
    
    const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    );

    const ConnectButton: React.FC = () => {
        if (!artisan || !currentUser || artisan.id === currentUser.id) return null;
    
        const existingRequest = connectionRequests.find(
            req => (req.senderId === currentUser.id && req.receiverId === artisan.id) || (req.senderId === artisan.id && req.receiverId === currentUser.id)
        );
    
        if (existingRequest) {
            if (existingRequest.status === 'accepted') {
                return <Button variant="ghost" onClick={handleMessageArtisan} className="flex-1">{t('profile.message')}</Button>;
            }
            if (existingRequest.status === 'pending') {
                 if(existingRequest.senderId === currentUser.id) {
                    return <Button variant="ghost" disabled className="flex-1">{t('profile.requestSent')}</Button>;
                 }
                 return <Button variant="ghost" onClick={() => setActivePage('customer-offers')} className="flex-1">{t('profile.respondToRequest')}</Button>;
            }
        }
    
        return <Button variant="ghost" onClick={() => sendConnectionRequest(artisan)} className="flex-1">{t('profile.connect')}</Button>;
    };

    const AIStylistModal: React.FC = () => (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <Card className="w-full max-w-4xl transform transition-all duration-300 scale-95 animate-slide-up">
                 <CardHeader className="flex items-center justify-between">
                    <CardTitle>{t('customer.product.aiStylist.title')}</CardTitle>
                    <button onClick={handleCloseStylist} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                 </CardHeader>
                 <CardContent>
                    {stylistStep === 'select' && (
                        <div>
                             <p className="text-slate-600 dark:text-slate-300 mb-6">{t('customer.product.aiStylist.description')}</p>
                             {stylistError && <p className="text-red-500 mb-4">{stylistError}</p>}
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {(['minimalist', 'bohemian', 'extravagant', 'classic'] as const).map(style => (
                                    <button key={style} onClick={() => handleStyleSelect(style)} className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 text-center transition-all">
                                        <h4 className="font-bold text-lg">{t(`customer.product.aiStylist.styles.${style}.name`)}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t(`customer.product.aiStylist.styles.${style}.description`)}</p>
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}
                    {stylistStep === 'generating' && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <svg className="animate-spin h-10 w-10 text-teal-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-slate-600 dark:text-slate-300 font-medium">{t('customer.product.aiStylist.generating')}</p>
                        </div>
                    )}
                    {stylistStep === 'result' && (
                        <div>
                             <h3 className="text-xl font-bold text-center mb-4">{t('customer.product.aiStylist.resultTitle')}</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-center mb-2">Original</h4>
                                    <img src={product.image} alt="Original" className="rounded-lg w-full aspect-square object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-center mb-2">Styled</h4>
                                    <img src={styledImageUrl!} alt="Styled" className="rounded-lg w-full aspect-square object-cover" />
                                </div>
                             </div>
                             <div className="text-center mt-6">
                                <Button variant="secondary" onClick={() => setStylistStep('select')}>{t('common.cancel')}</Button>
                             </div>
                        </div>
                    )}
                 </CardContent>
            </Card>
            <style>{`
                @keyframes slide-up { from { transform: translateY(20px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );

    return (
        <>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
             <Button variant="secondary" onClick={() => setSelectedProduct(null)} className="mb-6">
                &larr; {t('customer.product.backToShop')}
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Side: Image */}
                <div>
                    <Card className="p-0 sticky top-28">
                        <img src={product.image} alt={product.name} className="w-full h-auto object-cover rounded-2xl aspect-square" />
                    </Card>
                </div>

                {/* Right Side: Details */}
                <div className="space-y-8">
                    <Card>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-teal-600 dark:text-teal-400 font-semibold">{product.category}</p>
                                <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">{product.name}</h1>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-lg">{product.longDescription}</p>
                            
                            {/* Bargaining Section */}
                            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                                <h3 className="font-bold text-lg">{t('customer.product.bargainTitle')}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('customer.product.bargainDescription', { price: `₹${product.price.toLocaleString()}`})}</p>
                                <div className="mt-4">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>₹{minOffer.toLocaleString()}</span>
                                        <span className="font-bold text-teal-600 text-xl">
                                            {t('customer.product.yourOffer')}: ₹{offerPrice.toLocaleString()}
                                        </span>
                                        <span>₹{product.price.toLocaleString()}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={minOffer}
                                        max={product.price}
                                        value={offerPrice}
                                        onChange={(e) => setOfferPrice(Number(e.target.value))}
                                        className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer range-lg accent-teal-500 mt-2"
                                        disabled={!!existingOffer || offerSent}
                                    />
                                </div>
                            </div>

                             <div className="flex flex-col space-y-4 pt-4">
                                <Button
                                  onClick={() => setIsStylistOpen(true)}
                                  variant="primary"
                                  className="w-full text-lg bg-gradient-to-br from-purple-500 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/40 focus:ring-purple-400"
                                >
                                  <SparklesIcon className="w-6 h-6 mr-3" />
                                  {t('customer.product.aiStylist.button')}
                                </Button>
                                <div className="flex items-center space-x-4">
                                  <Button onClick={handleMakeOffer} className="flex-1 text-lg" disabled={!!existingOffer || offerSent}>
                                      {existingOffer ? 'Offer Pending' : (offerSent ? 'Offer Sent!' : 'Make Offer')}
                                  </Button>
                                  <Button variant="secondary" onClick={() => toggleFavorite(product.id)} className="p-4">
                                      <svg className={`w-6 h-6 ${favorite ? 'text-red-500' : 'text-slate-500'}`} fill={favorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                                      </svg>
                                  </Button>
                                </div>
                             </div>
                        </CardContent>
                    </Card>

                    {artisan && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('customer.product.meetArtisan')}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center gap-6">
                                <img src={artisan.avatar} alt={artisan.name} className="w-24 h-24 rounded-full flex-shrink-0" />
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold">{artisan.name}</h3>
                                    <p className="text-md text-slate-500 font-semibold">{artisan.location}</p>
                                    <p className="mt-2 text-slate-600 dark:text-slate-300 italic">"{artisan.bio}"</p>
                                </div>
                            </CardContent>
                            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
                                <Button variant="secondary" onClick={() => setSelectedPortfolioUser(artisan)} className="flex-1">
                                    {t('dashboard.viewProfile')}
                                </Button>
                                <ConnectButton />
                            </div>
                        </Card>
                    )}
                    
                    {product.certificateId && (
                        <Card>
                            <CardHeader><CardTitle>{t('customer.product.authenticity')}</CardTitle></CardHeader>
                            <CardContent className="text-center">
                            <p className="text-slate-600 dark:text-slate-300 mb-4">This item includes a digital certificate of authenticity to verify its origin and craftsmanship.</p>
                            <Button variant="secondary" onClick={handleViewCertificate}>{t('customer.product.viewCertificate')}</Button>
                            </CardContent>
                        </Card>
                    )}

                </div>
            </div>
             <style>{`.animate-fade-in { animation: fade-in 0.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
        {showCertificate && fetchedCertificateData && (
            <DigitalCertificate data={fetchedCertificateData} onClose={() => { setShowCertificate(false); setFetchedCertificateData(null); }} />
        )}
        {isStylistOpen && <AIStylistModal />}
        </>
    );
};

export default CustomerProductDetailPage;