import React, { useContext, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { LogoIcon, GoogleIcon } from '../components/common/Icons';
import Button from '../components/common/Button';

const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, setAuthPage, bypassLogin } = useContext(AppContext)!;
  const { t } = useLocalization();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const getUnauthorizedDomainError = () => {
    const hostname = window.location.hostname;
    return `Firebase Authorization Error: This app's domain is not authorized for sign-in.

This is a required security step. Please add the correct domain to the "Authorized domains" list in your Firebase project settings.

How to Fix:
1. Go to your Firebase Console for project 'artisan-ally-4a1b2'.
2. Go to Authentication -> Settings tab -> Authorized domains.
3. Click "Add domain".
4. Add the following domain:
   • ${hostname}

After adding the domain, wait a minute, then refresh this app.`;
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
        await login(email, password);
    } catch(err: any) {
        if (err.code === 'auth/unauthorized-domain') {
            setError(getUnauthorizedDomainError());
        } else if (err.code === 'auth/invalid-credential') {
            setError('Invalid email or password.');
        } else {
            setError('Failed to log in. Check the console for details.');
        }
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
        await loginWithGoogle();
    } catch(err: any) {
        if (err.code === 'auth/unauthorized-domain') {
            setError(getUnauthorizedDomainError());
        } else {
            setError(`Failed to log in with Google: ${err.message}`);
        }
        console.error(err);
    } finally {
        setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
        <Button 
            variant="ghost" 
            onClick={bypassLogin} 
            className="absolute top-4 right-4 z-20"
        >
            Enter as Guest
        </Button>
        {/* Background decorative shapes */}
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-teal-200/50 dark:bg-teal-900/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-amber-200/50 dark:bg-amber-900/40 rounded-full blur-3xl animate-pulse animation-delay-4000" />

        <div className="w-full max-w-md relative z-10">
            <div className="flex justify-center items-center space-x-3 mb-6">
                <LogoIcon />
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    ArtisanX
                </h1>
            </div>
            
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-300/20 dark:shadow-black/20">
                <div className="p-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome Back!</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Log in to continue your journey.</p>
                    </div>

                    <div className="mt-6">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                                <input 
                                    id="email" 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                    className="w-full p-3 bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-lg transition-colors focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label htmlFor="password"className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                                <input 
                                    id="password" 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                    className="w-full p-3 bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-lg transition-colors focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 outline-none" 
                                />
                            </div>
                            {error && <pre className="text-sm text-red-600 p-3 bg-red-50 dark:bg-red-900/20 rounded-md whitespace-pre-wrap font-sans">{error}</pre>}
                            <Button type="submit" className="w-full text-base py-3 mt-2" isLoading={isLoading}>
                                Log In
                            </Button>
                        </form>
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-300 dark:border-slate-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm px-2 text-slate-500 dark:text-slate-400">Or continue with</span>
                        </div>
                    </div>

                    <div>
                        <Button variant="social" type="button" onClick={handleGoogleLogin} className="w-full" isLoading={isGoogleLoading}>
                            <GoogleIcon className="w-5 h-5 mr-3" />
                            Log In with Google
                        </Button>
                    </div>
                    
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                        Don't have an account?{' '}
                        <button onClick={() => setAuthPage('signup')} className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                            Sign Up
                        </button>
                    </p>
                </div>
            </div>
        </div>
        <style>{`
            .animation-delay-4000 { animation-delay: 4s; }
        `}</style>
    </div>
  );
};

export default LoginPage;