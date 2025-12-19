import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import Card from '../components/common/Card';
import { LogoIcon } from '../components/common/Icons';
import type { Role, User, Artisan, Volunteer } from '../types';
import { getRandomProfileImage } from '../lib/initialData';

const RoleSelectionPage: React.FC = () => {
  const { setCurrentUser, firebaseUser } = useContext(AppContext)!;
  const { t } = useLocalization();

  const handleRoleSelect = (role: Role) => {
    if (!firebaseUser) return;

    // Create a base user profile from Firebase auth data
    const baseUser: User = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'New User',
      avatar: firebaseUser.photoURL || getRandomProfileImage(firebaseUser.uid),
      role: role,
      profileComplete: false, // Set profile as incomplete
    };

    let fullUserProfile: User | Artisan | Volunteer = baseUser;

    // Add role-specific fields for artisans or volunteers with default values
    if (role === 'artisan') {
      fullUserProfile = {
        ...baseUser,
        role: 'artisan',
        location: '',
        bio: '',
        story: '',
        storyVideoUrl: '',
      } as Artisan;
    } else if (role === 'volunteer') {
      fullUserProfile = {
        ...baseUser,
        role: 'volunteer',
        skills: [],
        bio: '',
        motivation: '',
        projectsCompleted: 0,
        completedProjects: [],
        testimonials: [],
      } as Volunteer;
    }

    // This function now also handles writing the user to Firestore
    setCurrentUser(fullUserProfile);
  };

  const RoleCard: React.FC<{ role: Role, bgColor: string, icon: React.ReactNode, description: string }> = ({ role, bgColor, icon, description }) => (
    <Card 
        className={`text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border-t-8 ${bgColor}`}
        onClick={() => handleRoleSelect(role)}
    >
      <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mt-6">{t(`roles.${role}`)}</h3>
      <p className="text-slate-500 mt-2">{description}</p>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-4">
                <LogoIcon />
                <h1 className="text-5xl font-bold text-slate-800 dark:text-slate-100">
                    {t('login.title')}
                </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xl mt-4">{t('login.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl w-full">
            <RoleCard 
                role="artisan"
                bgColor="border-teal-500" 
                icon={<svg className="w-10 h-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2 1m0 0l-2-1m2 1V2M4 7l2 1M4 7l2-1M4 7v2.5M12 21l-2-1m0 0l-2 1m2-1v-2.5M6 18l-2-1m2 1l-2 1m2-1V14m6 4l2 1m-2-1l2-1m-2 1v-2.5" /></svg>}
                description={t('login.artisanDescription')}
            />
             <RoleCard 
                role="volunteer"
                bgColor="border-amber-500" 
                icon={<svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                description={t('login.volunteerDescription')}
            />
            <RoleCard 
                role="customer"
                bgColor="border-indigo-500"
                icon={<svg className="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                description={t('login.customerDescription')}
            />
        </div>
    </div>
  );
};

export default RoleSelectionPage;