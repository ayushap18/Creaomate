import React, { useState, useCallback, useRef, useEffect, useContext } from 'react';
import type { GenerateContentResponse, Operation, GenerateVideosResponse } from '@google/genai';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import { generateDescription, generatePricingSuggestion, generateVideoFromStory, getVideoGenerationStatus, transcribeAndGenerateFromAudio, generateProductDetailsFromInput, transcribeAudio, downloadVideo } from '../services/geminiService';
import { generateSocialMediaPost } from '../services/geminiService';
import type { Product, Certificate } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { AppContext } from '../contexts/AppContext';

// #region Reusable Components
const SocialPlatformIcon: React.FC<{ platform: 'instagram' | 'facebook' | 'whatsapp' }> = ({ platform }) => {
    const icons = {
        instagram: <svg viewBox="0 0 24 24" className="w-8 h-8"><defs><linearGradient id="insta-grad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" style={{stopColor:'#f09433'}} /><stop offset="25%" style={{stopColor:'#e6683c'}} /><stop offset="50%" style={{stopColor:'#dc2743'}} /><stop offset="75%" style={{stopColor:'#cc2366'}} /><stop offset="100%" style={{stopColor:'#bc1888'}} /></linearGradient></defs><path fill="url(#insta-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664 4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.441c-3.117 0-3.491.011-4.71.066-2.839.13-4.111 1.4-4.24 4.24-.055 1.22-.066 1.593-.066 4.71s.011 3.491.066 4.71c.13 2.839 1.4 4.111 4.24 4.24 1.218.055 1.593.066 4.71.066s3.491-.011 4.71-.066c2.839-.13 4.111-1.4 4.24-4.24.055-1.22.066-1.593.066-4.71s-.011-3.491-.066-4.71c-.13-2.839-1.4-4.111-4.24-4.24-1.218-.055-1.593.066-4.71-.066zm0 2.882a4.512 4.512 0 100 9.024 4.512 4.512 0 000-9.024zM12 15a3 3 0 110-6 3 3 0 010 6zm4.805-7.872a1.08 1.08 0 100-2.16 1.08 1.08 0 000 2.16z" /></svg>,
        facebook: <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#1877F2]" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>,
        whatsapp: <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#25D366]" fill="currentColor"><path d="M12.04 2.01C5.43 2.01 0 7.43 0 14.05c0 2.37.7 4.59 1.97 6.48l-2 7.45 7.63-2.02c1.82 1.15 3.96 1.8 6.2 1.8h.01c6.6 0 11.96-5.41 11.96-12.03C24 7.44 18.64 2.01 12.04 2.01zM12.04 23.09c-2.13 0-4.17-.6-5.91-1.72l-.42-.25-4.38 1.15 1.18-4.28-.28-.44c-1.21-1.9-1.85-4.13-1.85-6.49 0-5.52 4.49-10 10-10s10 4.48 10 10-4.49 10-10 10zm5.2-6.52c-.28-.14-1.65-.81-1.9-.91-.25-.1-.44-.14-.62.14-.18.28-.72.91-.88 1.1-.16.18-.32.21-.6.07-.28-.14-1.18-.44-2.25-1.39-1.07-.95-1.79-2.12-2-2.48-.21-.36-.02-.55.12-.69.13-.13.28-.32.42-.48.14-.16.18-.28.28-.46.1-.18.05-.32-.02-.46-.07-.14-.62-1.5-.85-2.05-.23-.55-.46-.48-.62-.48h-.52c-.18 0-.46.07-.7.35-.24.28-.92 1.02-.92 2.48s.94 2.89 1.07 3.09c.13.2 1.85 2.96 4.49 4.22 2.64 1.26 2.64.84 3.12.79.48-.05 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32c-.07-.12-.26-.2-.53-.34z"/></svg>,
    };
    return icons[platform];
};
// #endregion

// #region Child Components for Marketplace
const AIProductWizard: React.FC<{ onGenerated: (data: any) => void, onBack: () => void }> = ({ onGenerated, onBack }) => {
    const { t, language } = useLocalization();
    const [image, setImage] = useState<{ b64: string; mime: string; url: string } | null>(null);
    const [textInput, setTextInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setImage({ b64: dataUrl.split(',')[1], mime: file.type, url: dataUrl });
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!image && !textInput.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const responseText = await generateProductDetailsFromInput(language, image?.b64, image?.mime, textInput);
            const parsed = JSON.parse(responseText);
            if (parsed.error) throw new Error(parsed.error);
            onGenerated({
                image: image?.url,
                name: parsed.productName,
                category: parsed.category,
                description: parsed.generatedDescription,
                longDescription: parsed.generatedDescription,
                pricingSuggestion: parsed.pricingSuggestion,
            });
        } catch (e: any) {
            setError(e.message || t('marketplace.wizard.error'));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="animate-fadeInUp">
            <Button variant="secondary" onClick={onBack} className="mb-6">&larr; {t('sidebar.marketplace')}</Button>
            <Card>
                <CardHeader>
                    <CardTitle>{t('marketplace.wizard.pageTitle')}</CardTitle>
                    <p className="text-slate-500 mt-1">{t('marketplace.wizard.pageSubtitle')}</p>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="relative w-full h-64 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                        {image ? <img src={image.url} alt="preview" className="h-full w-full object-contain p-2"/> : <p className="text-slate-500 dark:text-slate-400">{t('photoStudio.controls.clickToUpload')}</p>}
                        <input type="file" className="absolute w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*"/>
                    </div>
                     <div>
                        <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Or Describe Your Product</label>
                        <textarea 
                            value={textInput} 
                            onChange={e => setTextInput(e.target.value)} 
                            placeholder="e.g., 'Hand-painted ceramic bowl with blue floral patterns...'" 
                            className="w-full p-2 border rounded h-24 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                        />
                    </div>
                    {error && <div className="mt-4 p-3 text-red-600 bg-red-100 rounded-lg">{error}</div>}
                    <Button onClick={handleGenerate} isLoading={isLoading} disabled={!image && !textInput.trim()} className="w-full max-w-sm mx-auto">{t('marketplace.wizard.generateButton')}</Button>
                </CardContent>
            </Card>
        </div>
    );
};

const AIRecordingAnalysis: React.FC<{ onGenerated: (data: any) => void, onBack: () => void }> = ({ onGenerated, onBack }) => {
    const { t, language } = useLocalization();
    const [image, setImage] = useState<{ b64: string; mime: string; url: string } | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setImage({ b64: dataUrl.split(',')[1], mime: file.type, url: dataUrl });
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                audioChunksRef.current = [];
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setError(null);
        } catch (err) {
            setError("Microphone access was denied. Please enable it in your browser settings.");
        }
    };

    const handleStopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    const handleGenerate = async () => {
        if (!audioBlob || !image) return;
        setIsLoading(true);
        setError(null);
        try {
            const base64Audio = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            });
            const responseText = await transcribeAndGenerateFromAudio(base64Audio, audioBlob.type, language, image.b64, image.mime);
            const parsed = JSON.parse(responseText);
            if (parsed.error) throw new Error(parsed.error);
             onGenerated({
                image: image.url,
                name: parsed.productName,
                category: parsed.category,
                description: parsed.generatedDescription,
                longDescription: parsed.generatedDescription,
                pricingSuggestion: parsed.pricingSuggestion,
                transcription: parsed.transcription,
            });
        } catch (e: any) {
            setError(e.message || t('marketplace.voice.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <div className="animate-fadeInUp">
            <Button variant="secondary" onClick={onBack} className="mb-6">&larr; {t('sidebar.marketplace')}</Button>
            <Card>
                <CardHeader>
                    <CardTitle>{t('marketplace.voice.pageTitle')}</CardTitle>
                    <p className="text-slate-500 mt-1">{t('marketplace.voice.pageSubtitle')}</p>
                </CardHeader>
                <CardContent className="p-8 text-center space-y-6">
                    <div className="relative w-full h-64 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                        {image ? <img src={image.url} alt="preview" className="h-full w-full object-contain p-2"/> : <p className="text-slate-500 dark:text-slate-400">1. Upload a Photo</p>}
                        <input type="file" className="absolute w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*"/>
                    </div>
                    <div>
                        <button onClick={isRecording ? handleStopRecording : handleStartRecording} className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500 text-white'}`}>
                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7v2h6v-2h-2v-2.07z" clipRule="evenodd" /></svg>
                        </button>
                        <p className="mt-4 font-semibold">{isRecording ? t('marketplace.voice.stopRecording') : '2. ' + t('marketplace.voice.startRecording')}</p>
                        {audioBlob && !isRecording && <p className="text-green-600 font-semibold mt-2">Recording finished!</p>}
                    </div>

                    {error && <div className="mt-4 p-3 text-red-600 bg-red-100 rounded-lg">{error}</div>}
                    <Button 
                        onClick={handleGenerate} 
                        isLoading={isLoading} 
                        disabled={!audioBlob || !image} 
                        className="w-full max-w-sm mx-auto"
                    >
                        {isLoading ? "AI is processing..." : "3. " + t('marketplace.voice.process')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

const ReviewAndPublish: React.FC<{ initialData: Partial<Product> & { transcription?: string }, onBack: () => void, pricingSuggestion?: any }> = ({ initialData, onBack, pricingSuggestion }) => {
    // FIX: Destructured properties from AppContext instead of useLocalization.
    const { t, language } = useLocalization();
    const { addProduct, certificates, setActivePage } = useContext(AppContext)!;
    const [productData, setProductData] = useState<Partial<Product>>(initialData);
    const [step, setStep] = useState<'review' | 'success'>('review');
    const [selectedCertId, setSelectedCertId] = useState<string | undefined>(initialData.certificateId);
    
    // State for video generation
    const [videoGenerationStatus, setVideoGenerationStatus] = useState<'idle' | 'generating' | 'polling' | 'done' | 'error'>('idle');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [pollingMessage, setPollingMessage] = useState('');
    const operationRef = useRef<Operation<GenerateVideosResponse> | null>(null);
    const pollTimeoutRef = useRef<number | null>(null);
    const [videoErrorType, setVideoErrorType] = useState<'none' | 'generic' | 'deployed_config'>('none');
    const [videoErrorMessage, setVideoErrorMessage] = useState('');


    // State for modals
    const [isVideoPromptModalOpen, setIsVideoPromptModalOpen] = useState(false);
    const [videoStoryText, setVideoStoryText] = useState('');
    const [isRecordingStory, setIsRecordingStory] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
    const storyMediaRecorderRef = useRef<MediaRecorder | null>(null);
    const storyAudioChunksRef = useRef<Blob[]>([]);

    const unassignedCerts = certificates.filter(c => !c.assignedToProductId);
    
    useEffect(() => {
        // Cleanup timeout on component unmount
        return () => {
            if (pollTimeoutRef.current) {
                clearTimeout(pollTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!process.env.API_KEY) {
            setVideoGenerationStatus('error');
            setVideoErrorType('deployed_config');
        }
    }, []); 

    const handleDataChange = useCallback((field: keyof Omit<Product, 'id' | 'artisanId' | 'dateAdded' | 'certificateId'>, value: any) => {
        setProductData(prev => ({ ...prev, [field]: value }));
    }, []);

    useEffect(() => {
        const reassuringMessages = ["Analyzing the story...", "Gathering visual elements...", "Composing initial scenes...", "Rendering frames...", "Applying visual effects...", "This is taking a bit longer than usual, but we're getting there...", "Finalizing the video...", "Almost ready!"];
        let messageIndex = 0;
    
        const poll = async () => {
            if (!operationRef.current) return;
            
            try {
                const updatedOp = await getVideoGenerationStatus(operationRef.current);
                operationRef.current = updatedOp;
    
                if (updatedOp.done) {
                    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
                    setVideoGenerationStatus('done');
                    const downloadLink = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
                    if (downloadLink) {
                        const videoUrl = await downloadVideo(downloadLink);
                        setGeneratedVideoUrl(videoUrl);
                        handleDataChange('storyVideoUrl', videoUrl);
                    } else {
                         throw new Error("Video generation finished but no download link was provided.");
                    }
                } else {
                    messageIndex = (messageIndex + 1) % reassuringMessages.length;
                    setPollingMessage(reassuringMessages[messageIndex]);
                    pollTimeoutRef.current = window.setTimeout(poll, 10000);
                }
            } catch (error: any) {
                if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
                setVideoGenerationStatus('error');
                if (error.message === "API_KEY_ERROR") {
                    setVideoErrorType('deployed_config');
                } else {
                    setVideoErrorType('generic');
                    setVideoErrorMessage(error.message || "An error occurred while checking video status.");
                }
            }
        };
    
        if (videoGenerationStatus === 'polling') {
            poll();
        }
    
        return () => {
            if (pollTimeoutRef.current) {
                clearTimeout(pollTimeoutRef.current);
            }
        };
    }, [videoGenerationStatus, handleDataChange]);

    const handleGenerateVideo = async () => {
        if (!videoStoryText) {
            alert("Please provide a story for the video.");
            return;
        }

        setVideoErrorType('none');
        setGeneratedVideoUrl(null);
        setIsVideoPromptModalOpen(false);

        try {
            setVideoGenerationStatus('generating');
            const operation = await generateVideoFromStory(videoStoryText, language);
            operationRef.current = operation;
            setVideoGenerationStatus('polling');
        } catch (e: any) {
            setVideoGenerationStatus('error');
            if (e.message === "API_KEY_ERROR") {
                setVideoErrorType('deployed_config');
            } else {
                setVideoErrorType('generic');
                setVideoErrorMessage(e.message || "Could not start video generation.");
            }
        } finally {
            setVideoStoryText('');
        }
    };
    
    const openVideoPromptWithKeyCheck = async () => {
        if (!process.env.API_KEY) {
             setVideoGenerationStatus('error');
             setVideoErrorType('deployed_config');
             return;
        }
        setIsVideoPromptModalOpen(true);
    };

    const handleUploadToMarketplace = () => {
        if (!productData.name || !productData.description || !productData.price || !productData.image) {
            alert("Please fill in all required fields: Name, Description, Price, and Image.");
            return;
        }
        addProduct(productData as any, selectedCertId);
        setStep('success');
    };

     // #region Video Story Recording Logic
    const handleTranscribeStory = async (audioBlob: Blob) => {
        setIsTranscribing(true);
        setTranscriptionError(null);
        try {
            const base64Audio = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            });
            const transcribedText = await transcribeAudio(base64Audio, audioBlob.type, language);
            setVideoStoryText(transcribedText);
        } catch (e: any) {
            setTranscriptionError(e.message || "Failed to transcribe audio.");
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleStartStoryRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            storyMediaRecorderRef.current = new MediaRecorder(stream);
            storyMediaRecorderRef.current.ondataavailable = (event) => {
                storyAudioChunksRef.current.push(event.data);
            };
            storyMediaRecorderRef.current.onstop = () => {
                const blob = new Blob(storyAudioChunksRef.current, { type: 'audio/webm' });
                handleTranscribeStory(blob);
                storyAudioChunksRef.current = [];
            };
            storyMediaRecorderRef.current.start();
            setIsRecordingStory(true);
            setTranscriptionError(null);
        } catch (err) {
            setTranscriptionError("Microphone access was denied. Please enable it in your browser settings.");
        }
    };

    const handleStopStoryRecording = () => {
        storyMediaRecorderRef.current?.stop();
        setIsRecordingStory(false);
    };
    // #endregion
    
    if (step === 'success') {
        return (
            <Card className="text-center p-12 animate-fadeInUp">
                <h2 className="text-2xl font-bold">{t('marketplace.product.successTitle')}</h2>
                <p className="mt-2 text-slate-500">{t('marketplace.product.successDescription')}</p>
                <div className="mt-6">
                    <Button onClick={onBack}>{t('marketplace.product.successCreateAnother')}</Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6 animate-fadeInUp">
            <Button variant="secondary" onClick={onBack}>&larr; {t('sidebar.marketplace')}</Button>
            <h2 className="text-3xl font-bold text-center">{t('marketplace.product.reviewAndPublish')}</h2>
             {initialData.transcription && (
                <Card>
                    <CardHeader><CardTitle>Transcription Summary</CardTitle></CardHeader>
                    <CardContent>
                        <p className="italic text-slate-600 dark:text-slate-300">"{initialData.transcription}"</p>
                    </CardContent>
                </Card>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Editable Form */}
                <div className="space-y-6">
                    <Card className="lg:col-span-1">
                        <CardContent className="space-y-4">
                            <div><label className="font-semibold block mb-1">Product Name</label><input type="text" value={productData.name || ''} onChange={e => handleDataChange('name', e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/></div>
                            <div><label className="font-semibold block mb-1">Description</label><textarea value={productData.description || ''} onChange={e => handleDataChange('description', e.target.value)} className="w-full p-2 border rounded h-32 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/></div>
                            <div><label className="font-semibold block mb-1">Craft Tradition</label><input type="text" value={productData.craftTradition || ''} onChange={e => handleDataChange('craftTradition', e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/></div>
                            <div><label className="font-semibold block mb-1">Category</label><input type="text" value={productData.category || ''} onChange={e => handleDataChange('category', e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/></div>
                            <div>
                                <label className="font-semibold block mb-1">Final Price (₹)</label>
                                {pricingSuggestion && <p className="text-sm text-slate-500 mb-2">AI Suggests: ₹{pricingSuggestion.minPrice} - ₹{pricingSuggestion.maxPrice}</p>}
                                <input type="number" value={productData.price || ''} onChange={e => handleDataChange('price', Number(e.target.value))} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Attach Digital Certificate (Optional)</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {unassignedCerts.length > 0 ? (
                                    unassignedCerts.map(cert => (
                                        <label key={cert.id} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${selectedCertId === cert.id ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/50' : 'border-slate-200 dark:border-slate-700'}`}>
                                            <input type="radio" name="certificate" value={cert.id} checked={selectedCertId === cert.id} onChange={() => setSelectedCertId(cert.id)} className="w-5 h-5 text-teal-600 focus:ring-teal-500" />
                                            <img src={cert.image} alt={cert.artworkName} className="w-12 h-12 rounded-md object-cover mx-4" />
                                            <span className="font-semibold">{cert.artworkName}</span>
                                        </label>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-center text-sm py-4">You have no unassigned certificates.</p>
                                )}
                            </div>
                             <Button variant="secondary" className="w-full mt-4" onClick={() => setActivePage('nft')}>
                                Create New Certificate
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                {/* Preview and Optional Steps */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>{t('marketplace.product.preview')}</CardTitle></CardHeader>
                        <CardContent>
                            <div className="w-full max-w-xs mx-auto">
                                <div className="p-0 overflow-hidden group transition-all duration-300 flex flex-col border rounded-lg">
                                    <div className="relative overflow-hidden aspect-square bg-slate-100 dark:bg-slate-700"><img src={productData.image} alt={productData.name} className="w-full h-full object-cover"/></div>
                                    <div className="p-4 flex-grow flex flex-col"><p className="text-xs font-semibold text-teal-600">{productData.category || 'Category'}</p><h4 className="font-bold text-md truncate">{productData.name || 'Product Name'}</h4><div className="mt-auto pt-2"><p className="text-lg font-bold">₹{productData.price?.toLocaleString() || '0'}</p></div></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>{t('marketplace.video.title')}</CardTitle></CardHeader>
                        <CardContent className="text-center">
                             {videoGenerationStatus === 'idle' && (
                                <Button onClick={openVideoPromptWithKeyCheck}>{t('marketplace.video.button')}</Button>
                            )}
                            {(videoGenerationStatus === 'generating' || videoGenerationStatus === 'polling') && (
                                <div className="flex flex-col items-center justify-center p-4">
                                    <svg className="animate-spin h-8 w-8 text-teal-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="font-semibold text-slate-600 dark:text-slate-300">{t('marketplace.video.generating')}</p>
                                    <p className="text-sm text-slate-500 mt-1">{pollingMessage || 'Please wait...'}</p>
                                </div>
                            )}
                            {videoGenerationStatus === 'done' && generatedVideoUrl && (
                                <div>
                                    <video controls src={generatedVideoUrl} className="w-full rounded-lg shadow-md" />
                                    <Button variant="secondary" className="mt-4" onClick={openVideoPromptWithKeyCheck}>Generate a new video</Button>
                                </div>
                            )}
                            {videoGenerationStatus === 'error' && (
                                <div className="p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-left">
                                    {videoErrorType === 'deployed_config' ? (
                                        <>
                                            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Video Generation Unavailable</h4>
                                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                                                This feature requires server configuration by a site administrator. If you are the administrator, please verify the following:
                                            </p>
                                            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                                <li>A valid API key is set in the <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">API_KEY</code> environment variable.</li>
                                                <li>The Google Cloud project for the key has <strong className="text-slate-700 dark:text-slate-200">Billing enabled</strong>.</li>
                                                <li>The <strong className="text-slate-700 dark:text-slate-200">Vertex AI API</strong> is enabled in the project.</li>
                                            </ul>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-bold">Generation Failed</p>
                                            <p className="text-sm mt-1">{videoErrorMessage}</p>
                                        </>
                                    )}
                                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                                        <Button variant="secondary" onClick={openVideoPromptWithKeyCheck}>Try Again</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="text-center">
                <Button onClick={handleUploadToMarketplace} className="w-full max-w-md mx-auto text-lg py-4">{t('marketplace.product.uploadButton')}</Button>
            </div>

            {isVideoPromptModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-lg">
                        <CardHeader>
                            <CardTitle>{t('marketplace.video.modalTitle')}</CardTitle>
                            <p className="text-slate-500 mt-1">{t('marketplace.video.modalDescription')}</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="relative">
                                <textarea
                                    value={videoStoryText}
                                    onChange={e => setVideoStoryText(e.target.value)}
                                    placeholder={t('marketplace.video.modalPlaceholder')}
                                    className="w-full p-3 pr-12 border rounded h-32 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                                    disabled={isRecordingStory || isTranscribing}
                                />
                                <button 
                                    onClick={isRecordingStory ? handleStopStoryRecording : handleStartStoryRecording} 
                                    className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${isRecordingStory ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}
                                >
                                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7v2h6v-2h-2v-2.07z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                             {isTranscribing && <p className="text-sm text-slate-500">{t('marketplace.video.modalTranscribing')}</p>}
                             {transcriptionError && <p className="text-sm text-red-500">{transcriptionError}</p>}
                            
                            <div className="flex justify-end gap-2">
                                <Button variant="secondary" onClick={() => setIsVideoPromptModalOpen(false)}>{t('common.cancel')}</Button>
                                <Button onClick={handleGenerateVideo} disabled={!videoStoryText || isRecordingStory || isTranscribing}>{t('marketplace.video.button')}</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

const VideoAdCreator: React.FC = () => {
    const { t, language } = useLocalization();
    const [story, setStory] = useState('');

    const [videoGenerationStatus, setVideoGenerationStatus] = useState<'idle' | 'generating' | 'polling' | 'done' | 'error'>('idle');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [pollingMessage, setPollingMessage] = useState('');
    const operationRef = useRef<Operation<GenerateVideosResponse> | null>(null);
    const pollTimeoutRef = useRef<number | null>(null);
    const [videoErrorType, setVideoErrorType] = useState<'none' | 'generic' | 'deployed_config'>('none');
    const [videoErrorMessage, setVideoErrorMessage] = useState('');

    useEffect(() => {
        return () => { if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current); };
    }, []);

    useEffect(() => {
        if (!process.env.API_KEY) {
            setVideoGenerationStatus('error');
            setVideoErrorType('deployed_config');
        }
    }, []);

    useEffect(() => {
        const reassuringMessages = ["Analyzing the story...", "Gathering visual elements...", "Composing initial scenes...", "Rendering frames...", "Applying visual effects...", "This is taking a bit longer than usual, but we're getting there...", "Finalizing the video...", "Almost ready!"];
        let messageIndex = 0;
    
        const poll = async () => {
            if (!operationRef.current) return;
            
            try {
                const updatedOp = await getVideoGenerationStatus(operationRef.current);
                operationRef.current = updatedOp;
    
                if (updatedOp.done) {
                    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
                    setVideoGenerationStatus('done');
                    const downloadLink = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
                    if (downloadLink) {
                        const videoUrl = await downloadVideo(downloadLink);
                        setGeneratedVideoUrl(videoUrl);
                    } else {
                         throw new Error("Video generation finished but no download link was provided.");
                    }
                } else {
                    messageIndex = (messageIndex + 1) % reassuringMessages.length;
                    setPollingMessage(reassuringMessages[messageIndex]);
                    pollTimeoutRef.current = window.setTimeout(poll, 10000);
                }
            } catch (error: any) {
                if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
                setVideoGenerationStatus('error');
                if (error.message === "API_KEY_ERROR") {
                    setVideoErrorType('deployed_config');
                } else {
                    setVideoErrorType('generic');
                    setVideoErrorMessage(error.message || "An error occurred while checking video status.");
                }
            }
        };
    
        if (videoGenerationStatus === 'polling') {
            poll();
        }
    
        return () => {
            if (pollTimeoutRef.current) {
                clearTimeout(pollTimeoutRef.current);
            }
        };
    }, [videoGenerationStatus]);

    const handleGenerateVideo = async () => {
        if (!story) return;

        setVideoErrorType('none');
        setGeneratedVideoUrl(null);
        setPollingMessage('');

        try {
            setVideoGenerationStatus('generating');
            const operation = await generateVideoFromStory(story, language);
            operationRef.current = operation;
            setVideoGenerationStatus('polling');
        } catch (e: any) {
            setVideoGenerationStatus('error');
            if (e.message === "API_KEY_ERROR") {
                setVideoErrorType('deployed_config');
            } else {
                setVideoErrorType('generic');
                setVideoErrorMessage(e.message || "Could not start video generation.");
            }
        }
    };

    const triggerGeneration = async () => {
        if (!process.env.API_KEY) {
            setVideoGenerationStatus('error');
            setVideoErrorType('deployed_config');
            return;
        }
        handleGenerateVideo();
    };

    const isGenerating = videoGenerationStatus === 'generating' || videoGenerationStatus === 'polling';
    
    return (
        <>
        <CardContent className="space-y-4">
            <p>{t('marketplace.video.description')}</p>
            <textarea 
                value={story} 
                onChange={e => setStory(e.target.value)} 
                placeholder={t('marketplace.video.placeholder')} 
                className="w-full p-2 border rounded h-24 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400" 
                disabled={isGenerating}
            />
            <Button onClick={triggerGeneration} isLoading={isGenerating} disabled={!story}>
                {t('marketplace.video.button')}
            </Button>
            
            <div className="mt-4 min-h-[10rem] flex items-center justify-center">
                {isGenerating && (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        <svg className="animate-spin h-8 w-8 text-teal-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="font-semibold text-slate-600 dark:text-slate-300">{t('marketplace.video.generating')}</p>
                        <p className="text-sm text-slate-500 mt-1">{pollingMessage || 'Please wait...'}</p>
                    </div>
                )}
                {videoGenerationStatus === 'done' && generatedVideoUrl && (
                    <div className="w-full">
                        <video controls src={generatedVideoUrl} className="w-full rounded-lg shadow-md" />
                    </div>
                )}
                {videoGenerationStatus === 'error' && (
                    <div className="p-4 w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-left">
                        {videoErrorType === 'deployed_config' ? (
                            <>
                                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Video Generation Unavailable</h4>
                                <p className="text-slate-600 dark:text-slate-300 mb-4">
                                    This feature requires server configuration by a site administrator. If you are the administrator, please verify the following:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                    <li>A valid API key is set in the <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">API_KEY</code> environment variable.</li>
                                    <li>The Google Cloud project for the key has <strong className="text-slate-700 dark:text-slate-200">Billing enabled</strong>.</li>
                                    <li>The <strong className="text-slate-700 dark:text-slate-200">Vertex AI API</strong> is enabled in the project.</li>
                                </ul>
                            </>
                        ) : (
                            <>
                                <p className="font-bold">Generation Failed</p>
                                <p className="text-sm mt-1">{videoErrorMessage}</p>
                            </>
                        )}
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                            <Button variant="secondary" onClick={triggerGeneration}>Try Again</Button>
                        </div>
                    </div>
                )}
            </div>
        </CardContent>
        </>
    );
};
// #endregion

// #region Main Page Component
const MarketplacePage: React.FC = () => {
    const { t, language } = useLocalization();
    const [activeView, setActiveView] = useState<'main' | 'wizard' | 'voice' | 'review'>('main');
    const [productDataForReview, setProductDataForReview] = useState<Partial<Product> & { transcription?: string }>({});
    const [pricingResult, setPricingResult] = useState<{ minPrice?: number; maxPrice?: number; reasoning?: string; sources?: any[] } | null>(null);
    const [activeTab, setActiveTab] = useState<'description' | 'pricing' | 'video'>('description');
    
    // State for individual tools
    const [descPrompt, setDescPrompt] = useState('');
    const [pricingPrompt, setPricingPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedDescription, setGeneratedDescription] = useState('');
    const [copied, setCopied] = useState(false);
    
    // State for voice input
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const hasSpeechSupport = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    const handleListen = useCallback(() => {
        if (!hasSpeechSupport) {
            alert(t('marketplace.noSpeechSupport'));
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setDescPrompt(prev => (prev ? prev.trim() + ' ' : '') + transcript);
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e: any) => {
            console.error("Speech recognition error:", e.error);
            setIsListening(false);
        };
        
        recognition.start();
        setIsListening(true);
        recognitionRef.current = recognition;
    }, [isListening, hasSpeechSupport, language, t]);

    const goToReview = (newData: Partial<Product> & { transcription?: string }, priceSuggest?: any) => {
        setProductDataForReview(prev => ({ ...prev, ...newData }));
        if(priceSuggest) setPricingResult(priceSuggest);
        setActiveView('review');
    };
    
    const handleGenerateDescription = async () => {
        if (!descPrompt) return;
        setIsGenerating(true);
        setGeneratedDescription('');
        try {
            const result = await generateDescription(descPrompt, language);
            setGeneratedDescription(result);
        } catch (e: any) { alert(e.message); } 
        finally { setIsGenerating(false); }
    };

    const handleGetPrice = async () => {
        if (!pricingPrompt) return;
        setIsGenerating(true);
        setPricingResult(null);
        try {
            const result = await generatePricingSuggestion(pricingPrompt, language);
            const text = result.text;
            let parsed = null;
            try {
                // Extract JSON from markdown code block
                const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch && jsonMatch[1]) {
                    parsed = JSON.parse(jsonMatch[1]);
                } else {
                    // Fallback to parsing the whole text if no markdown block
                    parsed = JSON.parse(text);
                }
            } catch (e) {
                console.error("Could not parse pricing suggestion JSON:", e);
                // Set the reasoning to the raw text if parsing fails
                parsed = { reasoning: text };
            }
            
            const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            
            setPricingResult({ ...parsed, sources });

        } catch (e: any) { alert(e.message); }
        finally { setIsGenerating(false); }
    };
    
    const renderMainContent = () => {
        switch (activeTab) {
            case 'description':
                return (
                    <CardContent className="space-y-4">
                        <p>{t('marketplace.descriptionTab.description')}</p>
                        <div className="relative">
                            <textarea value={descPrompt} onChange={e => setDescPrompt(e.target.value)} placeholder={t('marketplace.descriptionTab.placeholder')} className="w-full p-2 pr-12 border rounded h-24 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400" />
                            {hasSpeechSupport && (
                                <button
                                    type="button"
                                    onClick={handleListen}
                                    className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7v2h6v-2h-2v-2.07z" clipRule="evenodd" /></svg>
                                </button>
                            )}
                        </div>
                        <Button onClick={handleGenerateDescription} isLoading={isGenerating} disabled={!descPrompt}>{t('marketplace.descriptionTab.button')}</Button>
                        {generatedDescription && (
                            <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg space-y-4 animate-fadeInUp">
                                <div>
                                    <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Generated Description</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{generatedDescription}</p>
                                </div>
                                <Button 
                                    variant="secondary" 
                                    className="!py-2 !px-4 text-sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedDescription);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                >
                                    {copied ? 'Copied!' : 'Copy Description'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                );
            case 'pricing':
                return (
                    <CardContent className="space-y-4">
                        <p>{t('marketplace.pricing.description')}</p>
                        <textarea value={pricingPrompt} onChange={e => setPricingPrompt(e.target.value)} placeholder={t('marketplace.pricing.placeholder')} className="w-full p-2 border rounded h-24 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400" />
                        <Button onClick={handleGetPrice} isLoading={isGenerating} disabled={!pricingPrompt}>{t('marketplace.pricing.button')}</Button>
                        {pricingResult && (
                            <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg space-y-4 animate-fadeInUp">
                                {(pricingResult.minPrice && pricingResult.maxPrice) && (
                                     <div>
                                        <p className="font-semibold text-slate-700 dark:text-slate-200">{t('marketplace.pricing.suggestedPrice')}:</p>
                                        <p className="text-2xl font-bold text-teal-600">₹{pricingResult.minPrice} - ₹{pricingResult.maxPrice}</p>
                                    </div>
                                )}
                                {pricingResult.reasoning && <p className="text-sm text-slate-600 dark:text-slate-300">{pricingResult.reasoning}</p>}
                                {pricingResult.sources && pricingResult.sources.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500">{t('marketplace.pricing.sources')}</p>
                                        <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                                            {pricingResult.sources.map((source, index) => (
                                                <li key={index} className="truncate">
                                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" title={source.web.uri}>
                                                        {source.web.title || source.web.uri}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                );
            case 'video':
                return <VideoAdCreator />;
            default: return null;
        }
    };
    
    if (activeView === 'wizard') return <AIProductWizard onGenerated={(data) => goToReview(data, data.pricingSuggestion)} onBack={() => setActiveView('main')} />;
    if (activeView === 'voice') return <AIRecordingAnalysis onGenerated={(data) => goToReview(data, data.pricingSuggestion)} onBack={() => setActiveView('main')} />;
    if (activeView === 'review') return <ReviewAndPublish initialData={productDataForReview} pricingSuggestion={pricingResult} onBack={() => { setActiveView('main'); setProductDataForReview({}); setPricingResult(null); }} />;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">{t('sidebar.marketplace')}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('marketplace.main.description')}</p>
            </div>

            {/* Quick Start Wizards */}
            <Card>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    <button onClick={() => setActiveView('wizard')} className="p-6 bg-indigo-50 dark:bg-indigo-900/50 rounded-2xl text-left hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors">
                        <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            {t('marketplace.wizard.button')}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('marketplace.wizard.buttonDescription')}</p>
                    </button>
                    <button onClick={() => setActiveView('voice')} className="p-6 bg-amber-50 dark:bg-amber-900/50 rounded-2xl text-left hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors">
                        <h3 className="font-bold text-lg text-amber-600 dark:text-amber-400 flex items-center gap-3">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            {t('marketplace.voice.button')}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('marketplace.voice.buttonDescription')}</p>
                    </button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Individual Tools */}
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <div className="border-b border-slate-200 dark:border-slate-700">
                             <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                {(['description', 'pricing', 'video'] as const).map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-semibold text-base ${activeTab === tab ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                                        {t(`marketplace.tabs.${tab}`)}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </CardHeader>
                    {renderMainContent()}
                </Card>
                {/* Social Media Toolkit */}
                <SocialMediaToolkit />
            </div>
            
            <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; }`}</style>
        </div>
    );
};

const SocialMediaToolkit: React.FC = () => {
    const { t, language } = useLocalization();
    const [platform, setPlatform] = useState<'instagram' | 'facebook' | 'whatsapp' | null>(null);
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [result, setResult] = useState<{ postContent: string; hashtags: string[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImageUrl(URL.createObjectURL(file));
        }
    };

    const handleGenerate = async () => {
        if (!prompt || !platform) return;
        setIsLoading(true);
        setResult(null);
        try {
            const fullPrompt = imageFile ? `For a social media post featuring the uploaded image, ${prompt}` : prompt;
            const response = await generateSocialMediaPost(platform, fullPrompt, language);
            setResult(JSON.parse(response));
        } catch (e: any) { /* Error handling */ } finally { setIsLoading(false); }
    };

    const handleShare = async () => {
        if (!result) {
            alert("Please generate content to share.");
            return;
        }
        
        const shareText = `${result.postContent}\n\n${result.hashtags.map(h => `#${h}`).join(' ')}`;
        
        try {
            // Web Share API with files is still experimental, so we check for it.
            if (imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
                await navigator.share({
                    text: shareText,
                    files: [imageFile],
                    title: 'My Artisan Craft',
                });
            } else if (navigator.share) { // Fallback to sharing text only
                 await navigator.share({ text: shareText, title: 'My Artisan Craft' });
            } else { // Fallback for browsers that don't support Web Share API at all
                navigator.clipboard.writeText(shareText);
                alert("Post text copied to clipboard! Your browser doesn't support direct sharing.");
            }
        } catch (err) {
            console.error('Share failed:', err);
             // If sharing fails (e.g., user cancels), copy text as a fallback
            navigator.clipboard.writeText(shareText);
            alert("Sharing was cancelled or failed. Post text has been copied to your clipboard.");
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>{t('marketplace.social.toolkitTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-grow flex flex-col">
                 <div><label className="font-semibold block mb-2">1. Upload a Photo</label>
                    <div className="relative w-full h-48 border-2 border-dashed rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                        {imageUrl ? <img src={imageUrl} alt="preview" className="h-full w-full object-contain p-2"/> : <p className="text-slate-500 dark:text-slate-400">{t('photoStudio.controls.clickToUpload')}</p>}
                        <input type="file" className="absolute w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*"/>
                    </div>
                 </div>
                 <div><label className="font-semibold block mb-2">2. Choose Platform & Describe Post</label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        {(['instagram', 'facebook', 'whatsapp'] as const).map(p => (
                            <button key={p} onClick={() => setPlatform(p)} className={`p-2 rounded-lg border-2 flex justify-center ${platform === p ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/50' : 'border-slate-300 dark:border-slate-600'}`}><SocialPlatformIcon platform={p} /></button>
                        ))}
                    </div>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t('marketplace.social.placeholder')} className="w-full p-2 border rounded h-24 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"/>
                </div>
                <Button onClick={handleGenerate} isLoading={isLoading} disabled={!prompt || !platform} className="w-full">Generate Post</Button>
                {result && (
                     <div className="mt-4 p-4 bg-slate-50 rounded-xl border flex-grow flex flex-col dark:bg-slate-800/50 dark:border-slate-700">
                        <p className="whitespace-pre-wrap flex-grow">{result.postContent}</p>
                        <p className="mt-4 text-teal-600 font-medium">{result.hashtags.map(h => `#${h}`).join(' ')}</p>
                        <Button onClick={handleShare} className="w-full mt-4">{t('common.share')}</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


export default MarketplacePage;