import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import type { CrowdfundCampaign } from '../types';
import { useLocalization } from '../hooks/useLocalization';

const newImages = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6kaGFdq7VUXUQlDXz5UI5--6dfQW76OX3Bw&s',
    'https://images.hindustantimes.com/rf/image_size_630x354/HT/p2/2020/05/20/Pictures/_10059fa6-9a46-11ea-b5cf-22f71a9413fe.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwFtGM9yvqXs3horfgXSPe4EiOSGi_BxuJEA&s',
];

const CrowdfundCard: React.FC<{ campaign: CrowdfundCampaign }> = ({ campaign }) => {
    const { t } = useLocalization();
    const progress = (campaign.raised / campaign.goal) * 100;
    return (
        <Card className="p-0 overflow-hidden group">
            <div className="overflow-hidden">
                <img src={campaign.image} alt={campaign.title} className="rounded-t-2xl w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"/>
            </div>
            <CardContent className="p-6">
                <h4 className="font-bold text-lg mb-2 truncate">{campaign.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 h-10">{campaign.description}</p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-2">
                    <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-3 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-sm mt-3">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">₹{campaign.raised.toLocaleString()} {t('finance.raised')}</span>
                    <span className="text-slate-500 dark:text-slate-400">{t('finance.of')} ₹{campaign.goal.toLocaleString()}</span>
                </div>
            </CardContent>
        </Card>
    );
};

const FinancePage: React.FC = () => {
    const { t } = useLocalization();
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [newCampaignData, setNewCampaignData] = useState({ title: '', goal: '', description: '' });
    const [imagePreview, setImagePreview] = useState<string>('');
    
    const initialCampaigns: CrowdfundCampaign[] = [
      {
        id: 1,
        title: t('finance.campaign1.title'),
        goal: 150000,
        raised: 95000,
        image: newImages[0],
        description: t('finance.campaign1.description')
      },
      {
        id: 2,
        title: t('finance.campaign2.title'),
        goal: 60000,
        raised: 45000,
        image: newImages[1],
        description: t('finance.campaign2.description')
      },
    ];

    const [campaigns, setCampaigns] = useState<CrowdfundCampaign[]>(initialCampaigns);

    const handleNewCampaignChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewCampaignData({ ...newCampaignData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handlePostCampaign = () => {
        if (newCampaignData.title && newCampaignData.goal && newCampaignData.description && imagePreview) {
            const newCampaign: CrowdfundCampaign = {
                id: campaigns.length + 3, // simple id generation
                title: newCampaignData.title,
                goal: parseInt(newCampaignData.goal, 10),
                raised: 0,
                description: newCampaignData.description,
                image: imagePreview,
            };
            setCampaigns(prev => [...prev, newCampaign]);
            setIsCampaignModalOpen(false);
            // Reset form
            setNewCampaignData({ title: '', goal: '', description: '' });
            setImagePreview('');
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">{t('finance.main.title')}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('finance.main.description')}</p>
            </div>
            
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <p className="text-slate-600 dark:text-slate-300 max-w-lg">{t('finance.createCampaignDescription')}</p>
                    <Button onClick={() => setIsCampaignModalOpen(true)}>{t('finance.createCampaign')}</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {campaigns.map(c => <CrowdfundCard key={c.id} campaign={c} />)}
                </div>
            </div>

            {isCampaignModalOpen && (
                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-lg">
                        <CardHeader><CardTitle>Create New Campaign</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <input type="text" name="title" value={newCampaignData.title} onChange={handleNewCampaignChange} placeholder="Campaign Title" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/>
                            <textarea name="description" value={newCampaignData.description} onChange={handleNewCampaignChange} placeholder="Campaign Description" className="w-full p-2 border rounded h-24 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/>
                            <input type="number" name="goal" value={newCampaignData.goal} onChange={handleNewCampaignChange} placeholder="Funding Goal (₹)" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Campaign Image</label>
                                <input type="file" onChange={handleImageUpload} accept="image/*" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
                                {imagePreview && <img src={imagePreview} alt="preview" className="mt-4 rounded-lg max-h-40" />}
                            </div>
                            <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setIsCampaignModalOpen(false)}>{t('common.cancel')}</Button><Button onClick={handlePostCampaign}>Create Campaign</Button></div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default FinancePage;
