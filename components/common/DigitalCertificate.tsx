import React, { useRef, useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import Button from './Button';
import type { Certificate } from '../../types';

interface Props {
    data: Certificate;
    onClose: () => void;
}

const DigitalCertificate: React.FC<Props> = ({ data, onClose }) => {
    const { t } = useLocalization();
    const certificateRef = useRef<HTMLDivElement>(null);
    const [isQrEnlarged, setIsQrEnlarged] = useState(false);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: t('nft.certificate.subtitle'),
                    text: `Check out the certificate for ${data.artworkName} by ${data.artistName}`,
                    url: window.location.href, // This could be a link to a verification page
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            alert('Web Share API is not supported in your browser.');
        }
    };

    const handleDownload = () => {
        // A more robust solution would use html2canvas, but for simplicity we use print.
        // This allows users to "Save as PDF".
        window.print();
    };

    const verificationUrl = `https://artisans.example.com/verify/${data.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(verificationUrl)}&bgcolor=334155&color=f59e0b&qzone=1`;
    const largeQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(verificationUrl)}&bgcolor=fffbeb&color=78350f&qzone=1`;
    
    // Ensure certifiedDate is a Date object
    const certifiedDate = data.certifiedDate?.toDate ? data.certifiedDate.toDate() : new Date(data.certifiedDate);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <style>
                {`
                @media print {
                  body * { visibility: hidden; }
                  .certificate-print-area, .certificate-print-area * { visibility: visible; }
                  .certificate-print-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #1e293b !important; }
                  .no-print { display: none !important; }
                }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                `}
            </style>
            <div className="w-full max-w-lg">
                <div ref={certificateRef} className="certificate-print-area">
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 rounded-2xl shadow-2xl p-8 w-full font-sans border border-amber-500/20">
                        <div className="text-center pb-4 border-b border-amber-500/20">
                            <h2 className="text-2xl font-bold tracking-widest text-white uppercase">{t('nft.certificate.title')}</h2>
                            <p className="text-amber-400 font-semibold">{t('nft.certificate.subtitle')}</p>
                            <p className="text-sm text-slate-400 mt-1 font-mono">#{data.id}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-6">
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t('nft.certificate.artwork')}</p>
                                <p className="text-white font-bold text-lg">{data.artworkName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t('nft.certificate.artist')}</p>
                                <p className="text-white font-bold text-lg">{data.artistName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t('nft.certificate.craft')}</p>
                                <p className="text-white font-bold text-lg">{data.craftTradition}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t('nft.certificate.date')}</p>
                                <p className="text-white font-bold text-lg">{certifiedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t('nft.certificate.story')}</p>
                            <p className="text-white mt-2 text-sm leading-relaxed">{data.heritageStory}</p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-amber-500/20">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t('nft.certificate.verification')}</p>
                            <div className="flex items-center gap-4 mt-2">
                                <button onClick={() => setIsQrEnlarged(true)} className="rounded-md p-1 hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-400">
                                    <img src={qrCodeUrl} alt="Verification QR Code" className="w-[80px] h-[80px]" />
                                </button>
                                <div>
                                    <p className="font-bold text-white">{t('nft.certificate.qr')}</p>
                                    <p className="text-sm text-slate-400">{t('nft.certificate.qrDesc')}</p>
                                </div>
                                <svg className="w-8 h-8 text-green-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4 no-print">
                    <Button onClick={handleDownload} variant="primary" className="bg-amber-500 hover:shadow-amber-500/40 focus:ring-amber-400 from-amber-500 to-amber-600">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        {t('common.download')}
                    </Button>
                    <Button onClick={handleShare} variant="primary" className="bg-blue-500 hover:shadow-blue-500/40 focus:ring-blue-400 from-blue-500 to-blue-600">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                        {t('common.share')}
                    </Button>
                    <Button onClick={onClose} variant="secondary">
                         <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        {t('common.close')}
                    </Button>
                </div>
            </div>

            {isQrEnlarged && (
                <div 
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in"
                    onClick={() => setIsQrEnlarged(false)}
                >
                    <div className="relative p-4 bg-slate-100 rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                        <img src={largeQrCodeUrl} alt="Enlarged Verification QR Code" className="w-64 h-64" />
                        <button 
                            onClick={() => setIsQrEnlarged(false)} 
                            className="absolute -top-4 -right-4 bg-white text-slate-800 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-slate-200 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Close enlarged QR code"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DigitalCertificate;