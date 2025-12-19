import React, { useContext, useState } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { useLocalization } from '../../hooks/useLocalization';
import { AppContext } from '../../contexts/AppContext';
import Button from '../../components/common/Button';

const CustomerProfilePage: React.FC = () => {
    const { t, currentUser, setActivePage } = useContext(AppContext)!;
    
    const [name, setName] = useState(currentUser?.name || '');
    const [address, setAddress] = useState('123 Craft Lane');
    const [city, setCity] = useState('Artisanville');
    const [pincode, setPincode] = useState('12345');
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditing(false);
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 3000);
        // In a real app, you would call a function from context to update the user profile.
        // e.g., updateUserProfile({ name, address, city, pincode });
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
            <h1 className="text-4xl font-bold mb-8">{t('customer.header.profile')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <Card className="text-center p-8">
                         <img src={currentUser?.avatar} alt={currentUser?.name} className="w-32 h-32 rounded-full object-cover mx-auto ring-4 ring-offset-4 ring-teal-500 dark:ring-offset-slate-800" />
                         <h2 className="text-2xl font-bold mt-6">{currentUser?.name}</h2>
                         <p className="text-slate-500">{currentUser?.role === 'customer' ? 'Valued Customer' : ''}</p>
                    </Card>
                    <Card className="mt-8">
                        <CardContent className="p-6 space-y-2">
                             <Button variant="ghost" className="w-full justify-start" onClick={() => setActivePage('customer-orders')}>
                                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                My Orders
                            </Button>
                             <Button variant="ghost" className="w-full justify-start" onClick={() => setActivePage('customer-favorites')}>
                                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                                My Favorites
                            </Button>
                             <Button variant="ghost" className="w-full justify-start">
                                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Account Settings
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Profile Information</CardTitle>
                                {!isEditing && <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit</Button>}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="font-semibold block mb-2">Full Name</label>
                                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} disabled={!isEditing} className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 disabled:opacity-70 disabled:cursor-not-allowed"/>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="font-semibold block mb-2">Email Address</label>
                                        <input type="email" id="email" value={currentUser?.id.includes('@') ? currentUser.id : 'customer@example.com'} disabled className="w-full p-3 border rounded-lg bg-slate-100 dark:bg-slate-800 dark:border-slate-600 disabled:opacity-70 disabled:cursor-not-allowed"/>
                                    </div>
                                </div>
                                <hr className="dark:border-slate-700"/>
                                <div>
                                    <h4 className="font-bold mb-4 text-lg">Shipping Details</h4>
                                    <div className="space-y-4">
                                         <div>
                                            <label htmlFor="address" className="font-semibold block mb-2">Address</label>
                                            <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} disabled={!isEditing} className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 disabled:opacity-70 disabled:cursor-not-allowed"/>
                                        </div>
                                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="city" className="font-semibold block mb-2">City</label>
                                                <input type="text" id="city" value={city} onChange={e => setCity(e.target.value)} disabled={!isEditing} className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 disabled:opacity-70 disabled:cursor-not-allowed"/>
                                            </div>
                                            <div>
                                                <label htmlFor="pincode" className="font-semibold block mb-2">Pincode</label>
                                                <input type="text" id="pincode" value={pincode} onChange={e => setPincode(e.target.value)} disabled={!isEditing} className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 disabled:opacity-70 disabled:cursor-not-allowed"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {isEditing && (
                                    <div className="flex justify-end gap-4 pt-4">
                                        <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        <Button type="submit">Save Changes</Button>
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
            {showConfirmation && <div className="fixed bottom-5 right-5 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">Profile updated successfully!</div>}
            <style>{`.animate-fade-in { animation: fade-in 0.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};

export default CustomerProfilePage;