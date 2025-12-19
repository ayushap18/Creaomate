import React, { useState, useCallback, useMemo } from 'react';
import type { Part } from '@google/genai';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import { editImageWithAI } from '../services/geminiService';
import { useLocalization } from '../hooks/useLocalization';

const PhotoStudioPage: React.FC = () => {
    const { t } = useLocalization();
    const [originalImage, setOriginalImage] = useState<{b64: string; mime: string} | null>(null);
    const [prompt, setPrompt] = useState('');
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const [resultParts, setResultParts] = useState<Part[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

     const themes = useMemo(() => [
        {
            id: 'clean',
            name: t('photoStudio.themes.clean.name'),
            description: t('photoStudio.themes.clean.description'),
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" /></svg>,
            prompt: t('photoStudio.themes.clean.prompt')
        },
        {
            id: 'festive',
            name: t('photoStudio.themes.festive.name'),
            description: t('photoStudio.themes.festive.description'),
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
            prompt: t('photoStudio.themes.festive.prompt')
        },
        {
            id: 'artistic',
            name: t('photoStudio.themes.artistic.name'),
            description: t('photoStudio.themes.artistic.description'),
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>,
            prompt: t('photoStudio.themes.artistic.prompt')
        },
        {
            id: 'rustic',
            name: t('photoStudio.themes.rustic.name'),
            description: t('photoStudio.themes.rustic.description'),
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0112 3c1.398 0 2.743.57 3.728 1.506C18.5 7 19 10 19 12c1 1 2.343 2.343 2.343 2.343a8 8 0 01-3.686 4.314z" /></svg>,
            prompt: t('photoStudio.themes.rustic.prompt')
        }
    ], [t]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage({
                    b64: (reader.result as string).split(',')[1],
                    mime: file.type
                });
                setResultParts(null); // Clear previous results
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!originalImage || (!prompt && !selectedTheme)) return;
        setIsLoading(true);
        setResultParts(null);
        setError(null);

        const themePrompt = themes.find(t => t.id === selectedTheme)?.prompt || '';
        const finalPrompt = prompt ? (themePrompt ? `${themePrompt}. Additionally, ${prompt}` : prompt) : themePrompt;

        try {
            const result = await editImageWithAI(originalImage.b64, originalImage.mime, finalPrompt);
            setResultParts(result);
        } catch (e: any) {
            if (e.message === "QUOTA_EXCEEDED") {
                setError(t('common.error.quota'));
            } else {
                setError(e.message || t('photoStudio.error.unknown'));
            }
        } finally {
            setIsLoading(false);
        }
    }, [originalImage, prompt, selectedTheme, t, themes]);
    
    const editedImagePart = resultParts?.find(part => part.inlineData);
    const textPart = resultParts?.find(part => part.text);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">{t('photoStudio.main.title')}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('photoStudio.main.description')}</p>
            </div>
            
            <Card>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                        <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-2">{t('photoStudio.controls.uploadLabel')}</label>
                            <div className="relative w-full h-56 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors dark:bg-slate-800/50 dark:border-slate-600 dark:hover:bg-slate-700/50">
                                {originalImage ? (
                                    <img src={`data:${originalImage.mime};base64,${originalImage.b64}`} alt="upload preview" className="h-full w-full object-contain p-2 rounded-lg" />
                                ) : (
                                    <div className="text-center text-slate-500 dark:text-slate-400">
                                        <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        <p className="mt-2">{t('photoStudio.controls.clickToUpload')}</p>
                                    </div>
                                )}
                                <input type="file" className="absolute w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*"/>
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-2">{t('photoStudio.controls.themeLabel')}</label>
                             <div className="grid grid-cols-2 gap-4">
                                {themes.map(theme => (
                                    <button 
                                        key={theme.id} 
                                        onClick={() => setSelectedTheme(theme.id === selectedTheme ? null : theme.id)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${selectedTheme === theme.id ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-lg' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                                    >
                                        <div className="text-teal-600 dark:text-teal-400">{theme.icon}</div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{theme.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{theme.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="prompt" className="font-semibold text-slate-700 dark:text-slate-200 block mb-2">
                                {selectedTheme ? t('photoStudio.controls.promptLabelOptional') : t('photoStudio.controls.promptLabel')}
                            </label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={t('photoStudio.controls.promptPlaceholder')}
                                className="w-full p-3 border border-slate-300 rounded-xl h-28 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow dark:bg-slate-700 dark:border-slate-600"
                                disabled={isLoading}
                            />
                        </div>
                        <Button onClick={handleGenerate} isLoading={isLoading} disabled={!originalImage || (!prompt && !selectedTheme)}>
                            {isLoading 
                                ? t('photoStudio.controls.generatingButton')
                                : t('photoStudio.controls.enhanceButton')}
                        </Button>
                    </div>

                    {/* Results */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200">{t('photoStudio.result.title')}</h3>
                        <div className="w-full aspect-square border border-slate-200 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 relative overflow-hidden">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <svg className="animate-spin h-10 w-10 text-teal-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-slate-600 dark:text-slate-300 font-medium">{t('photoStudio.result.loading')}</p>
                                </div>
                            )}
                            {error && !isLoading && <p className="text-red-500 p-4 text-center">{error}</p>}
                            
                            {editedImagePart && (
                                <img 
                                    src={`data:${editedImagePart.inlineData?.mimeType};base64,${editedImagePart.inlineData?.data}`} 
                                    alt="Edited result" 
                                    className="h-full w-full object-contain p-2 rounded-lg" 
                                />
                            )}
                            
                            {textPart && (
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-sm text-white text-xs text-center">
                                    {textPart.text}
                                </div>
                            )}

                            {!isLoading && !resultParts && !error && <p className="text-slate-500 dark:text-slate-400">{t('photoStudio.result.placeholder')}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PhotoStudioPage;