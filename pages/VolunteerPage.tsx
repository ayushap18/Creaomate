import React, { useState, useContext } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import type { Volunteer, Project, Artisan, ProjectApplication, Collaboration, User, CompletedProject } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { AppContext } from '../contexts/AppContext';
import DigitalCertificate from '../components/common/DigitalCertificate';

// Reusable Star Rating Component
const StarRating: React.FC<{ rating: number, setRating: (r: number) => void }> = ({ rating, setRating }) => (
    <div className="flex justify-center my-2">
        {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => setRating(star)} className="p-1">
                <svg className={`w-8 h-8 ${star <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            </button>
        ))}
    </div>
);


const VolunteerPage: React.FC = () => {
    const { 
        t, 
        language,
        currentUser, 
        projects, 
        volunteers, 
        artisans, 
        setSelectedPortfolioUser, 
        sendConnectionRequest, 
        connectionRequests, 
        startChat, 
        postNewProject,
        projectApplications,
        applyForProject,
        respondToApplication,
        collaborations,
        endCollaboration,
        issueCertificate
    } = useContext(AppContext)!;
    
    // Determine initial tab based on role
    const initialTab = currentUser?.role === 'artisan' ? 'my-projects' : 'projects';
    const [activeTab, setActiveTab] = useState(initialTab);
    
    // State for modals and confirmations
    const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
    const [showConnectModal, setShowConnectModal] = useState<User | null>(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [viewingApplicantsFor, setViewingApplicantsFor] = useState<Project | null>(null);
    const [endingCollaboration, setEndingCollaboration] = useState<Collaboration | null>(null);
    const [viewingCertificate, setViewingCertificate] = useState<CompletedProject | null>(null);
    
    // Form state
    const [newProjectData, setNewProjectData] = useState({ title: '', description: '', skills: '' });
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);

    // Helper to display confirmations
    const displayConfirmation = (message: string) => {
        setShowConfirmation(message);
        setTimeout(() => setShowConfirmation(null), 3000);
    };

    // Form Handlers
    const handleSendRequest = async (receiver: User) => {
        await sendConnectionRequest(receiver);
        setShowConnectModal(null);
        displayConfirmation(t('volunteer.confirmations.requestSent', { name: receiver.name }));
    };

    const handlePostProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newProjectData.title && newProjectData.description && newProjectData.skills) {
            await postNewProject({
                title: newProjectData.title,
                description: newProjectData.description,
                skillsNeeded: newProjectData.skills.split(',').map(s => s.trim()).filter(Boolean),
            });
            setIsProjectModalOpen(false);
            setNewProjectData({ title: '', description: '', skills: '' });
            displayConfirmation(t('volunteer.confirmations.projectPosted'));
        }
    };

    const handleEndCollaboration = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!endingCollaboration) return;
        await endCollaboration(endingCollaboration, feedback, rating);
        setEndingCollaboration(null);
        setFeedback('');
        setRating(0);
        displayConfirmation(t('volunteer.confirmations.feedbackSubmitted'));
    };

    // Shared Components
    const ConnectButton: React.FC<{ user: User }> = ({ user }) => {
        if (user.id === currentUser?.id) return null;
        const existingRequest = connectionRequests.find(req => (req.senderId === currentUser?.id && req.receiverId === user.id) || (req.senderId === user.id && req.receiverId === currentUser?.id));
        if (existingRequest?.status === 'accepted') return <Button onClick={() => startChat(user)}>{t('profile.message')}</Button>;
        if (existingRequest?.status === 'pending' && existingRequest.senderId === currentUser?.id) return <Button disabled>{t('profile.requestSent')}</Button>;
        return <Button onClick={() => setShowConnectModal(user)}>{t('profile.connect')}</Button>;
    };

    const UserCard: React.FC<{ user: Artisan | Volunteer }> = ({ user }) => (
        <Card className="flex flex-col text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardContent className="flex flex-col items-center flex-grow p-8">
                <img src={user.avatar} alt={user.name} className="w-28 h-28 rounded-full object-cover mx-auto mb-4 ring-4 ring-offset-4 ring-amber-500 cursor-pointer" onClick={() => setSelectedPortfolioUser(user)} />
                <h4 className="font-bold text-xl text-slate-800 dark:text-slate-100 cursor-pointer" onClick={() => setSelectedPortfolioUser(user)}>{user.name}</h4>
                {user.role === 'volunteer' && <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{(user as Volunteer).projectsCompleted} {t('volunteer.projectCompletedPlural', { count: (user as Volunteer).projectsCompleted })}</p>}
                {user.role === 'artisan' && <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{(user as Artisan).location}</p>}
                {user.role === 'volunteer' && <div className="flex flex-wrap justify-center gap-2 my-4">{(user as Volunteer).skills.slice(0, 3).map(skill => (<span key={skill} className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">{skill}</span>))}</div>}
            </CardContent>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl mt-auto"><ConnectButton user={user} /></div>
        </Card>
    );
    
    const tabs = currentUser?.role === 'artisan' 
        ? [{ id: 'my-projects', label: "My Projects" }, { id: 'find', label: t('volunteer.tabs.find') }]
        : [{ id: 'projects', label: t('volunteer.tabs.projects')}, {id: 'my-applications', label: "My Applications & Collaborations"}, { id: 'my-certifications', label: "My Certifications" }, { id: 'findArtisans', label: t('volunteer.tabs.findArtisans') }];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">{t('volunteer.main.title')}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('volunteer.main.description')}</p>
                </div>
                {currentUser?.role === 'artisan' && <Button onClick={() => setIsProjectModalOpen(true)}>{t('volunteer.projects.button')}</Button>}
            </div>
            
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-semibold text-base ${activeTab === tab.id ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content for Tabs */}
            {currentUser?.role === 'volunteer' ? (
                <>
                    {activeTab === 'projects' && <AvailableProjectsView />}
                    {activeTab === 'my-applications' && <MyApplicationsView />}
                    {activeTab === 'my-certifications' && <MyCertificationsView onViewCertificate={setViewingCertificate} />}
                    {activeTab === 'findArtisans' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{artisans.map(a => <UserCard key={a.id} user={a} />)}</div>}
                </>
            ) : (
                <>
                    {activeTab === 'my-projects' && <MyProjectsView setViewingApplicantsFor={setViewingApplicantsFor} setEndingCollaboration={setEndingCollaboration} />}
                    {activeTab === 'find' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{volunteers.map(v => <UserCard key={v.id} user={v} />)}</div>}
                </>
            )}

            {/* Modals & Confirmations */}
            {showConfirmation && <div className="fixed bottom-5 right-5 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fadeInUp">{showConfirmation}</div>}
            
            {showConnectModal && <ConnectModal user={showConnectModal} onConfirm={handleSendRequest} onCancel={() => setShowConnectModal(null)} />}
            {isProjectModalOpen && <PostProjectModal onSubmit={handlePostProject} onCancel={() => setIsProjectModalOpen(false)} data={newProjectData} setData={setNewProjectData} />}
            {viewingApplicantsFor && <ApplicantsModal project={viewingApplicantsFor} onClose={() => setViewingApplicantsFor(null)} />}
            {endingCollaboration && <EndCollaborationModal collaboration={endingCollaboration} onSubmit={handleEndCollaboration} onCancel={() => setEndingCollaboration(null)} rating={rating} setRating={setRating} feedback={feedback} setFeedback={setFeedback} />}
            {viewingCertificate && (
                <DigitalCertificate 
                    data={{
                        id: viewingCertificate.id,
                        artworkName: viewingCertificate.projectName,
                        artistName: viewingCertificate.artisanName,
                        craftTradition: viewingCertificate.skills.join(', '),
                        certifiedDate: new Date(viewingCertificate.issuedDate),
                        heritageStory: viewingCertificate.certificateText,
                    }}
                    onClose={() => setViewingCertificate(null)}
                />
            )}
        </div>
    );
};

// #region Volunteer-specific Views
const AvailableProjectsView = () => {
    // FIX: Destructured setSelectedPortfolioUser from context to make it available in this component's scope.
    const { t, currentUser, projects, artisans, applyForProject, projectApplications, setSelectedPortfolioUser } = useContext(AppContext)!;
    const openProjects = projects.filter(p => p.status === 'Open');

    const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
        const artisan = artisans.find(a => a.name === project.postedBy);
        const hasApplied = projectApplications.some(app => app.projectId === project.id && app.volunteerId === currentUser?.id);
        const handleApply = async () => {
            await applyForProject(project);
        };
        return (
            <Card className="transition-all duration-300 hover:shadow-xl flex flex-col">
                <CardContent className="flex-grow p-6">
                    <h4 className="font-bold text-lg mb-2">{project.title}</h4>
                    {artisan && <div className="flex items-center text-xs text-slate-500 mb-2 cursor-pointer" onClick={() => setSelectedPortfolioUser(artisan)}><img src={artisan.avatar} className="w-5 h-5 rounded-full object-cover mr-2"/><span>{t('volunteer.postedBy')} {project.postedBy}</span></div>}
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 h-20 overflow-hidden">{project.description}</p>
                    <div><p className="text-xs font-semibold mb-2">{t('volunteer.skillsNeeded')}</p><div className="flex flex-wrap gap-2">{project.skillsNeeded.map(skill => (<span key={skill} className="bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full">{skill}</span>))}</div></div>
                </CardContent>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl mt-auto"><Button onClick={handleApply} disabled={hasApplied} className="w-full">{hasApplied ? 'Applied' : 'Apply Now'}</Button></div>
            </Card>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {openProjects.length > 0 ? openProjects.map(p => <ProjectCard key={p.id} project={p} />) : <p className="text-slate-500 md:col-span-2 lg:col-span-3 text-center py-8">No open projects available.</p>}
        </div>
    );
};

const MyApplicationsView = () => {
    const { projectApplications, projects, collaborations } = useContext(AppContext)!;
    
    const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
        const styles: { [key: string]: string } = { accepted: 'bg-green-100 text-green-800', pending: 'bg-amber-100 text-amber-800', declined: 'bg-red-100 text-red-800' };
        return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
    };

    return (
        <Card>
            <CardContent>
                <div className="space-y-4">
                     <h3 className="text-xl font-bold">Active Collaborations</h3>
                     {collaborations.filter(c => c.status === 'in-progress').length > 0 ? collaborations.filter(c => c.status === 'in-progress').map(c => {
                         const project = projects.find(p => p.id === c.projectId);
                         return (
                            <div key={c.id} className="p-4 bg-teal-50 dark:bg-teal-900/50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{project?.title}</p>
                                    <p className="text-sm text-slate-500">Status: In Progress with {project?.postedBy}</p>
                                </div>
                            </div>
                         );
                     }) : <p className="text-slate-500 text-sm">You have no active collaborations.</p>}
                </div>
                <div className="space-y-4 mt-6">
                    <h3 className="text-xl font-bold">Past Applications</h3>
                    {projectApplications.length > 0 ? projectApplications.map(app => {
                        const project = projects.find(p => p.id === app.projectId);
                        return (
                            <div key={app.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{project?.title}</p>
                                    <p className="text-sm text-slate-500">Applied on: {new Date(app.applicationDate).toLocaleDateString()}</p>
                                </div>
                                <StatusBadge status={app.status} />
                            </div>
                        )
                    }) : <p className="text-slate-500 text-sm">You have not applied to any projects yet.</p>}
                </div>
            </CardContent>
        </Card>
    );
};

const MyCertificationsView: React.FC<{ onViewCertificate: (p: CompletedProject) => void }> = ({ onViewCertificate }) => {
    const { currentUser } = useContext(AppContext)!;
    const myCertificates = (currentUser as Volunteer)?.completedProjects || [];

    if (myCertificates.length === 0) {
        return <p className="text-slate-500 text-center py-8">You have not been issued any certificates yet.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myCertificates.map(cert => (
                <Card key={cert.id}>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <img src={cert.artisanAvatar} alt={cert.artisanName} className="w-12 h-12 rounded-full object-cover" />
                            <div>
                                <h4 className="font-bold text-lg">{cert.projectName}</h4>
                                <p className="text-sm text-slate-500">With {cert.artisanName}</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400">Issued on: {new Date(cert.issuedDate).toLocaleDateString()}</p>
                        <Button variant="secondary" className="w-full mt-4" onClick={() => onViewCertificate(cert)}>View Certificate</Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
// #endregion

// #region Artisan-specific Views & Components
const MyProjectsView: React.FC<{ setViewingApplicantsFor: (p: Project) => void, setEndingCollaboration: (c: Collaboration) => void }> = ({ setViewingApplicantsFor, setEndingCollaboration }) => {
    const { currentUser, projects, artisans, collaborations, projectApplications, volunteers, issueCertificate } = useContext(AppContext)!;
    const myProjects = projects.filter(p => artisans.find(a => a.name === p.postedBy)?.id === currentUser?.id);
    
    const myProjectIds = myProjects.map(p => p.id);
    const myCollabs = collaborations.filter(c => myProjectIds.includes(c.projectId));
    
    const openProjects = myProjects.filter(p => p.status === 'Open');
    const inProgressCollabs = myCollabs.filter(c => c.status === 'in-progress');
    const completedCollabs = myCollabs.filter(c => c.status === 'completed');

    const ProjectCard: React.FC<{ project: Project, applicantCount: number }> = ({ project, applicantCount }) => (
        <Card className="flex flex-col">
            <CardContent className="flex-grow p-6">
                <div className="flex justify-between items-start"><h4 className="font-bold text-lg mb-2">{project.title}</h4>{applicantCount > 0 && <span className="bg-amber-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">{applicantCount}</span>}</div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{project.description}</p>
            </CardContent>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl mt-auto"><Button className="w-full" onClick={() => setViewingApplicantsFor(project)} disabled={applicantCount === 0}>View Applicants</Button></div>
        </Card>
    );

    const CollaborationCard: React.FC<{ collab: Collaboration }> = ({ collab }) => {
        const project = projects.find(p => p.id === collab.projectId);
        const volunteer = volunteers.find(v => v.id === collab.volunteerId);
        return (
            <Card>
                <CardContent className="p-6">
                    <h4 className="font-bold text-lg">{project?.title}</h4>
                    {volunteer && <div className="flex items-center gap-3 text-sm mt-2"><img src={volunteer.avatar} alt={volunteer.name} className="w-8 h-8 rounded-full object-cover" /><p>With <span className="font-semibold">{volunteer.name}</span></p></div>}
                    <Button variant="secondary" className="w-full mt-4" onClick={() => setEndingCollaboration(collab)}>End Collaboration</Button>
                </CardContent>
            </Card>
        );
    };
    
    const CompletedCollaborationCard: React.FC<{ collab: Collaboration }> = ({ collab }) => {
        const project = projects.find(p => p.id === collab.projectId);
        const volunteer = volunteers.find(v => v.id === collab.volunteerId);
        
        const isCertificateIssued = volunteer?.completedProjects?.some(p => p.id === collab.id);

        return (
            <Card>
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <p className="font-bold">{project?.title}</p>
                        <p className="text-sm text-slate-500">Completed with {volunteer?.name}</p>
                    </div>
                    <Button 
                        onClick={() => issueCertificate(collab)}
                        disabled={isCertificateIssued}
                        variant={isCertificateIssued ? "secondary" : "primary"}
                    >
                        {isCertificateIssued ? "Certificate Issued" : "Issue Certificate"}
                    </Button>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-8">
            <section>
                <h3 className="text-2xl font-bold mb-4">Open for Applications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {openProjects.length > 0 ? openProjects.map(p => <ProjectCard key={p.id} project={p} applicantCount={projectApplications.filter(app => app.projectId === p.id && app.status === 'pending').length} />) : <p className="text-slate-500">You have no open projects.</p>}
                </div>
            </section>
            <section>
                <h3 className="text-2xl font-bold mb-4">In Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inProgressCollabs.length > 0 ? inProgressCollabs.map(c => <CollaborationCard key={c.id} collab={c} />) : <p className="text-slate-500">You have no projects in progress.</p>}
                </div>
            </section>
             <section>
                <h3 className="text-2xl font-bold mb-4">Completed</h3>
                <div className="space-y-4">
                    {completedCollabs.length > 0 ? completedCollabs.map(c => <CompletedCollaborationCard key={c.id} collab={c} />) : <p className="text-slate-500">You have no completed projects.</p>}
                </div>
            </section>
        </div>
    );
};
// #endregion

// #region Modals
const ConnectModal: React.FC<{ user: User, onConfirm: (u: User) => void, onCancel: () => void }> = ({ user, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md text-center"><CardHeader><CardTitle>Connect</CardTitle></CardHeader><CardContent><p>Are you sure you want to send a connection request to {user.name}?</p><div className="flex justify-center gap-4 mt-6"><Button variant="secondary" onClick={onCancel}>Cancel</Button><Button onClick={() => onConfirm(user)}>Send Request</Button></div></CardContent></Card>
    </div>
);

const PostProjectModal: React.FC<{ onSubmit: (e: React.FormEvent) => void, onCancel: () => void, data: any, setData: (d: any) => void }> = ({ onSubmit, onCancel, data, setData }) => {
    const { t } = useLocalization();
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg"><CardHeader><CardTitle>{t('volunteer.modal.title')}</CardTitle><p className="text-slate-500 mt-1">{t('volunteer.modal.description')}</p></CardHeader><CardContent><form onSubmit={onSubmit} className="space-y-4"><div><label htmlFor="proj-title" className="font-semibold block mb-1.5">{t('volunteer.modal.projectTitle')}</label><input type="text" id="proj-title" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} placeholder={t('volunteer.modal.projectTitlePlaceholder')} required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/></div><div><label htmlFor="proj-desc" className="font-semibold block mb-1.5">{t('volunteer.modal.projectDescription')}</label><textarea id="proj-desc" value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} placeholder={t('volunteer.modal.projectDescriptionPlaceholder')} required className="w-full p-2 border rounded h-24 dark:bg-slate-700 dark:border-slate-600"/></div><div><label htmlFor="proj-skills" className="font-semibold block mb-1.5">{t('volunteer.modal.skillsNeeded')}</label><input type="text" id="proj-skills" value={data.skills} onChange={(e) => setData({ ...data, skills: e.target.value })} placeholder={t('volunteer.modal.skillsNeededPlaceholder')} required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/></div><div className="flex justify-end gap-3 pt-4"><Button type="button" variant="secondary" onClick={onCancel}>{t('common.cancel')}</Button><Button type="submit">{t('volunteer.modal.postProject')}</Button></div></form></CardContent></Card>
        </div>
    );
};

const ApplicantsModal: React.FC<{ project: Project, onClose: () => void }> = ({ project, onClose }) => {
    const { projectApplications, volunteers, respondToApplication, setSelectedPortfolioUser } = useContext(AppContext)!;
    const applicants = projectApplications.filter(app => app.projectId === project.id && app.status === 'pending');
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl"><CardHeader><CardTitle>Applicants for "{project.title}"</CardTitle></CardHeader><CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">{applicants.length > 0 ? applicants.map(app => {
                const volunteer = volunteers.find(v => v.id === app.volunteerId);
                if (!volunteer) return null;
                return (<div key={app.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center gap-4">
                    <img src={volunteer.avatar} alt={volunteer.name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1"><p className="font-bold">{volunteer.name}</p><p className="text-sm text-slate-500">{volunteer.skills.join(', ')}</p></div>
                    <Button variant="ghost" onClick={() => { onClose(); setSelectedPortfolioUser(volunteer)}}>Profile</Button>
                    <div className="flex gap-2"><Button variant="primary" onClick={() => respondToApplication(app, 'accepted')}>Accept</Button><Button variant="secondary" onClick={() => respondToApplication(app, 'declined')}>Decline</Button></div>
                </div>)
            }) : <p className="text-slate-500 text-center py-4">No pending applicants for this project.</p>}</CardContent><div className="p-4 border-t dark:border-slate-700 flex justify-end"><Button variant="secondary" onClick={onClose}>Close</Button></div></Card>
        </div>
    )
};

const EndCollaborationModal: React.FC<{ collaboration: Collaboration, onSubmit: (e: React.FormEvent) => void, onCancel: () => void, rating: number, setRating: (r: number) => void, feedback: string, setFeedback: (f: string) => void }> = ({ collaboration, onSubmit, onCancel, rating, setRating, feedback, setFeedback }) => {
    const volunteer = useContext(AppContext)!.volunteers.find(v => v.id === collaboration.volunteerId);
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg"><CardHeader><CardTitle>End Collaboration with {volunteer?.name}</CardTitle></CardHeader><CardContent><form onSubmit={onSubmit} className="space-y-4">
                <div><label className="font-semibold block mb-1.5 text-center">Rate Your Experience</label><StarRating rating={rating} setRating={setRating} /></div>
                <div><label htmlFor="feedback" className="font-semibold block mb-1.5">Provide Feedback (optional)</label><textarea id="feedback" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="This will be added as a testimonial on the volunteer's profile." className="w-full p-2 border rounded h-24 dark:bg-slate-700 dark:border-slate-600"/></div>
                <p className="text-xs text-slate-500">Submitting this form will complete the project and allow you to issue a certificate from the 'Completed' section.</p>
                <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">Submit & End Collaboration</Button></div>
            </form></CardContent></Card>
        </div>
    );
}
// #endregion

export default VolunteerPage;