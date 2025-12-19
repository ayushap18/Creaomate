import React, { useState, useMemo } from 'react';
import Card from '../components/common/Card';
import type { TrainingModule } from '../types';
import { useLocalization } from '../hooks/useLocalization';

const ModuleCard: React.FC<{ module: TrainingModule }> = ({ module }) => (
    <a href={module.videoUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
        <Card className="p-0 overflow-hidden group h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="relative">
                <img src={module.thumbnail} alt={module.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/30 backdrop-blur-sm rounded-full p-4">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    </div>
                </div>
                <span className="absolute top-4 right-4 bg-black/50 text-white text-xs font-semibold px-3 py-1 rounded-full">{module.duration}</span>
            </div>
            <div className="p-5">
                <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">{module.category}</p>
                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 mt-1">{module.title}</h4>
            </div>
        </Card>
    </a>
);

const TrainingPage: React.FC = () => {
  const { t } = useLocalization();
  const [searchQuery, setSearchQuery] = useState('');

  const allModules: TrainingModule[] = useMemo(() => [
    { id: 1, title: t('training.modules.marketing.title'), category: t('training.modules.marketing.category'), thumbnail: 'https://img.youtube.com/vi/-8h4SBv9EMg/hqdefault.jpg', duration: t('training.modules.marketing.duration'), videoUrl: 'https://www.youtube.com/watch?v=-8h4SBv9EMg' },
    { id: 2, title: t('training.modules.photography.title'), category: t('training.modules.photography.category'), thumbnail: 'https://img.youtube.com/vi/MHjHsJqeWN8/hqdefault.jpg', duration: t('training.modules.photography.duration'), videoUrl: 'https://www.youtube.com/watch?v=MHjHsJqeWN8' },
    { id: 3, title: t('training.modules.branding.title'), category: t('training.modules.branding.category'), thumbnail: 'https://img.youtube.com/vi/YBXcQrMpMt8/hqdefault.jpg', duration: t('training.modules.branding.duration'), videoUrl: 'https://www.youtube.com/watch?v=YBXcQrMpMt8' },
    { id: 4, title: t('training.modules.ecommerce.title'), category: t('training.modules.ecommerce.category'), thumbnail: 'https://img.youtube.com/vi/G4Gdv1omLEw/hqdefault.jpg', duration: t('training.modules.ecommerce.duration'), videoUrl: 'https://www.youtube.com/watch?v=G4Gdv1omLEw' },
    { id: 5, title: t('training.modules.social.title'), category: t('training.modules.social.category'), thumbnail: 'https://img.youtube.com/vi/ZmNpeXTj2c4/hqdefault.jpg', duration: t('training.modules.social.duration'), videoUrl: 'https://www.youtube.com/watch?v=ZmNpeXTj2c4' },
    { id: 6, title: t('training.modules.shipping.title'), category: t('training.modules.shipping.category'), thumbnail: 'https://img.youtube.com/vi/ASBSD2g4_YE/hqdefault.jpg', duration: t('training.modules.shipping.duration'), videoUrl: 'https://www.youtube.com/watch?v=ASBSD2g4_YE' },
  ], [t]);

  const filteredModules = useMemo(() => {
    if (!searchQuery) {
        return allModules;
    }
    return allModules.filter(module =>
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allModules, searchQuery]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">{t('training.main.title')}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('training.main.description')}</p>
      </div>

      <div className="relative">
          <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for training modules..."
              className="w-full p-4 pl-12 border border-slate-300 rounded-xl dark:bg-slate-800 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredModules.length > 0 ? (
            filteredModules.map(m => <ModuleCard key={m.id} module={m} />)
        ) : (
            <div className="md:col-span-2 lg:col-span-3 text-center py-10">
                <p className="text-slate-500 font-semibold">No modules found for "{searchQuery}"</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default TrainingPage;