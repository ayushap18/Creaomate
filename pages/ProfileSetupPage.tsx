import React, { useContext, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import { LogoIcon } from '../components/common/Icons';
import type { Artisan, Volunteer } from '../types';

const ProfileSetupPage: React.FC = () => {
    const { currentUser, updateUserProfile } = useContext(AppContext)!;
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        location: (currentUser as Artisan)?.location || '',
        bio: (currentUser as Artisan)?.bio || '',
        story: (currentUser as Artisan)?.story || '',
        skills: (currentUser as Volunteer)?.skills?.join(', ') || '',
        motivation: (currentUser as Volunteer)?.motivation || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            ...currentUser,
            ...formData,
            skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        };
        updateUserProfile(finalData);
    };

    const renderArtisanForm = () => (
        <>
            <h2 className="text-2xl font-bold">Welcome, Artisan!</h2>
            <p className="text-slate-500 mt-1 mb-6">Let's set up your public profile. Tell the world your story.</p>
            <div>
                <label htmlFor="name" className="font-semibold block mb-1.5">Your Name</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
                <label htmlFor="location" className="font-semibold block mb-1.5">Location</label>
                <input type="text" name="location" id="location" placeholder="e.g., Jaipur, Rajasthan" value={formData.location} onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
                <label htmlFor="bio" className="font-semibold block mb-1.5">Short Bio</label>
                <textarea name="bio" id="bio" placeholder="A short, catchy bio to appear on your profile." value={formData.bio} onChange={handleChange} className="w-full p-3 border rounded-lg h-24 dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
                <label htmlFor="story" className="font-semibold block mb-1.5">Your Story (Optional)</label>
                <textarea name="story" id="story" placeholder="Share the story behind your craft, your inspiration, or your heritage." value={formData.story} onChange={handleChange} className="w-full p-3 border rounded-lg h-32 dark:bg-slate-700 dark:border-slate-600" />
            </div>
        </>
    );

    const renderVolunteerForm = () => (
        <>
            <h2 className="text-2xl font-bold">Welcome, Volunteer!</h2>
            <p className="text-slate-500 mt-1 mb-6">Let's build your profile so artisans can find you.</p>
            <div>
                <label htmlFor="name" className="font-semibold block mb-1.5">Your Name</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
                <label htmlFor="skills" className="font-semibold block mb-1.5">Your Skills</label>
                <input type="text" name="skills" id="skills" placeholder="e.g., Photography, Graphic Design, Marketing" value={formData.skills} onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600" />
                <p className="text-xs text-slate-400 mt-1">Enter skills separated by commas.</p>
            </div>
            <div>
                <label htmlFor="bio" className="font-semibold block mb-1.5">Short Bio</label>
                <textarea name="bio" id="bio" placeholder="Tell us a little about yourself and your experience." value={formData.bio} onChange={handleChange} className="w-full p-3 border rounded-lg h-24 dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
                <label htmlFor="motivation" className="font-semibold block mb-1.5">Your Motivation (Optional)</label>
                <textarea name="motivation" id="motivation" placeholder="What inspires you to volunteer with artisans?" value={formData.motivation} onChange={handleChange} className="w-full p-3 border rounded-lg h-24 dark:bg-slate-700 dark:border-slate-600" />
            </div>
        </>
    );

    const renderCustomerForm = () => (
         <>
            <h2 className="text-2xl font-bold">Welcome!</h2>
            <p className="text-slate-500 mt-1 mb-6">Just one step before you start exploring.</p>
            <div>
                <label htmlFor="name" className="font-semibold block mb-1.5">Confirm Your Name</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600" />
            </div>
        </>
    );

    const renderForm = () => {
        switch (currentUser?.role) {
            case 'artisan': return renderArtisanForm();
            case 'volunteer': return renderVolunteerForm();
            case 'customer': return renderCustomerForm();
            default: return <p>Loading form...</p>;
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="flex items-center space-x-3 mb-8">
                <LogoIcon />
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    Complete Your Profile
                </h1>
            </div>
            <Card className="w-full max-w-lg">
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {renderForm()}
                        <Button type="submit" className="w-full !mt-6 text-base">
                            Save and Continue
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfileSetupPage;