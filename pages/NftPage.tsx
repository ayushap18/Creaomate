import React, { useState, useCallback, useRef, useContext } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import DigitalCertificate from '../components/common/DigitalCertificate';
import { generateText } from '../services/geminiService';
import { useLocalization } from '../hooks/useLocalization';
import { AppContext } from '../contexts/AppContext';
import type { Certificate } from '../types';

const NftPage: React.FC = () => {
  // FIX: Destructured properties from AppContext instead of useLocalization.
  const { t, language } = useLocalization();
  const { currentUser, addCertificate, certificates, products } = useContext(AppContext)!;
  const [image, setImage] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [craftTradition, setCraftTradition] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [certificateData, setCertificateData] = useState<Certificate | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [listeningFor, setListeningFor] = useState<'name' | 'desc' | 'tradition' | null>(null);
  const recognitionRef = useRef<any>(null);
  const hasSpeechSupport = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const handleListen = useCallback((target: 'name' | 'desc' | 'tradition') => {
      if (!hasSpeechSupport) {
          alert(t('marketplace.noSpeechSupport'));
          return;
      }
      if (listeningFor === target) {
          recognitionRef.current?.stop();
          setListeningFor(null);
          return;
      }
      
      if (listeningFor && listeningFor !== target) {
          recognitionRef.current?.stop();
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (target === 'name') setItemName(prev => (prev ? prev.trim() + ' ' : '') + transcript);
          if (target === 'desc') setItemDesc(prev => (prev ? prev.trim() + ' ' : '') + transcript);
          if (target === 'tradition') setCraftTradition(prev => (prev ? prev.trim() + ' ' : '') + transcript);
      };
      recognition.onend = () => setListeningFor(null);
      recognition.onerror = (e: any) => {
          console.error("Speech recognition error:", e.error);
          setListeningFor(null);
      };
      
      recognition.start();
      setListeningFor(target);
      recognitionRef.current = recognition;
  }, [listeningFor, hasSpeechSupport, language, t]);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleMint = useCallback(async () => {
    if (!image || !itemName || !itemDesc || !craftTradition || !currentUser) return;
    setIsMinting(true);
    setCertificateData(null);
    setError(null);
    
    const prompts = {
        en: `Generate a compelling 'Heritage Story' for a certificate of authenticity, around 50-70 words. The story should sound official and connect the artisan, their craft, and the specific item.
        - Artisan: ${currentUser.name}
        - Item Name: ${itemName}
        - Item Description: ${itemDesc}
        - Craft Tradition: ${craftTradition}
        Focus on skill, tradition, and the beauty of handcrafted art.`,
        hi: `प्रामाणिकता के प्रमाण पत्र के लिए एक आकर्षक 'विरासत की कहानी' उत्पन्न करें, लगभग 50-70 शब्द। कहानी आधिकारिक लगनी चाहिए और कारीगर, उनकी कला और विशिष्ट वस्तु को जोड़ना चाहिए।
        - कारीगर: ${currentUser.name}
        - वस्तु का नाम: ${itemName}
        - वस्तु का विवरण: ${itemDesc}
        - शिल्प परंपरा: ${craftTradition}
        कौशल, परंपरा और दस्तकारी कला की सुंदरता पर ध्यान दें।`
    };
    const prompt = prompts[language];
    
    try {
        const heritageStory = await generateText(prompt);

        const newCertificate: Certificate = {
          id: `KH-${Math.floor(Math.random() * 900000) + 100000}`,
          artworkName: itemName,
          artistName: currentUser.name,
          craftTradition: craftTradition,
          certifiedDate: new Date(),
          heritageStory: heritageStory,
          image: image,
        };

        await addCertificate(newCertificate);
        
        // Simulate minting time after API call
        setTimeout(() => {
          setCertificateData(newCertificate);
          setIsMinting(false);
          // Reset form
          setImage(null);
          setItemName('');
          setItemDesc('');
          setCraftTradition('');
        }, 500);

    } catch (e: any) {
        if (e.message === 'QUOTA_EXCEEDED') {
            setError(t('common.error.quota'));
        } else {
            setError(e.message || 'An error occurred while generating the certificate.');
        }
        setIsMinting(false);
    }

  }, [image, itemName, itemDesc, craftTradition, language, t, currentUser, addCertificate]);

  const MyCertificates: React.FC = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <p className="text-slate-500 text-center py-4">You haven't created any certificates yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map(cert => {
                const assignedProduct = cert.assignedToProductId ? products.find(p => p.id === cert.assignedToProductId) : null;
                return (
                  <div key={cert.id} className="border rounded-lg p-3 group relative">
                    <img src={cert.image} alt={cert.artworkName} className="w-full h-32 object-cover rounded-md mb-3" />
                    <p className="font-semibold truncate">{cert.artworkName}</p>
                    <p className="text-xs text-slate-500">#{cert.id}</p>
                    {assignedProduct ? (
                      <div className="text-xs mt-2 p-1.5 bg-green-100 text-green-800 rounded text-center">Linked to: {assignedProduct.name}</div>
                    ) : (
                      <div className="text-xs mt-2 p-1.5 bg-amber-100 text-amber-800 rounded text-center">Available</div>
                    )}
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" onClick={() => setCertificateData(cert)}>View</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }


  return (
    <>
      <div className="space-y-8">
        <div>
          <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">{t('nft.main.title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('nft.main.description')}</p>
        </div>
        
        <Card>
            <CardHeader>
              <CardTitle>{t('nft.mint.title')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-2">{t('nft.mint.upload')}</label>
                    <div className="relative w-full h-56 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors dark:bg-slate-800/50 dark:border-slate-600 dark:hover:bg-slate-700/50">
                      {image ? (
                        <img src={image} alt="upload preview" className="h-full w-full object-contain p-2 rounded-lg" />
                      ) : (
                        <div className="text-center text-slate-500 dark:text-slate-400">
                          <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                          <p className="mt-2">{t('nft.mint.clickToUpload')}</p>
                        </div>
                      )}
                      <input type="file" className="absolute w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*"/>
                    </div>
                  </div>
                   <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-2">{t('nft.mint.itemName')}</label>
                    <div className="relative flex items-center">
                      <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder={t('nft.mint.itemNamePlaceholder')} className="w-full p-3 border border-slate-300 rounded-xl pr-12 transition-shadow focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-700 dark:border-slate-600"/>
                      {hasSpeechSupport && <button type="button" onClick={() => handleListen('name')} className={`absolute right-2 p-2 rounded-full transition-colors ${listeningFor === 'name' ? 'text-red-500 animate-pulse' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600 dark:text-slate-400'}`} aria-label={t('nft.mint.recordName')}><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7v2h6v-2h-2v-2.07z" clipRule="evenodd" /></svg></button>}
                    </div>
                  </div>
              </div>
              <div className="space-y-6">
                   <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-2">{t('nft.mint.craftTradition')}</label>
                    <div className="relative flex items-center">
                      <input type="text" value={craftTradition} onChange={(e) => setCraftTradition(e.target.value)} placeholder={t('nft.mint.craftTraditionPlaceholder')} className="w-full p-3 border border-slate-300 rounded-xl pr-12 transition-shadow focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-700 dark:border-slate-600"/>
                      {hasSpeechSupport && <button type="button" onClick={() => handleListen('tradition')} className={`absolute right-2 p-2 rounded-full transition-colors ${listeningFor === 'tradition' ? 'text-red-500 animate-pulse' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600 dark:text-slate-400'}`} aria-label={t('nft.mint.recordName')}><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7v2h6v-2h-2v-2.07z" clipRule="evenodd" /></svg></button>}
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-2">{t('nft.mint.itemDescription')}</label>
                    <div className="relative">
                          <textarea value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} placeholder={t('nft.mint.itemDescriptionPlaceholder')} className="w-full p-3 border border-slate-300 rounded-xl h-28 pr-12 transition-shadow focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-700 dark:border-slate-600"/>
                          {hasSpeechSupport && <button type="button" onClick={() => handleListen('desc')} className={`absolute top-3 right-2 p-2 rounded-full transition-colors ${listeningFor === 'desc' ? 'text-red-500 animate-pulse' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600 dark:text-slate-400'}`} aria-label={t('nft.mint.recordDescription')}><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7v2h6v-2h-2v-2.07z" clipRule="evenodd" /></svg></button>}
                    </div>
                  </div>
                  <Button onClick={handleMint} isLoading={isMinting} disabled={!image || !itemName || !itemDesc || !craftTradition}>
                    {isMinting ? t('nft.mint.minting') : t('nft.mint.mintButton')}
                  </Button>
                   {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
              </div>
            </CardContent>
          </Card>
        
        <MyCertificates />
      </div>
      {certificateData && (
        <DigitalCertificate 
          data={certificateData} 
          onClose={() => setCertificateData(null)} 
        />
      )}
    </>
  );
};

export default NftPage;