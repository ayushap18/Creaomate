import React, { useContext, useEffect, useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import VolunteerPage from './pages/VolunteerPage';
import FinancePage from './pages/FinancePage';
import NftPage from './pages/NftPage';
import TrainingPage from './pages/TrainingPage';
import ChatPage from './pages/ChatPage';
import PhotoStudioPage from './pages/PhotoStudioPage';
import CartPage from './pages/CartPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import CustomerApp from './pages/CustomerApp';
import ArtisanProfilePage from './pages/ArtisanProfilePage';
import VolunteerProfilePage from './pages/VolunteerProfilePage';
import CustomerProductDetailPage from './pages/customer/CustomerProductDetailPage';
import type { Page, Artisan, Volunteer } from './types';
import { AppProvider, AppContext } from './contexts/AppContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

const DashboardApp: React.FC = () => {
    const { 
      activePage, 
      setActivePage, 
      theme, 
      toggleTheme, 
      language, 
      setLanguage, 
      t, 
      selectedPortfolioUser,
      isInitialLogin,
      setIsInitialLogin,
      currentUser,
      setSelectedPortfolioUser,
      artisans,
      volunteers,
      firestoreError,
      selectedProduct
    } = useContext(AppContext)!;
    
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        if (firestoreError) {
            setShowError(true);
        }
    }, [firestoreError]);

    useEffect(() => {
        if (isInitialLogin && currentUser && (artisans.length > 0 || volunteers.length > 0)) {
             const fullUser = currentUser.role === 'artisan'
                ? artisans.find(a => a.id === currentUser.id)
                : volunteers.find(v => v.id === currentUser.id);
            if(fullUser) {
                setSelectedPortfolioUser(fullUser);
                setIsInitialLogin(false); // Prevent re-triggering
            }
        }
    }, [isInitialLogin, currentUser, artisans, volunteers, setSelectedPortfolioUser, setIsInitialLogin]);

    const pageTitles: Record<Page, string> = {
        dashboard: t('sidebar.dashboard'),
        marketplace: t('sidebar.marketplace'),
        'photo-studio': t('sidebar.photoStudio'),
        volunteers: t('sidebar.volunteers'),
        finance: t('sidebar.finance'),
        nft: t('sidebar.nft'),
        training: t('sidebar.training'),
        chat: t('sidebar.chat'),
        cart: t('cart.title'),
        'customer-marketplace': '',
        'customer-cart': '',
        'customer-favorites': '',
        'customer-profile': '',
        'customer-checkout': '',
        'customer-chat': t('sidebar.chat'),
        'customer-orders': 'My Orders',
        'customer-offers': 'My Offers',
    };
    
    const renderPageTitle = () => {
        if (selectedProduct) {
            return selectedProduct.name;
        }
        if (selectedPortfolioUser) {
            return selectedPortfolioUser.name;
        }
        return pageTitles[activePage] || "Dashboard";
    };

    const renderContent = () => {
        if (selectedProduct) {
            const artisan = artisans.find(a => a.id === selectedProduct.artisanId);
            return <CustomerProductDetailPage product={selectedProduct} artisan={artisan} />;
        }
        if (selectedPortfolioUser) {
            if (selectedPortfolioUser.role === 'artisan') {
                return <ArtisanProfilePage artisan={selectedPortfolioUser as Artisan} />;
            }
            if (selectedPortfolioUser.role === 'volunteer') {
                return <VolunteerProfilePage volunteer={selectedPortfolioUser as Volunteer} />;
            }
        }
    
        switch (activePage) {
            case 'dashboard':
                return <DashboardPage setActivePage={setActivePage} />;
            case 'marketplace':
                return <MarketplacePage />;
            case 'photo-studio':
                return <PhotoStudioPage />;
            case 'volunteers':
                return <VolunteerPage />;
            case 'finance':
                return <FinancePage />;
            case 'nft':
                return <NftPage />;
            case 'training':
                return <TrainingPage />;
            case 'chat':
                return <ChatPage />;
            case 'cart':
                return <CartPage />;
            default:
                return <DashboardPage setActivePage={setActivePage} />;
        }
    };
    
    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
                theme={theme}
                toggleTheme={toggleTheme}
                language={language}
                setLanguage={setLanguage}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title={renderPageTitle()} />
                {showError && (
                    <div className="bg-amber-500 text-white text-sm flex items-center justify-between p-3 flex-shrink-0 shadow-md z-10">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            <span>{firestoreError}</span>
                        </div>
                        <button onClick={() => setShowError(false)} className="p-1 rounded-full hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Dismiss">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                )}
                <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}


const AppContent: React.FC = () => {
  const { isAuthenticated, authPage, currentUser, authLoading } = useContext(AppContext)!;

  if (authLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <svg className="animate-spin h-10 w-10 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    switch (authPage) {
        case 'login':
            return <LoginPage />;
        case 'signup':
            return <SignUpPage />;
        default:
            return <LandingPage />;
    }
  }

  if (!currentUser) {
    return <RoleSelectionPage />;
  }

  if (!currentUser.profileComplete) {
    return <ProfileSetupPage />;
  }

  if (currentUser.role === 'customer') {
    return <CustomerApp />;
  }
  
  return <DashboardApp />;
}


const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;