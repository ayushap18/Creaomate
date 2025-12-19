import React, { useContext, useState, useRef } from 'react';
import { AppContext } from '../contexts/AppContext';
import type { Volunteer, CompletedProject } from '../types';
import Button from '../components/common/Button';
import Card, { CardContent, CardHeader } from '../components/common/Card';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
    volunteer: Volunteer;
}

const VolunteerProfilePage: React.FC<Props> = ({ volunteer }) => {
    const { t, language } = useLocalization();
    const { 
        setSelectedPortfolioUser, 
        startChat, 
        currentUser, 
        updateUserProfile,
        connectionRequests,
        sendConnectionRequest
    } = useContext(AppContext)!;
    const [viewingCertificate, setViewingCertificate] = useState<CompletedProject | null>(null);

    const isOwnProfile = currentUser?.id === volunteer.id;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newAvatar = reader.result as string;
                updateUserProfile({ avatar: newAvatar });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const ConnectButton: React.FC = () => {
        if (isOwnProfile) return null;

        const existingRequest = connectionRequests.find(
            req => (req.senderId === currentUser?.id && req.receiverId === volunteer.id) || (req.senderId === volunteer.id && req.receiverId === currentUser?.id)
        );

        if (existingRequest) {
            if (existingRequest.status === 'accepted') {
                return <Button onClick={() => startChat(volunteer)} className="w-full mt-4">{t('profile.message')}</Button>;
            }
            if (existingRequest.status === 'pending' && existingRequest.senderId === currentUser?.id) {
                return <Button disabled className="w-full mt-4">{t('profile.requestSent')}</Button>;
            }
        }
        
        return <Button onClick={() => sendConnectionRequest(volunteer)} className="w-full mt-4">{t('profile.connect')}</Button>;
    };

    const CertificateModal: React.FC<{ project: CompletedProject, onClose: () => void }> = ({ project, onClose }) => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 transform transition-all duration-300 scale-95 animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-2 border-teal-600 bg-teal-50/50 dark:bg-teal-900/20 rounded-xl h-full flex flex-col">
                    <CardHeader className="mb-4 text-center border-b-0">
                        <h3 className="text-3xl font-bold text-teal-800 dark:text-teal-300 tracking-wide font-serif">{language === 'hi' ? 'योगदान प्रमाण पत्र' : 'Certificate of Contribution'}</h3>
                    </CardHeader>
                    <CardContent className="flex-grow text-center">
                        <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">{project.certificateText}</p>
                    </CardContent>
                    <div className="mt-6 pt-4 border-t-2 border-dashed border-teal-300 dark:border-teal-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">{t('volunteer.issuedOn', { date: new Date().toLocaleDateString() })}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="secondary" onClick={onClose}>{t('common.close')}</Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fadeInUp">
            <Button variant="secondary" onClick={() => setSelectedPortfolioUser(null)} className="mb-6">
                &larr; {t('profile.back')}
            </Button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1 space-y-8">
                    <Card className="text-center sticky top-28">
                        <CardContent className="p-8">
                             <div className="relative w-32 h-32 mx-auto -mt-20">
                                <img src={volunteer.avatar} alt={volunteer.name} className="w-full h-full object-cover rounded-full ring-8 ring-white dark:ring-slate-800" />
                                {isOwnProfile && (
                                    <>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-1 right-1 w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center text-white hover:bg-teal-700 transition-transform transform hover:scale-110 shadow-md border-2 border-white dark:border-slate-800"
                                            aria-label="Upload new profile picture"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </button>
                                    </>
                                )}
                            </div>
                             <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-6">{volunteer.name}</h1>
                             <div className="flex flex-wrap justify-center gap-2 my-4">
                                {volunteer.skills.map(skill => (
                                    <span key={skill} className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">{skill}</span>
                                ))}
                            </div>
                            <ConnectButton />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold mb-4">{t('profile.volunteer.about')}</h2>
                            <p className="text-slate-600 dark:text-slate-300">{volunteer.bio}</p>
                            <h2 className="text-2xl font-bold mb-4 mt-8">{t('profile.volunteer.motivation')}</h2>
                            <p className="text-slate-600 dark:text-slate-300 italic">"{volunteer.motivation}"</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold mb-6">{t('profile.volunteer.impact')}</h2>
                            <div className="space-y-4">
                                {volunteer.completedProjects.map(project => (
                                    <div key={project.id} className="flex items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                        <img src={project.artisanAvatar} alt={project.artisanName} className="w-12 h-12 rounded-full object-cover mr-4" />
                                        <div className="flex-1">
                                            <p className="font-bold">{project.projectName}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">with {project.artisanName}</p>
                                        </div>
                                        <Button variant="ghost" onClick={() => setViewingCertificate(project)}>{t('profile.volunteer.viewCertificate')}</Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-8">
                             <h2 className="text-2xl font-bold mb-6">{t('profile.volunteer.testimonials')}</h2>
                             <div className="space-y-6">
                                {volunteer.testimonials.map((testimonial, index) => (
                                    <blockquote key={index} className="p-4 border-l-4 border-teal-500 bg-slate-50 dark:bg-slate-700/50">
                                        <p className="italic text-slate-600 dark:text-slate-300">"{testimonial.quote}"</p>
                                        <footer className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center">
                                            <img src={testimonial.artisanAvatar} alt={testimonial.artisanName} className="w-6 h-6 rounded-full object-cover mr-2" />
                                            &mdash; {testimonial.artisanName}
                                        </footer>
                                    </blockquote>
                                ))}
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {viewingCertificate && <CertificateModal project={viewingCertificate} onClose={() => setViewingCertificate(null)} />}
            
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                @keyframes slide-up { from { transform: scale(0.95); } to { transform: scale(1); } }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default VolunteerProfilePage;