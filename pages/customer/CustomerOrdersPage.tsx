import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useLocalization } from '../../hooks/useLocalization';

const CustomerOrdersPage: React.FC = () => {
    const { t, setActivePage } = useContext(AppContext)!;

    // Mock data for demonstration
    const orders = [
        { id: 'AA-12345', date: '2024-07-15', total: 4300, status: 'Delivered', items: ['Azure Blue Vase', 'Silver Filigree Earrings'] },
        { id: 'AA-12321', date: '2024-07-10', total: 4950, status: 'Shipped', items: ['Indigo Ajrakh Shawl'] },
        { id: 'AA-12298', date: '2024-07-05', total: 950, status: 'Processing', items: ['Terracotta Serving Bowl'] },
    ];
    
    const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
        const styles: { [key: string]: string } = {
            Delivered: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            Shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            Processing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
            Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        };
        return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status] || 'bg-slate-100 text-slate-800'}`}>{status}</span>;
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
            <h1 className="text-4xl font-bold mb-8">My Orders</h1>

            {orders.length > 0 ? (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                            {orders.map(order => (
                                <div key={order.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="font-bold text-lg text-teal-600 dark:text-teal-400">Order #{order.id}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Placed on {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{order.items.join(', ')}</p>
                                    </div>
                                    <div className="flex items-center gap-6 text-right w-full sm:w-auto">
                                        <div className="flex-1 sm:flex-none sm:w-28">
                                            <p className="text-lg font-bold">₹{order.total.toLocaleString()}</p>
                                        </div>
                                        <div className="sm:w-28 flex justify-end">
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <Button variant="ghost" className="hidden sm:block">View Details</Button>
                                    </div>
                                    <Button variant="ghost" className="sm:hidden w-full mt-2">View Details</Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-20">
                    <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    <h2 className="mt-6 text-2xl font-bold text-slate-800 dark:text-slate-100">No Orders Yet</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">You haven't placed any orders yet. Let's change that!</p>
                    <Button onClick={() => setActivePage('customer-marketplace')} className="mt-8">Start Shopping</Button>
                </div>
            )}
            <style>{`.animate-fade-in { animation: fade-in 0.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};

export default CustomerOrdersPage;
