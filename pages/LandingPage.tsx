import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { LogoIcon } from '../components/common/Icons';
import Button from '../components/common/Button';
import { useLocalization, type Language } from '../hooks/useLocalization';

const Feature: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; delay: number }> = ({ icon, title, children, delay }) => (
    <div className="text-center p-6 scroll-animate" style={{ transitionDelay: `${delay}ms` }}>
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-50 to-yellow-50 dark:from-teal-900/30 dark:to-amber-900/30 text-teal-700 dark:text-teal-300">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">{title}</h3>
        <p className="text-slate-700 dark:text-slate-400">{children}</p>
    </div>
);

const Step: React.FC<{ number: string; title: string; children: React.ReactNode; delay: number }> = ({ number, title, children, delay }) => (
    <div className="flex scroll-animate" style={{ transitionDelay: `${delay}ms` }}>
        <div className="flex flex-col items-center mr-6">
            <div>
                <div className="flex items-center justify-center w-12 h-12 border-2 border-teal-500 text-teal-500 rounded-full font-bold text-lg">
                    {number}
                </div>
            </div>
            <div className="w-px h-full bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="pb-10">
            <h4 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h4>
            <p className="text-slate-600 dark:text-slate-400">{children}</p>
        </div>
    </div>
);

const LastStep: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; delay: number }> = ({ icon, title, children, delay }) => (
     <div className="flex scroll-animate" style={{ transitionDelay: `${delay}ms` }}>
        <div className="flex flex-col items-center mr-6">
            <div>
                <div className="flex items-center justify-center w-12 h-12 border-2 border-amber-500 text-amber-500 rounded-full font-bold text-lg">
                    {icon}
                </div>
            </div>
        </div>
        <div className="pb-10">
            <h4 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h4>
            <p className="text-slate-600 dark:text-slate-400">{children}</p>
        </div>
    </div>
);


// The images below are provided by the user.
const userImages = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6kaGFdq7VUXUQlDXz5UI5--6dfQW76OX3Bw&s',
    'https://images.hindustantimes.com/rf/image_size_630x354/HT/p2/2020/05/20/Pictures/_10059fa6-9a46-11ea-b5cf-22f71a9413fe.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwFtGM9yvqXs3horfgXSPe4EiOSGi_BxuJEA&s',
];


// Use the user-provided images for the slideshow.
const slideshowImages = userImages;


const LandingPage: React.FC = () => {
    const { setAuthPage, bypassLogin, language, setLanguage } = useContext(AppContext)!;
    const { t } = useLocalization();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const languages: { code: Language; label: string; name: string; }[] = [
        { code: 'en', label: 'A', name: 'English' },
        { code: 'hi', label: 'अ', name: 'Hindi' },
        { code: 'bn', label: 'অ', name: 'Bengali' },
        { code: 'ta', label: 'அ', name: 'Tamil' },
        { code: 'mr', label: 'म', name: 'Marathi' },
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slideshowImages.length);
        }, 5000); // Change image every 5 seconds
    
        return () => clearTimeout(timer);
    }, [currentImageIndex]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '0px',
                threshold: 0.1,
            }
        );
    
        const elementsToAnimate = document.querySelectorAll('.scroll-animate');
        elementsToAnimate.forEach((el) => observer.observe(el));
    
        return () => observer.disconnect();
    }, []);
    
    return (
        <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <LogoIcon />
                        <span className="text-2xl font-bold text-teal-600">{t('landing.title')}</span>
                    </div>
                    <div className="space-x-4 hidden sm:flex items-center">
                        <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 dark:bg-slate-800">
                            {languages.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => setLanguage(lang.code)}
                                    aria-label={`Switch to ${lang.name}`}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 text-sm font-semibold ${language === lang.code ? 'bg-teal-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-600"></div>
                        <div className="space-x-2 flex items-center">
                            <Button variant="ghost" onClick={bypassLogin}>{t('landing.guest')}</Button>
                            <Button variant="ghost" onClick={() => setAuthPage('login')}>{t('landing.login')}</Button>
                            <Button onClick={() => setAuthPage('signup')}>{t('landing.getStarted')}</Button>
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Mobile Guest Button */}
            <div className="sm:hidden fixed top-4 right-4 z-50">
                <Button variant="secondary" onClick={bypassLogin}>
                    {t('landing.guest')}
                </Button>
            </div>

            <main>
                {/* Hero Section */}
                <section className="relative text-center pt-32 pb-24 md:pt-48 md:pb-40 px-6 flex items-center justify-center min-h-screen overflow-hidden">
                    {/* Slideshow Background */}
                    {slideshowImages.map((src, index) => (
                        <img
                            key={src}
                            src={src}
                            alt="Artisan crafts slideshow"
                            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
                            style={{ opacity: index === currentImageIndex ? 1 : 0, zIndex: 0 }}
                        />
                    ))}
                    {/* End Slideshow */}

                    <div className="absolute inset-0 bg-black/60 z-10"></div>
                    <div className="relative z-20 text-white max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight shadow-black/50 [text-shadow:_0_2px_8px_var(--tw-shadow-color)] scroll-animate is-visible" style={{ transitionDelay: '200ms' }}>
                            {t('landing.title')}
                        </h1>
                        <p className="mt-4 max-w-3xl mx-auto text-xl md:text-2xl font-semibold text-teal-300 scroll-animate is-visible" style={{ transitionDelay: '400ms' }}>
                            {t('landing.subtitle')}
                        </p>
                        <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-slate-200 scroll-animate is-visible" style={{ transitionDelay: '600ms' }}>
                           {t('landing.description')}
                        </p>
                        <div className="mt-8 flex justify-center scroll-animate is-visible" style={{ transitionDelay: '800ms' }}>
                            <Button onClick={() => setAuthPage('signup')} className="px-10 py-4 text-lg transform hover:scale-105">
                                {t('landing.join')}
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 px-6 bg-white dark:bg-slate-800">
                    <div className="container mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-16 scroll-animate">
                             <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">{t('landing.toolkitTitle')}</h2>
                             <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">{t('landing.toolkitDescription')}</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <Feature icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" /></svg>} title={t('landing.feature1Title')} delay={200}>
                                {t('landing.feature1Description')}
                            </Feature>
                             <Feature icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>} title={t('landing.feature2Title')} delay={400}>
                                {t('landing.feature2Description')}
                            </Feature>
                             <Feature icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} title={t('landing.feature3Title')} delay={600}>
                                {t('landing.feature3Description')}
                            </Feature>
                             <Feature icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="7" width="15" height="10" rx="1.5" /><rect x="6" y="4" width="15" height="10" rx="1.5" /></svg>} title={t('landing.feature4Title')} delay={800}>
                                {t('landing.feature4Description')}
                            </Feature>
                             <Feature icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} title={t('landing.feature5Title')} delay={1000}>
                                {t('landing.feature5Description')}
                            </Feature>
                            <Feature icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} title={t('landing.feature6Title')} delay={1200}>
                                {t('landing.feature6Description')}
                            </Feature>
                        </div>
                    </div>
                </section>
                
                 {/* Volunteer Highlight Section */}
                <section className="py-20 px-6 bg-slate-100 dark:bg-slate-900">
                    <div className="container mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="scroll-animate" style={{ transitionDelay: '200ms' }}>
                                <span className="font-bold text-teal-600 dark:text-teal-400 uppercase">{t('landing.usp')}</span>
                                <h2 className="text-3xl md:text-4xl font-bold mt-2 text-slate-800 dark:text-slate-100">{t('landing.collaborationTitle')}</h2>
                                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                                    {t('landing.collaborationDescription')}
                                </p>
                                <Button onClick={() => setAuthPage('signup')} className="mt-8">{t('landing.becomeVolunteer')}</Button>
                            </div>
                            <div className="scroll-animate" style={{ transitionDelay: '400ms' }}>
                                <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=500&fit=crop&q=80" alt="Volunteer collaborating with an artisan" className="rounded-2xl shadow-xl w-full h-full object-cover"/>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Customer Highlight Section */}
                <section className="py-20 px-6 bg-white dark:bg-slate-800">
                    <div className="container mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                             <div className="scroll-animate order-last md:order-first" style={{ transitionDelay: '400ms' }}>
                                <img src="https://content.jdmagicbox.com/v2/comp/chennai/p8/044pxx44.xx44.091117143649.w8p8/catalogue/handkraft-treasures-anna-nagar-chennai-handicraft-item-dealers-mw3ln7n5t0.jpg" alt="Customer enjoying a handcrafted product" className="rounded-2xl shadow-xl w-full h-full object-cover"/>
                            </div>
                            <div className="scroll-animate" style={{ transitionDelay: '200ms' }}>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{t('landing.forShoppers')}</span>
                                <h2 className="text-3xl md:text-4xl font-bold mt-2 text-slate-800 dark:text-slate-100">{t('landing.treasuresTitle')}</h2>
                                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                                    {t('landing.treasuresDescription')}
                                </p>
                                <Button variant="secondary" onClick={() => setAuthPage('signup')} className="mt-8">{t('landing.startExploring')}</Button>
                            </div>
                        </div>
                    </div>
                </section>


                {/* How It Works Section */}
                <section className="py-20 px-6 bg-slate-100 dark:bg-slate-900">
                     <div className="container mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-16 scroll-animate">
                             <h2 className="text-3xl md:text-4xl font-bold">{t('landing.howItWorksTitle')}</h2>
                             <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">{t('landing.howItWorksDescription')}</p>
                        </div>
                        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-x-12">
                            <div>
                                <h3 className="text-2xl font-bold mb-8 text-slate-800 dark:text-slate-100 scroll-animate" style={{ transitionDelay: '100ms' }}>{t('landing.forArtisans')}</h3>
                                <Step number="1" title={t('landing.artisansStep1Title')} delay={200}>{t('landing.artisansStep1Description')}</Step>
                                <Step number="2" title={t('landing.artisansStep2Title')} delay={400}>{t('landing.artisansStep2Description')}</Step>
                                <Step number="3" title={t('landing.artisansStep3Title')} delay={600}>{t('landing.artisansStep3Description')}</Step>
                                <LastStep icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.5l.523-1.046a1 1 0 011.742 0l.523 1.046m5.232 0l.523-1.046a1 1 0 011.742 0l.523 1.046M12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>} title={t('landing.artisansStep4Title')} delay={800}>{t('landing.artisansStep4Description')}</LastStep>
                            </div>
                            <div>
                               <h3 className="text-2xl font-bold mb-8 text-slate-800 dark:text-slate-100 scroll-animate" style={{ transitionDelay: '100ms' }}>{t('landing.forVolunteers')}</h3>
                                <Step number="1" title={t('landing.volunteersStep1Title')} delay={200}>{t('landing.volunteersStep1Description')}</Step>
                                <Step number="2" title={t('landing.volunteersStep2Title')} delay={400}>{t('landing.volunteersStep2Description')}</Step>
                                <Step number="3" title={t('landing.volunteersStep3Title')} delay={600}>{t('landing.volunteersStep3Description')}</Step>
                                <LastStep icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>} title={t('landing.volunteersStep4Title')} delay={800}>{t('landing.volunteersStep4Description')}</LastStep>
                            </div>
                            <div>
                               <h3 className="text-2xl font-bold mb-8 text-slate-800 dark:text-slate-100 scroll-animate" style={{ transitionDelay: '100ms' }}>{t('landing.forCustomers')}</h3>
                                <Step number="1" title={t('landing.customersStep1Title')} delay={200}>{t('landing.customersStep1Description')}</Step>
                                <Step number="2" title={t('landing.customersStep2Title')} delay={400}>{t('landing.customersStep2Description')}</Step>
                                <Step number="3" title={t('landing.customersStep3Title')} delay={600}>{t('landing.customersStep3Description')}</Step>
                                <LastStep icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} title={t('landing.customersStep4Title')} delay={800}>{t('landing.customersStep4Description')}</LastStep>
                            </div>
                        </div>
                    </div>
                </section>

                 {/* Final CTA Section */}
                <section className="py-20 px-6 bg-teal-600 text-white">
                    <div className="container mx-auto text-center scroll-animate" style={{ transitionDelay: '200ms' }}>
                        <h2 className="text-3xl md:text-4xl font-bold">{t('landing.ctaTitle')}</h2>
                        <p className="mt-4 text-lg text-teal-100 max-w-2xl mx-auto">{t('landing.ctaDescription')}</p>
                        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                            <Button onClick={() => setAuthPage('signup')} className="w-full sm:w-auto bg-white text-teal-600 hover:bg-teal-50 px-8 py-3 text-base">{t('landing.ctaArtisan')}</Button>
                            <Button onClick={() => setAuthPage('signup')} className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-base">{t('landing.ctaVolunteer')}</Button>
                             <Button onClick={() => setAuthPage('signup')} className="w-full sm:w-auto bg-white/10 border-2 border-white text-white hover:bg-white/20 px-8 py-3 text-base">{t('landing.ctaCustomer')}</Button>
                        </div>
                    </div>
                </section>
            </main>

             {/* Footer */}
            <footer className="bg-slate-100 dark:bg-slate-800">
                <div className="container mx-auto px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    <p>{t('landing.footer', { year: new Date().getFullYear() })}</p>
                </div>
            </footer>
            
            <style>{`
                .scroll-animate {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .scroll-animate.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
};

export default LandingPage;