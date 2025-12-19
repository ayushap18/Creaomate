import React, { useContext } from 'react';
import type { Page } from '../../types';
import { NavIcon, LogoIcon } from '../common/Icons';
import { useLocalization, type Language } from '../../hooks/useLocalization';
import { AppContext } from '../../contexts/AppContext';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  theme: string;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (language: Language) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, theme, toggleTheme, language, setLanguage }) => {
  const { t } = useLocalization();
  // FIX: Destructured selectedPortfolioUser from context to make it available in the component scope.
  const { currentUser, logout, selectedPortfolioUser, setSelectedPortfolioUser, artisans, volunteers } = useContext(AppContext)!;
  
  const allNavItems: { id: Page; title: string; icon: React.ReactElement; roles: ('artisan' | 'volunteer')[] }[] = [
    { id: 'dashboard', title: t('sidebar.dashboard'), icon: <NavIcon type="dashboard" />, roles: ['artisan', 'volunteer'] },
    { id: 'marketplace', title: t('sidebar.marketplace'), icon: <NavIcon type="marketplace" />, roles: ['artisan'] },
    { id: 'photo-studio', title: t('sidebar.photoStudio'), icon: <NavIcon type="photostudio" />, roles: ['artisan'] },
    { id: 'volunteers', title: t('sidebar.volunteers'), icon: <NavIcon type="volunteers" />, roles: ['artisan', 'volunteer'] },
    { id: 'finance', title: t('sidebar.finance'), icon: <NavIcon type="finance" />, roles: ['artisan'] },
    { id: 'nft', title: t('sidebar.nft'), icon: <NavIcon type="nft" />, roles: ['artisan'] },
    { id: 'training', title: t('sidebar.training'), icon: <NavIcon type="training" />, roles: ['artisan', 'volunteer'] },
    { id: 'chat', title: t('sidebar.chat'), icon: <NavIcon type="community" />, roles: ['artisan', 'volunteer'] },
  ];

  const navItems = allNavItems.filter(item => currentUser && item.roles.includes(currentUser.role as 'artisan' | 'volunteer'));
  
  const languages: { code: Language; label: string; name: string; }[] = [
    { code: 'en', label: 'A', name: 'English' },
    { code: 'hi', label: 'अ', name: 'Hindi' },
    { code: 'bn', label: 'অ', name: 'Bengali' },
    { code: 'ta', label: 'அ', name: 'Tamil' },
    { code: 'mr', label: 'म', name: 'Marathi' },
  ];

  const handleLogout = () => {
    logout();
  };

  const handleViewProfile = () => {
    if (!currentUser) return;
    const fullUser = currentUser.role === 'artisan' 
      ? artisans.find(a => a.id === currentUser.id)
      : volunteers.find(v => v.id === currentUser.id);
    if(fullUser) setSelectedPortfolioUser(fullUser);
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 shadow-lg flex-col hidden sm:flex">
      <div onClick={logout} className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center space-x-3 cursor-pointer">
        <LogoIcon />
        <h1 className="text-2xl font-bold text-teal-600">ArtisanX</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <a
            key={item.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActivePage(item.id);
              setSelectedPortfolioUser(null);
            }}
            className={`relative flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
              activePage === item.id && !selectedPortfolioUser
                ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {activePage === item.id && !selectedPortfolioUser && <span className="absolute left-0 top-2 bottom-2 w-1 bg-teal-600 rounded-r-full"></span>}
            {item.icon}
            <span className="ml-4">{item.title}</span>
          </a>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
         <div className="flex items-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer" onClick={handleViewProfile}>
            <img src={currentUser?.avatar} alt="User" className="w-10 h-10 rounded-full object-cover ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-teal-500" />
            <div className="ml-3">
                <p className="font-semibold text-slate-800 dark:text-slate-200">{currentUser?.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{t(`roles.${currentUser?.role}`)}</p>
            </div>
             <button onClick={handleLogout} className="ml-auto p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600" title="Logout">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             </button>
         </div>
         <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('sidebar.language')}</span>
             <div
                className="p-2 rounded-xl grid grid-cols-3 gap-2 bg-white dark:bg-slate-800 text-base font-bold"
            >
                {languages.map(lang => (
                    <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        aria-label={`Switch to ${lang.name}`}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${language === lang.code ? 'bg-teal-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
         </div>
         <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('sidebar.theme')}</span>
            <button
                onClick={toggleTheme}
                className="p-1.5 rounded-full flex items-center transition-colors duration-300 bg-white dark:bg-slate-800"
            >
                <span className={`p-1.5 rounded-full transition-all duration-300 ${theme === 'light' ? 'bg-teal-500 text-white' : 'text-slate-500'}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </span>
                <span className={`p-1.5 rounded-full transition-all duration-300 ${theme === 'dark' ? 'bg-teal-500 text-white' : 'text-slate-500'}`}>
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                </span>
            </button>
         </div>
      </div>
    </aside>
  );
};

export default Sidebar;