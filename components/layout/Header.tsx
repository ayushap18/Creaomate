import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Button from '../common/Button';
import type { Role } from '../../types';

interface HeaderProps {
    title: string;
}

const RoleSwitcher: React.FC = () => {
    const { currentUser, switchUserRole } = useContext(AppContext)!;

    if (!currentUser) return null;

    const roles: Role[] = ['artisan', 'volunteer', 'customer'];
    const otherRoles = roles.filter(r => r !== currentUser.role);

    const roleColors: Record<Role, string> = {
        artisan: 'text-teal-600 bg-teal-50 hover:bg-teal-100 dark:text-teal-400 dark:bg-teal-500/10 dark:hover:bg-teal-500/20',
        volunteer: 'text-sky-600 bg-sky-50 hover:bg-sky-100 dark:text-sky-400 dark:bg-sky-500/10 dark:hover:bg-sky-500/20',
        customer: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20',
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">Switch View:</span>
            {otherRoles.map(role => (
                <Button 
                    key={role} 
                    onClick={() => switchUserRole(role)}
                    className={`!px-4 !py-2 text-sm capitalize ${roleColors[role]}`}
                >
                    {role}
                </Button>
            ))}
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <header className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6 flex items-center justify-between sticky top-0 z-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 truncate pr-4">{title}</h1>
            <RoleSwitcher />
        </header>
    );
};

export default Header;