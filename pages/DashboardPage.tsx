import React, { useContext } from 'react';
import type { Page, Artisan, BargainRequest, Product, User, ConnectionRequest, Role } from '../types';
import Button from '../components/common/Button';
import Card, { CardHeader, CardContent, CardTitle } from '../components/common/Card';
import { useLocalization } from '../hooks/useLocalization';
import { AppContext } from '../contexts/AppContext';

interface DashboardPageProps {
  setActivePage: (page: Page) => void;
}

const FeatureIcon: React.FC<{ children: React.ReactNode, color: string }> = ({ children, color }) => (
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 ${color}`}>
        {children}
    </div>
);

const StepCard: React.FC<{ icon: React.ReactNode, title: string, description: string, buttonText: string, onClick: () => void, delay: string, className?: string }> = ({ icon, title, description, buttonText, onClick, delay, className }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 p-8 flex flex-col animate-fadeInUp ${className}`} style={{ animationDelay: delay }}>
        {icon}
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6 flex-grow">{description}</p>
        <Button variant="secondary" onClick={onClick} className="mt-auto w-full justify-center">
            {buttonText}
        </Button>
    </div>
);

const SpotlightCard: React.FC<{ icon: React.ReactNode, title: string, description: string, buttonText: string, onClick: () => void, delay: string }> = ({ icon, title, description, buttonText, onClick, delay }) => (
    <div className="lg:col-span-2 bg-gradient-to-br from-teal-500 to-green-600 text-white rounded-3xl p-10 flex flex-col justify-between animate-fadeInUp" style={{ animationDelay: delay }}>
        <div>
            <div className="flex items-start gap-6">
                <div className="flex-shrink-0">{icon}</div>
                <div>
                    <h3 className="text-3xl font-bold">{title}</h3>
                    <p className="mt-2 text-teal-100 text-lg max-w-lg">{description}</p>
                </div>
            </div>
        </div>
        <div className="mt-8 self-start">
            <Button className="bg-white text-teal-600 hover:bg-teal-50 font-semibold px-10 py-4 text-lg" onClick={onClick}>
                {buttonText}
            </Button>
        </div>
    </div>
);

const BargainRequests: React.FC = () => {
    const { currentUser, bargainRequests, updateBargainRequestStatus } = useContext(AppContext)!;
    const { t } = useLocalization();
    const pendingRequests = bargainRequests.filter(req => req.artisanId === currentUser?.id && req.status === 'pending');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('dashboard.artisan.bargain.title', { count: pendingRequests.length })}</CardTitle>
            </CardHeader>
            <CardContent>
                {pendingRequests.length > 0 ? (
                    <div className="space-y-4">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="flex flex-col sm:flex-row items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl gap-4">
                                <img src={req.productImage} alt={req.productName} className="w-16 h-16 rounded-lg object-cover" />
                                <div className="flex-1 text-center sm:text-left">
                                    <p><span className="font-bold">{req.customerName}</span> offered <span className="font-semibold text-teal-600">₹{req.offerPrice.toLocaleString()}</span> for <span className="font-semibold">{req.productName}</span></p>
                                    <p className="text-sm text-slate-500">Original Price: ₹{req.originalPrice.toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="primary" onClick={() => updateBargainRequestStatus(req.id, 'accepted')}>Accept</Button>
                                    <Button variant="secondary" onClick={() => updateBargainRequestStatus(req.id, 'rejected')}>Reject</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-4">{t('dashboard.artisan.bargain.empty')}</p>
                )}
            </CardContent>
        </Card>
    );
};

const ConnectionRequests: React.FC = () => {
    const { currentUser, connectionRequests, respondToConnectionRequest } = useContext(AppContext)!;
    const { t } = useLocalization();
    const pendingRequests = connectionRequests.filter(req => req.receiverId === currentUser?.id && req.status === 'pending');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('dashboard.artisan.connectionRequests.title')} ({pendingRequests.length})</CardTitle>
            </CardHeader>
            <CardContent>
                {pendingRequests.length > 0 ? (
                    <div className="space-y-4">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="flex flex-col sm:flex-row items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl gap-4">
                                <img src={req.senderAvatar} alt={req.senderName} className="w-16 h-16 rounded-full object-cover" />
                                <div className="flex-1 text-center sm:text-left">
                                    <p><span className="font-bold">{req.senderName}</span> wants to connect with you.</p>
                                    <p className="text-sm text-slate-500 capitalize">{t(`roles.${req.senderRole}`)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="primary" onClick={() => respondToConnectionRequest(req, 'accepted')}>Accept</Button>
                                    <Button variant="secondary" onClick={() => respondToConnectionRequest(req, 'rejected')}>Reject</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-4">{t('dashboard.artisan.connectionRequests.empty')}</p>
                )}
            </CardContent>
        </Card>
    );
};


const ArtisanWelcomePage: React.FC<DashboardPageProps> = ({ setActivePage }) => {
    const { t } = useLocalization();
    const { currentUser } = useContext(AppContext)!;

    return (
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="text-center animate-fadeInUp" style={{ animationDelay: '0s' }}>
          <h1 className="text-5xl font-bold text-slate-800 dark:text-slate-100">{t('dashboard.artisan.welcome', { name: currentUser!.name.split(' ')[0] })}</h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 mt-4 max-w-3xl mx-auto">{t('dashboard.artisan.subtitle')}</p>
        </section>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <BargainRequests />
            <ConnectionRequests />
        </div>

        {/* Getting Started Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-10 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>{t('dashboard.artisan.getStarted.title')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SpotlightCard
              icon={<FeatureIcon color="bg-white/20"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></FeatureIcon>}
              title={t('dashboard.artisan.getStarted.step2_title')}
              description={t('dashboard.artisan.getStarted.step2_desc')}
              buttonText={t('dashboard.artisan.getStarted.step2_button')}
              onClick={() => setActivePage('volunteers')}
              delay="0.4s"
            />
            <StepCard
              icon={<FeatureIcon color="bg-teal-500"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg></FeatureIcon>}
              title={t('dashboard.artisan.getStarted.step1_title')}
              description={t('dashboard.artisan.getStarted.step1_desc')}
              buttonText={t('dashboard.artisan.getStarted.step1_button')}
              onClick={() => setActivePage('photo-studio')}
              delay="0.6s"
            />
             <StepCard
              icon={<FeatureIcon color="bg-indigo-500"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg></FeatureIcon>}
              title={t('dashboard.artisan.getStarted.step3_title')}
              description={t('dashboard.artisan.getStarted.step3_desc')}
              buttonText={t('dashboard.artisan.getStarted.step3_button')}
              onClick={() => setActivePage('finance')}
              delay="0.8s"
            />
             <StepCard
              icon={<FeatureIcon color="bg-purple-500"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg></FeatureIcon>}
              title={t('dashboard.artisan.getStarted.step4_title')}
              description={t('dashboard.artisan.getStarted.step4_desc')}
              buttonText={t('dashboard.artisan.getStarted.step4_button')}
              onClick={() => setActivePage('nft')}
              delay="1.0s"
            />
          </div>
        </section>
      </div>
    );
};

const VolunteerWelcomePage: React.FC<DashboardPageProps> = ({ setActivePage }) => {
    const { t } = useLocalization();
    const { currentUser, artisans, setSelectedPortfolioUser } = useContext(AppContext)!;
    const featuredArtisan = artisans.find(a => a.id === '102');

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <section className="relative h-72 rounded-3xl overflow-hidden text-center flex flex-col items-center justify-center p-6 bg-cover bg-center animate-fadeInUp" style={{ backgroundImage: 'url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6kaGFdq7VUXUQlDXz5UI5--6dfQW76OX3Bw&s)', animationDelay: '0s' }}>
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative z-10 text-white">
                    <h1 className="text-5xl font-bold">{t('dashboard.volunteer.heroTitle')}</h1>
                    <p className="text-xl mt-4 max-w-3xl mx-auto">{t('dashboard.volunteer.heroSubtitle', { name: currentUser!.name.split(' ')[0] })}</p>
                </div>
            </section>

            <ConnectionRequests />

            {/* Main Action Section */}
             <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                <div className="lg:col-span-2 bg-gradient-to-br from-teal-500 to-green-600 text-white rounded-3xl p-10 flex flex-col justify-center animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-4xl font-bold">{t('dashboard.volunteer.findNew')}</h2>
                    <p className="mt-4 text-teal-100 text-lg max-w-lg">{t('dashboard.volunteer.findNewDesc')}</p>
                    <div className="mt-8">
                        <Button className="bg-white text-teal-600 hover:bg-teal-50 font-semibold px-8 py-3 text-base" onClick={() => setActivePage('volunteers')}>
                            {t('dashboard.volunteer.browseProjects')}
                        </Button>
                    </div>
                </div>
                {featuredArtisan && (
                     <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 flex flex-col items-center text-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                        <h3 className="text-xl font-bold mb-4">{t('dashboard.volunteer.featuredArtisan')}</h3>
                        <img src={featuredArtisan.avatar} alt={featuredArtisan.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-offset-4 ring-amber-500 mb-4" />
                        <h4 className="font-bold text-xl">{featuredArtisan.name}</h4>
                        <p className="text-sm text-slate-500">{featuredArtisan.location}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 flex-grow italic">"{featuredArtisan.bio}"</p>
                        <Button variant="secondary" className="w-full mt-6" onClick={() => setSelectedPortfolioUser(featuredArtisan as Artisan)}>{t('dashboard.viewProfile')}</Button>
                    </div>
                )}
            </section>
        </div>
    );
}

const DashboardPage: React.FC<DashboardPageProps> = ({ setActivePage }) => {
    const { currentUser } = useContext(AppContext)!;
    
    const pageContent = currentUser?.role === 'volunteer' 
        ? <VolunteerWelcomePage setActivePage={setActivePage} />
        : <ArtisanWelcomePage setActivePage={setActivePage} />;

    return (
        <>
            {pageContent}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out forwards;
                    opacity: 0; /* Start hidden */
                }
            `}</style>
        </>
    );
};

export default DashboardPage;