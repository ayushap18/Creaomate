import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useLocalization } from '../../hooks/useLocalization';
import { BargainRequest } from '../../types';

const CustomerOffersPage: React.FC = () => {
    const { t, currentUser, bargainRequests, products, addToCart, completeBargainRequest, setActivePage, connectionRequests, respondToConnectionRequest } = useContext(AppContext)!;
    const [justAddedId, setJustAddedId] = useState<string | null>(null);

    const myRequests = useMemo(() => {
        return bargainRequests.filter(req => req.customerId === currentUser?.id).sort((a,b) => b.requestDate?.toDate() - a.requestDate?.toDate());
    }, [bargainRequests, currentUser?.id]);
    
    const myConnectionRequests = useMemo(() => {
        return connectionRequests.filter(req => req.receiverId === currentUser?.id && req.status === 'pending');
    }, [connectionRequests, currentUser?.id]);

    const pending = myRequests.filter(r => r.status === 'pending');
    const accepted = myRequests.filter(r => r.status === 'accepted');
    const history = myRequests.filter(r => r.status === 'rejected' || r.status === 'completed');

    const handleAddToCart = (req: BargainRequest) => {
        const product = products.find(p => p.id === req.productId);
        if (product) {
            addToCart(product, req.offerPrice);
            completeBargainRequest(req.id);
            setJustAddedId(req.id);
            setTimeout(() => setJustAddedId(null), 2000);
        }
    };
    
    const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
        const styles: { [key: string]: string } = {
            accepted: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
            completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        };
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);
        return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status] || 'bg-slate-100 text-slate-800'}`}>{statusText}</span>;
    };

    const OfferCard: React.FC<{ req: BargainRequest }> = ({ req }) => {
        return (
            <Card className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img src={req.productImage} alt={req.productName} className="w-24 h-24 rounded-lg object-cover" />
                <div className="flex-1">
                    <h4 className="font-bold">{req.productName}</h4>
                    <p className="text-sm text-slate-500">Original: <span className="line-through">₹{req.originalPrice.toLocaleString()}</span></p>
                    <p className="font-semibold text-teal-600">Your Offer: ₹{req.offerPrice.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <StatusBadge status={req.status} />
                    {req.status === 'accepted' && (
                        <Button onClick={() => handleAddToCart(req)} disabled={justAddedId === req.id}>
                            {justAddedId === req.id ? t('cart.added') : t('marketplace.shop.addToCart')}
                        </Button>
                    )}
                </div>
            </Card>
        );
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
            <h1 className="text-4xl font-bold mb-8">{t('customer.header.offersAndRequests')}</h1>

            {myRequests.length === 0 && myConnectionRequests.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold">You haven't made any offers or requests yet.</h2>
                    <p className="mt-2 text-slate-500">Find something you love and make an offer or connect with an artisan!</p>
                    <Button onClick={() => setActivePage('customer-marketplace')} className="mt-8">Browse Products</Button>
                </div>
            ) : (
                <div className="space-y-12">
                    {myConnectionRequests.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Connection Requests</h2>
                            <div className="space-y-4">
                                {myConnectionRequests.map(req => (
                                    <Card key={req.id} className="p-4 flex flex-col sm:flex-row items-center gap-4">
                                        <img src={req.senderAvatar} alt={req.senderName} className="w-16 h-16 rounded-full object-cover" />
                                        <div className="flex-1 text-center sm:text-left">
                                            <p><span className="font-bold">{req.senderName}</span> wants to connect with you.</p>
                                            <p className="text-sm text-slate-500 capitalize">{t(`roles.${req.senderRole}`)}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="primary" onClick={() => respondToConnectionRequest(req, 'accepted')}>Accept</Button>
                                            <Button variant="secondary" onClick={() => respondToConnectionRequest(req, 'rejected')}>Reject</Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}

                    {accepted.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Accepted Offers</h2>
                            <div className="space-y-4">
                                {accepted.map(req => <OfferCard key={req.id} req={req} />)}
                            </div>
                        </section>
                    )}

                    {pending.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Pending Offers</h2>
                            <div className="space-y-4">
                                {pending.map(req => <OfferCard key={req.id} req={req} />)}
                            </div>
                        </section>
                    )}

                    {history.length > 0 && (
                         <section>
                            <h2 className="text-2xl font-bold mb-4">Offer History</h2>
                            <div className="space-y-4">
                                {history.map(req => <OfferCard key={req.id} req={req} />)}
                            </div>
                        </section>
                    )}
                </div>
            )}
            <style>{`.animate-fade-in { animation: fade-in 0.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};

export default CustomerOffersPage;