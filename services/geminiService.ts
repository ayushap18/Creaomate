import { GoogleGenAI, Type, GenerateContentResponse, Modality, Part, Operation, GenerateVideosResponse } from "@google/genai";

// Resolve Gemini API key from multiple env sources to avoid config issues
const getGeminiApiKey = (): string => {
    const key = (process.env.API_KEY
        || (import.meta as any)?.env?.VITE_GEMINI_API_KEY
        || (import.meta as any)?.env?.GEMINI_API_KEY
    );
    if (!key || String(key).trim().length === 0) {
        throw new Error("API key not found. Please set API_KEY in .env or VITE_GEMINI_API_KEY.");
    }
    return String(key).trim();
};

export const generateText = async (prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error: any) {
        console.error("Error generating text:", error);
        const errorMessage = String(error.message || error);
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
            throw new Error("QUOTA_EXCEEDED");
        }
        if (errorMessage.includes('API key not valid') || errorMessage.includes('not found')) {
             throw new Error("API key not valid. Please pass a valid API key.");
        }
        return "Sorry, I couldn't generate a response right now. Please check the console for errors.";
    }
};

export const generateDescription = async (prompt: string, lang: 'en' | 'hi' | 'bn' | 'ta' | 'mr'): Promise<string> => {
    const prompts = {
        en: `Based on the following user input, write a compelling and descriptive product description for a handcrafted item. User input: "${prompt}"`,
        hi: `निम्नलिखित उपयोगकर्ता इनपुट के आधार पर, एक दस्तकारी वस्तु के लिए एक आकर्षक और वर्णनात्मक उत्पाद विवरण लिखें। उपयोगकर्ता इनपुट: "${prompt}"`,
        bn: `নিম্নলিখিত ব্যবহারকারীর ইনপুটের উপর ভিত্তি করে, একটি হস্তনির্মিত আইটেমের জন্য একটি আকর্ষণীয় এবং বর্ণনামূলক পণ্য বিবরণ লিখুন। ব্যবহারকারীর ইনपुट: "${prompt}"`,
        ta: `பின்வரும் பயனர் உள்ளீட்டின் அடிப்படையில், கையால் செய்யப்பட்ட ஒரு பொருளுக்கு ஒரு அழுத்தமான மற்றும் விளக்கமான தயாரிப்பு விவரத்தை எழுதவும். பயனர் உள்ளீடு: "${prompt}"`,
        mr: `खालील वापरकर्त्याच्या इनपुटवर आधारित, हस्तनिर्मित वस्तूसाठी एक आकर्षक आणि वर्णनात्मक उत्पादन वर्णन लिहा। वापरकर्ता इनपुट: "${prompt}"`,
    };
    return generateText(prompts[lang]);
};

export const generateProductDetailsFromInput = async (
    lang: 'en' | 'hi' | 'bn' | 'ta' | 'mr',
    base64ImageData?: string,
    mimeType?: string,
    textInput?: string
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
     const prompts = {
        en: `You are an intelligent assistant for an artisan. Analyze the provided image and/or text description of a handcrafted product.
        Based SOLELY on the provided inputs, generate the following content:
           - A short, catchy product name.
           - A relevant product category (e.g., Pottery, Textiles, Jewelry, Home Decor).
           - A compelling product description.
           - A suggested price range in INR (as integers minPrice and maxPrice) with a brief reasoning.
           - An engaging Instagram post (postContent) with an array of 5-7 relevant hashtags (hashtags).
        Return ONLY a JSON object with the specified structure. Do not add any commentary before or after the JSON.`,
        hi: `आप एक कारीगर के लिए एक बुद्धिमान सहायक हैं। प्रदान की गई हस्तनिर्मित उत्पाद की छवि और/या पाठ विवरण का विश्लेषण करें।
        केवल प्रदान किए गए इनपुट के आधार पर, निम्नलिखित सामग्री उत्पन्न करें:
           - एक छोटा, आकर्षक उत्पाद नाम।
           - एक प्रासंगिक उत्पाद श्रेणी (जैसे, मिट्टी के बर्तन, वस्त्र, आभूषण, घर की सजावट)।
           - एक आकर्षक उत्पाद विवरण।
           - संक्षिप्त तर्क के साथ INR में एक सुझाई गई मूल्य सीमा (पूर्णांक minPrice और maxPrice के रूप में)।
           - 5-7 प्रासंगिक हैशटैग (hashtags) की एक सरणी के साथ एक आकर्षक इंस्टाग्राम पोस्ट (postContent)।
        केवल निर्दिष्ट संरचना के साथ एक JSON ऑब्जेक्ट लौटाएं। JSON से पहले या बाद में कोई टिप्पणी न जोड़ें।`,
        bn: `আপনি একজন কারিগরের জন্য একজন বুদ্ধিমান সহকারী। প্রদত্ত হস্তনির্মিত পণ্যের চিত্র এবং/অথবা পাঠ্য বিবরণ বিশ্লেষণ করুন। শুধুমাত্র প্রদত্ত ইনপুটগুলির উপর ভিত্তি করে, নিম্নলিখিত বিষয়বস্তু তৈরি করুন: - একটি ছোট, আকর্ষণীয় পণ্যের নাম। - একটি প্রাসঙ্গিক পণ্যের বিভাগ (যেমন, মৃৎশিল্প,বস্ত্র, গহনা, বাড়ির সাজসজ্জা)। - একটি আকর্ষণীয় পণ্য বিবরণ। - একটি সংক্ষিপ্ত যুক্তিসহ INR-এ একটি প্রস্তাবিত মূল্য পরিসীমা (পূর্ণসংখ্যা minPrice এবং maxPrice হিসাবে)। - 5-7টি প্রাসঙ্গিক হ্যাশট্যাগ (hashtags) সহ একটি আকর্ষক ইনস্টাগ্রাম পোস্ট (postContent)। শুধুমাত্র নির্দিষ্ট কাঠামো সহ একটি JSON অবজেক্ট ফেরত দিন। JSON এর আগে বা পরে কোনো মন্তব্য যোগ করবেন না।`,
        ta: `நீங்கள் ஒரு கைவினைஞருக்கான புத்திசாலி உதவியாளர். வழங்கப்பட்ட கையால் செய்யப்பட்ட தயாரிப்பின் படம் மற்றும்/அல்லது உரை விளக்கத்தைப் பகுப்பாய்வு செய்யுங்கள்। வழங்கப்பட்ட உள்ளீடுகளை மட்டுமே அடிப்படையாகக் கொண்டு, பின்வரும் உள்ளடக்கத்தை உருவாக்கவும்: - ஒரு குறுகிய, கவர்ச்சிகரமான தயாரிப்பு பெயர். - ஒரு பொருத்தமான தயாரிப்பு வகை (எ.கா., மட்பாண்டங்கள், ஜவுளி, நகைகள், வீட்டு அலங்காரம்). - ஒரு அழுத்தமான தயாரிப்பு விளக்கம். - ஒரு சுருக்கமான பகுத்தறிவுடன் INR இல் பரிந்துரைக்கப்பட்ட விலை வரம்பு (முழு எண்கள் minPrice மற்றும் maxPrice ஆக). - 5-7 தொடர்புடைய ஹேஷ்டேக்குகளின் (hashtags) வரிசையுடன் ஒரு ஈர்க்கக்கூடிய Instagram இடுகை (postContent). குறிப்பிட்ட கட்டமைப்புடன் ஒரு JSON பொருளை மட்டும் திருப்பித் தரவும். JSON க்கு முன்னரோ பின்னரோ எந்தக் கருத்தையும் சேர்க்க வேண்டாம்.`,
        mr: `तुम्ही एका कारागिरासाठी बुद्धिमान सहाय्यक आहात. प्रदान केलेल्या हस्तकला उत्पादनाच्या प्रतिमेचे आणि/किंवा मजकूर वर्णनाचे विश्लेषण करा. केवळ प्रदान केलेल्या इनपुटवर आधारित, खालील सामग्री तयार करा: - एक लहान, आकर्षक उत्पादनाचे नाव. - एक संबंधित उत्पादन श्रेणी (उदा. मातीची भांडी, कापड, दागिने, गृह सजावट). - एक आकर्षक उत्पादन वर्णन. - संक्षिप्त तर्कासह INR मध्ये सुचवलेली किंमत श्रेणी (पूर्णांक minPrice आणि maxPrice म्हणून). - 5-7 संबंधित हॅशटॅगच्या (hashtags) अॅरेसह एक आकर्षक Instagram পোস্ট (postContent). केवळ निर्दिष्ट संरचनेसह JSON ऑब्जेक्ट परत करा. JSON च्या आधी किंवा नंतर कोणतीही टिप्पणी जोडू नका.`,
    };

    if (!base64ImageData && !textInput) {
        throw new Error("Either an image or a text description is required.");
    }

    const parts: Part[] = [];
    if (base64ImageData && mimeType) {
        parts.push({ inlineData: { data: base64ImageData, mimeType: mimeType } });
    }
     if (textInput) {
        parts.push({ text: `User text description: "${textInput}"` });
    }
    parts.push({ text: prompts[lang] });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        productName: { type: Type.STRING },
                        category: { type: Type.STRING },
                        generatedDescription: { type: Type.STRING },
                        pricingSuggestion: {
                            type: Type.OBJECT,
                            properties: {
                                minPrice: { type: Type.NUMBER },
                                maxPrice: { type: Type.NUMBER },
                                reasoning: { type: Type.STRING }
                            },
                             propertyOrdering: ["minPrice", "maxPrice", "reasoning"]
                        },
                        socialMediaPost: {
                            type: Type.OBJECT,
                            properties: {
                                postContent: { type: Type.STRING },
                                hashtags: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING }
                                }
                            },
                            propertyOrdering: ["postContent", "hashtags"]
                        }
                    },
                    propertyOrdering: ["productName", "category", "generatedDescription", "pricingSuggestion", "socialMediaPost"]
                }
            }
        });
        return response.text;
    } catch (error: any) {
        console.error("Error processing input for details:", error);
        const errorMessage = String(error.message || error);
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
            throw new Error("QUOTA_EXCEEDED");
        }
        if (errorMessage.includes('API key not valid') || errorMessage.includes('not found')) {
             throw new Error("API key not valid. Please pass a valid API key.");
        }
        return JSON.stringify({ error: "Could not process input. Please try again." });
    }
};

export const transcribeAudio = async (
    base64AudioData: string,
    mimeType: string,
    lang: 'en' | 'hi' | 'bn' | 'ta' | 'mr'
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY!.trim() });
    const prompts = {
        en: "Transcribe the following audio recording verbatim.",
        hi: "निम्नलिखित ऑडियो रिकॉर्डिंग को शब्दशः ट्रांसक्राइब करें।",
        bn: "নিম্নলিখিত অডিও রেকর্ডিংটি হুবহু প্রতিলিপি করুন।",
        ta: "பின்வரும் ஆடியோ பதிவை வார்த்தைக்கு வார்த்தை படியெடுக்கவும்.",
        mr: "खालील ऑडिओ रेकॉर्डिंगचे शब्दशः लिप्यंतरण करा.",
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: base64AudioData, mimeType: mimeType } },
                    { text: prompts[lang] },
                ]
            },
        });
        return response.text;
    } catch (error: any) {
        console.error("Error transcribing audio:", error);
        const errorMessage = String(error.message || error);
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
            throw new Error("QUOTA_EXCEEDED");
        }
        if (errorMessage.includes('API key not valid') || errorMessage.includes('not found')) {
             throw new Error("API key not valid. Please pass a valid API key.");
        }
        throw new Error("Sorry, I couldn't transcribe the audio right now.");
    }
};


export const transcribeAndGenerateFromAudio = async (
    base64AudioData: string,
    mimeType: string,
    lang: 'en' | 'hi' | 'bn' | 'ta' | 'mr',
    base64ImageData?: string,
    imageMimeType?: string
): Promise<string> => {
     const ai = new GoogleGenAI({ apiKey: process.env.API_KEY!.trim() });
     const prompts = {
        en: `You are an intelligent assistant for an artisan.
        1. Transcribe the provided audio recording.
        2. Based on the transcription and the provided image, identify the product being described.
        3. Generate the following content for this product:
           - A short, catchy product name.
           - A relevant product category (e.g., Pottery, Textiles, Jewelry, Home Decor).
           - A compelling product description.
           - A suggested price range in INR (as integers minPrice and maxPrice) with a brief reasoning.
           - An engaging Instagram post (postContent) with an array of 5-7 relevant hashtags (hashtags).
        Return ONLY a JSON object with the specified structure.`,
        hi: `आप एक कारीगर के लिए एक बुद्धिमान सहायक हैं।
        1. प्रदान की गई ऑडियो रिकॉर्डिंग को ट्रांसक्राइब करें।
        2. प्रतिलेखन और प्रदान की गई छवि के आधार पर, वर्णित उत्पाद की पहचान करें।
        3. इस उत्पाद के लिए निम्नलिखित सामग्री उत्पन्न करें:
           - एक छोटा, आकर्षक उत्पाद नाम।
           - एक प्रासंगिक उत्पाद श्रेणी (जैसे, मिट्टी के बर्तन, वस्त्र, आभूषण, घर की सजावट)।
           - एक आकर्षक उत्पाद विवरण।
           - संक्षिप्त तर्क के साथ INR में एक सुझाई गई मूल्य सीमा (पूर्णांक minPrice और maxPrice के रूप में)।
           - 5-7 प्रासंगिक हैशटैग (hashtags) की एक सरणी के साथ एक आकर्षक इंस्टाग्राम पोस्ट (postContent)।
        केवल निर्दिष्ट संरचना के साथ एक JSON ऑब्जेक्ट लौटाएं।`,
        bn: `আপনি একজন কারিগরের জন্য একজন বুদ্ধিমান সহকারী।
        ১. প্রদত্ত অডিও রেকর্ডিংটি প্রতিলিপি করুন।
        ২. প্রতিলিপি এবং প্রদত্ত চিত্রের উপর ভিত্তি করে, বর্ণিত পণ্যটি শনাক্ত করুন।
        ৩. এই পণ্যের জন্য নিম্নলিখিত সামগ্রী তৈরি করুন:
           - একটি ছোট, আকর্ষণীয় পণ্যের নাম।
           - একটি প্রাসঙ্গিক পণ্যের বিভাগ (যেমন, মৃৎশিল্প,বস্ত্র, গহনা, বাড়ির সাজসজ্জা)।
           - একটি আকর্ষণীয় পণ্য বিবরণ।
           - একটি সংক্ষিপ্ত যুক্তিসহ INR-এ একটি প্রস্তাবিত মূল্য পরিসীমা (পূর্ণসংখ্যা minPrice এবং maxPrice হিসাবে)।
           - 5-7টি প্রাসঙ্গিক হ্যাশট্যাগ (hashtags) সহ একটি আকর্ষক ইনস্টাগ্রাম পোস্ট (postContent)।
        শুধুমাত্র নির্দিষ্ট কাঠামো সহ একটি JSON অবজেক্ট ফেরত দিন।`,
        ta: `நீங்கள் ஒரு கைவினைஞருக்கான புத்திசாலி உதவியாளர்.
        1. வழங்கப்பட்ட ஆடியோ பதிவைப் படியெடுக்கவும்.
        2. படியெடுத்தல் மற்றும் வழங்கப்பட்ட படத்தின் அடிப்படையில், விவரிக்கப்படும் பொருளை அடையாளம் காணவும்.
        3. இந்த தயாரிப்புக்கு பின்வரும் உள்ளடக்கத்தை உருவாக்கவும்:
           - ஒரு குறுகிய, கவர்ச்சிகரமான தயாரிப்பு பெயர்.
           - ஒரு பொருத்தமான தயாரிப்பு வகை (எ.கா., மட்பாண்டங்கள், ஜவுளி, நகைகள், வீட்டு அலங்காரம்).
           - ஒரு அழுத்தமான தயாரிப்பு விளக்கம்.
           - ஒரு சுருக்கமான பகுத்தறிவுடன் INR இல் பரிந்துரைக்கப்பட்ட விலை வரம்பு (முழு எண்கள் minPrice மற்றும் maxPrice ஆக).
           - 5-7 தொடர்புடைய ஹேஷ்டேக்குகளின் (hashtags) வரிசையுடன் ஒரு ஈர்க்கக்கூடிய Instagram இடுகை (postContent).
        குறிப்பிட்ட கட்டமைப்புடன் ஒரு JSON பொருளை மட்டும் திருப்பித் தரவும்.`,
        mr: `तुम्ही एका कारागिरासाठी बुद्धिमान सहाय्यक आहात.
        १. प्रदान केलेल्या ऑडिओ रेकॉर्डिंगचे लिप्यंतरण करा.
        २. लिप्यंतरण आणि प्रदान केलेल्या प्रतिमेवर आधारित, वर्णन केलेल्या उत्पादनाची ओळख करा.
        ३. या उत्पादनासाठी खालील सामग्री तयार करा:
           - एक लहान, आकर्षक उत्पादनाचे नाव.
           - एक संबंधित उत्पादन श्रेणी (उदा. मातीची भांडी, कापड, दागिने, गृह सजावट).
           - एक आकर्षक उत्पादन वर्णन.
           - संक्षिप्त तर्कासह INR मध्ये सुचवलेली किंमत श्रेणी (पूर्णांक minPrice आणि maxPrice म्हणून).
           - 5-7 संबंधित हॅशटॅगच्या (hashtags) अॅरेसह एक आकर्षक Instagram পোস্ট (postContent).
        केवळ निर्दिष्ट संरचनेसह JSON ऑब्जेक्ट परत करा.`,
    };

    const parts: Part[] = [];
    if (base64ImageData && imageMimeType) {
        parts.push({ inlineData: { data: base64ImageData, mimeType: imageMimeType } });
    }
    parts.push({ inlineData: { data: base64AudioData, mimeType: mimeType } });
    parts.push({ text: prompts[lang] });


    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        transcription: { type: Type.STRING },
                        productName: { type: Type.STRING },
                        category: { type: Type.STRING },
                        generatedDescription: { type: Type.STRING },
                        pricingSuggestion: {
                            type: Type.OBJECT,
                            properties: {
                                minPrice: { type: Type.NUMBER },
                                maxPrice: { type: Type.NUMBER },
                                reasoning: { type: Type.STRING }
                            },
                             propertyOrdering: ["minPrice", "maxPrice", "reasoning"]
                        },
                        socialMediaPost: {
                            type: Type.OBJECT,
                            properties: {
                                postContent: { type: Type.STRING },
                                hashtags: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING }
                                }
                            },
                            propertyOrdering: ["postContent", "hashtags"]
                        }
                    },
                    propertyOrdering: ["transcription", "productName", "category", "generatedDescription", "pricingSuggestion", "socialMediaPost"]
                }
            }
        });
        return response.text;
    } catch (error: any) {
        console.error("Error processing audio:", error);
        const errorMessage = String(error.message || error);
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
            throw new Error("QUOTA_EXCEEDED");
        }
        if (errorMessage.includes('API key not valid') || errorMessage.includes('not found')) {
             throw new Error("API key not valid. Please pass a valid API key.");
        }
        return JSON.stringify({ error: "Could not process audio. Please try again." });
    }
};

export const generatePricingSuggestion = async (productInfo: string, lang: 'en' | 'hi' | 'bn' | 'ta' | 'mr'): Promise<GenerateContentResponse> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY!.trim() });
    const prompts = {
        en: `Based on real-time web search data for similar products, suggest a price range and provide a brief reasoning. Product: ${productInfo}. Return the answer as a JSON object with keys "minPrice", "maxPrice", and "reasoning".`,
        hi: `समान उत्पादों के लिए रीयल-टाइम वेब खोज डेटा के आधार पर, एक मूल्य सीमा सुझाएं और एक संक्षिप्त तर्क प्रदान करें। उत्पाद: ${productInfo}। उत्तर को "minPrice", "maxPrice", और "reasoning" की के साथ JSON ऑब्जेक्ट के रूप में लौटाएं।`,
        bn: `অনুরূপ পণ্যগুলির জন্য রিয়েল-টাইম ওয়েব অনুসন্ধান ডেটার উপর ভিত্তি করে, একটি মূল্যের পরিসর প্রস্তাব করুন এবং একটি সংক্ষিপ্ত যুক্তি প্রদান করুন। পণ্য: ${productInfo}। উত্তরটি "minPrice", "maxPrice", এবং "reasoning" কী সহ একটি JSON অবজেক্ট হিসাবে ফেরত দিন।`,
        ta: `ஒரே மாதிரியான தயாரிப்புகளுக்கான நிகழ்நேர வலைத் தேடல் தரவின் அடிப்படையில், ஒரு விலை வரம்பைப் பரிந்துரைத்து ஒரு சுருக்கமான காரணத்தை வழங்கவும். தயாரிப்பு: ${productInfo}. பதிலை "minPrice", "maxPrice", மற்றும் "reasoning" என்ற விசைகளுடன் ஒரு JSON பொருளாகத் திருப்பித் தரவும்.`,
        mr: `तत्सम उत्पादनांसाठी रिअल-टाइम वेब शोध डेटावर आधारित, किंमत श्रेणी सुचवा आणि संक्षिप्त तर्क द्या. उत्पादन: ${productInfo}. उत्तर "minPrice", "maxPrice", आणि "reasoning" की सह JSON ऑब्जेक्ट म्हणून परत करा.`,
    };
    const prompt = prompts[lang];

     try {
        const response = await ai.models.generateContent({
           model: "gemini-1.5-flash",
           contents: prompt,
           config: {
             tools: [{googleSearch: {}}],
           },
        });
        return response;
    } catch (error: any) {
        console.error("Error generating grounded pricing suggestion:", error);
        const errorMessage = String(error.message || error);
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
            throw new Error("QUOTA_EXCEEDED");
        }
        if (errorMessage.includes('API key not valid') || errorMessage.includes('not found')) {
             throw new Error("API key not valid. Please pass a valid API key.");
        }
        // We can't return a full response object on error easily, so we craft text that can be parsed as a JSON error.
        throw new Error(JSON.stringify({ error: "Could not generate pricing suggestion. Please try again." }));
    }
};

export const generateSocialMediaPost = async (platform: string, prompt: string, lang: 'en' | 'hi' | 'bn' | 'ta' | 'mr'): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY!.trim() });
    const prompts = {
        en: `Create a social media post for ${platform} to promote an artisan's product or collection. The post should be based on this description: "${prompt}". The tone should be engaging and authentic. Also, provide between 5 and 10 relevant and popular hashtags.`,
        hi: `${platform} के लिए एक कारीगर के उत्पाद या संग्रह को बढ़ावा देने के लिए एक सोशल मीडिया पोस्ट बनाएं। पोस्ट इस विवरण पर आधारित होनी चाहिए: "${prompt}"। लहजा आकर्षक और प्रामाणिक होना चाहिए। साथ ही, 5 से 10 प्रासंगिक और लोकप्रिय हैशटैग प्रदान करें।`,
        bn: `একজন কারিগরের পণ্য বা সংগ্রহের প্রচারের জন্য ${platform}-এর জন্য একটি সোশ্যাল মিডিয়া পোস্ট তৈরি করুন। পোস্টটি এই বিবরণের উপর ভিত্তি করে হওয়া উচিত: "${prompt}"। সুরটি আকর্ষক এবং খাঁটি হওয়া উচিত। এছাড়াও, 5 থেকে 10টি প্রাসঙ্গিক এবং জনপ্রিয় হ্যাশট্যাগ সরবরাহ করুন।`,
        ta: `ஒரு கைவினைஞரின் தயாரிப்பு அல்லது சேகரிப்பை விளம்பரப்படுத்த ${platform}-க்கு ஒரு சமூக ஊடக இடுகையை உருவாக்கவும். இடுகை இந்த விளக்கத்தை அடிப்படையாகக் கொண்டிருக்க வேண்டும்: "${prompt}". தொனி ஈர்க்கக்கூடியதாகவும் உண்மையானதாகவும் இருக்க வேண்டும். மேலும், 5 முதல் 10 தொடர்புடைய மற்றும் பிரபலமான ஹேஷ்டேக்குகளை வழங்கவும்.`,
        mr: `एका कारागिराच्या उत्पादनाचा किंवा संग्रहाचा प्रचार करण्यासाठी ${platform} साठी एक सोशल মিডিয়া পোস্ট तयार करा. पोस्ट या वर्णनावर आधारित असावी: "${prompt}". टोन आकर्षक आणि अस्सल असावा. तसेच, ५ ते १० संबंधित आणि लोकप्रिय हॅशटॅग द्या.`,
    }
    const finalPrompt = prompts[lang];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: finalPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        postContent: { type: Type.STRING, description: "The full text content for the social media post." },
                        hashtags: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of 5 to 10 relevant hashtags, without the '#' symbol."
                        }
                    },
                    propertyOrdering: ["postContent", "hashtags"]
                }
            }
        });
        return response.text;
    } catch (error: any) {
        console.error("Error generating social media post:", error);
        const errorMessage = String(error.message || error);
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
            throw new Error("QUOTA_EXCEEDED");
        }
        if (errorMessage.includes('API key not valid') || errorMessage.includes('not found')) {
             throw new Error("API key not valid. Please pass a valid API key.");
        }
        return JSON.stringify({ error: "Could not generate social media post. Please try again." });
    }
}


export const generateCertificateText = async (
    artisanName: string,
    volunteerName: string,
    project: string,
    hours: number,
    skills: string[],
    lang: 'en' | 'hi' | 'bn' | 'ta' | 'mr'
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY!.trim() });
    const prompts = {
        en: `Generate a formal text for a "Certificate of Contribution".
    It should acknowledge the volunteer's work with a local artisan.
    
    Details:
    - Volunteer's Name: ${volunteerName}
    - Artisan's Name: ${artisanName}
    - Project / Task: ${project}
    - Hours Contributed: ${hours}
    - Skills Utilized: ${skills.join(', ')}

    The tone should be professional, appreciative, and highlight the value of the contribution to the artisan's business and cultural preservation.
    Start with a clear heading like "Certificate of Contribution".
    Mention the artisan's name/business (ArtisanX platform) as the issuer.
    Conclude with a line for the date of issue.
    `,
    hi: `एक "योगदान प्रमाण पत्र" के लिए एक औपचारिक पाठ उत्पन्न करें।
    इसे एक स्थानीय कारीगर के साथ स्वयंसेवक के काम को स्वीकार करना चाहिए।
    
    विवरण:
    - स्वयंसेवक का नाम: ${volunteerName}
    - कारीगर का नाम: ${artisanName}
    - परियोजना / कार्य: ${project}
    - योगदान किए गए घंटे: ${hours}
    - उपयोग किए गए कौशल: ${skills.join(', ')}

    स्वर पेशेवर, प्रशंसनीय होना चाहिए, और कारीगर के व्यवसाय और सांस्कृतिक संरक्षण में योगदान के मूल्य को उजागर करना चाहिए।
    "योगदान प्रमाण पत्र" जैसे स्पष्ट शीर्षक से शुरू करें।
    जारीकर्ता के रूप में कारीगर का नाम/व्यवसाय (आर्टिसन एली प्लेटफॉर्म) का उल्लेख करें।
    जारी करने की तारीख के लिए एक पंक्ति के साथ समाप्त करें।
    `,
    bn: `একটি "অবদান শংসাপত্র"-এর জন্য একটি আনুষ্ঠানিক পাঠ্য তৈরি করুন।
    এটি একজন স্থানীয় কারিগরের সাথে স্বেচ্ছাসেবীর কাজকে স্বীকার করা উচিত।
    
    বিস্তারিত:
    - স্বেচ্ছাসেবীর নাম: ${volunteerName}
    - কারিগরের নাম: ${artisanName}
    - প্রকল্প / কার্য: ${project}
    - অবদানকৃত ঘন্টা: ${hours}
    - ব্যবহৃত দক্ষতা: ${skills.join(', ')}

    সুরটি পেশাদার, প্রশংসনীয় হওয়া উচিত এবং কারিগরের ব্যবসা ও সাংস্কৃতিক সংরক্ষণে অবদানের মূল্য তুলে ধরা উচিত।
    "অবদান শংসাপত্র"-এর মতো একটি স্পষ্ট শিরোনাম দিয়ে শুরু করুন।
    ইস্যুকারী হিসাবে কারিগরের নাম/ব্যবসা (আর্টিসান অ্যালাই প্ল্যাটফর্ম) উল্লেখ করুন।
    ইস্যু করার তারিখের জন্য একটি লাইন দিয়ে শেষ করুন।
    `,
    ta: `ஒரு "பங்களிப்புச் சான்றிதழ்"-க்கான முறையான உரையை உருவாக்கவும்।
    இது ஒரு உள்ளூர் கைவினைஞருடன் தன்னார்வலரின் பணியை அங்கீகரிக்க வேண்டும்।
    
    விவரங்கள்:
    - தன்னார்வலரின் பெயர்: ${volunteerName}
    - கைவினைஞரின் பெயர்: ${artisanName}
    - திட்டம் / பணி: ${project}
    - பங்களித்த மணிநேரம்: ${hours}
    - பயன்படுத்தப்பட்ட திறன்கள்: ${skills.join(', ')}

    தொனி தொழில்முறையாகவும், பாராட்டத்தக்கதாகவும், கைவினைஞரின் வணிகத்திற்கும் கலாச்சார பாதுகாப்பிற்கும் பங்களிப்பின் மதிப்பை তুলে ধরவதாகவும் இருக்க வேண்டும்।
    "பங்களிப்புச் சான்றிதழ்" போன்ற ஒரு தெளிவான தலைப்புடன் தொடங்கவும்।
    வழங்குபவராக கைவினைஞரின் பெயர்/வணிகத்தை (கைவினைஞர் கூட்டாளி தளம்) குறிப்பிடவும்।
    வழங்கப்பட்ட தேதிக்கான ஒரு வரியுடன் முடிக்கவும்।
    `,
    mr: `एका "योगदान प्रमाणपत्रासाठी" औपचारिक मजकूर तयार करा.
    त्यात स्थानिक कारागिरासोबत स्वयंसेवकाच्या कामाची दखल घेतली पाहिजे.
    
    तपशील:
    - स्वयंसेवकाचे नाव: ${volunteerName}
    - कारागिराचे नाव: ${artisanName}
    - प्रकल्प / कार्य: ${project}
    - योगदान दिलेले तास: ${hours}
    - वापरलेली कौशल्ये: ${skills.join(', ')}

    टोन व्यावसायिक, कौतुकास्पद असावा आणि कारागिराच्या व्यवसायात आणि सांस्कृतिक संरक्षणात योगदानाच्या मूल्यावर प्रकाश टाकणारा असावा.
    "योगदान प्रमाणपत्र" सारख्या स्पष्ट शीर्षकासह प्रारंभ करा.
    जारी करणारा म्हणून कारागिराचे नाव/व्यवसाय (आर्टिसन अॅली प्लॅटफॉर्म) नमूद करा.
    जारी करण्याच्या तारखेसाठी एका ओळीने समारोप करा।
    `,
    };
    return generateText(prompts[lang]);
};

export const editImageWithAI = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string
): Promise<Part[]> => {
    const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates returned from AI.");
        }
        return response.candidates[0].content.parts;
    } catch (error: any) {
        console.error("Error editing image:", error);
        const errorMessage = String(error.message || error);
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
            throw new Error("QUOTA_EXCEEDED");
        }
        if (errorMessage.includes('API key not valid') || errorMessage.includes('not found')) {
            throw new Error("API key not valid. Please pass a valid API key.");
        }
        throw new Error("Sorry, I couldn't edit the image right now.");
    }
};

export const generateVideoFromStory = async (story: string, lang: 'en' | 'hi' | 'bn' | 'ta' | 'mr'): Promise<Operation<GenerateVideosResponse>> => {
    const apiKey = getGeminiApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const prompts = {
        en: `Generate a short, visually engaging promotional video based on this story: "${story}"`,
        hi: `इस कहानी के आधार पर एक छोटा, दृश्यात्मक रूप से आकर्षक प्रचार वीडियो बनाएं: "${story}"`,
        bn: `এই গল্পের উপর ভিত্তি করে একটি ছোট, দৃশ্যত আকর্ষণীয় প্রচারমূলক ভিডিও তৈরি করুন: "${story}"`,
        ta: `இந்தக் கதையின் அடிப்படையில் ஒரு குறுகிய, பார்வைக்கு ஈர்க்கக்கூடிய விளம்பர வீடியோவை உருவாக்கவும்: "${story}"`,
        mr: `या कथेवर आधारित एक लहान, दृष्यदृष्ट्या आकर्षक जाहिरात व्हिडिओ तयार करा: "${story}"`,
    };
    
    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompts[lang],
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });
        return operation;
    } catch (error: any) {
         console.error("Error starting video generation:", error);
         const errorMessage = String(error.message || error);
        if (errorMessage.includes('API key') || errorMessage.includes('not found') || errorMessage.includes('permission') || errorMessage.includes('Requested entity was not found')) {
             throw new Error("API_KEY_ERROR");
        }
        throw new Error("Could not start video generation process.");
    }
};

export const getVideoGenerationStatus = async (operation: Operation<GenerateVideosResponse>): Promise<Operation<GenerateVideosResponse>> => {
    const apiKey = getGeminiApiKey();
    const ai = new GoogleGenAI({ apiKey });
    try {
        const updatedOperation = await ai.operations.getVideosOperation({ operation: operation });
        return updatedOperation;
    } catch (error: any) {
        console.error("Error polling video status:", error);
        const errorMessage = String(error.message || error);
        if (errorMessage.includes('API key') || errorMessage.includes('not found') || errorMessage.includes('Requested entity was not found')) {
             throw new Error("API_KEY_ERROR");
        }
        throw new Error("Could not get video generation status.");
    }
};

export const downloadVideo = async (downloadLink: string): Promise<string> => {
    const apiKey = getGeminiApiKey();

    // Robustly append the API key, handling cases where the URL may or may not have existing query parameters.
    const separator = downloadLink.includes('?') ? '&' : '?';
    const urlWithKey = `${downloadLink}${separator}key=${apiKey}`;

    try {
        const response = await fetch(urlWithKey);
        if (!response.ok) {
            console.error(`Error response from video download: ${response.status} ${response.statusText}`);
            let errorBody = "Could not read error body.";
            try {
                errorBody = await response.text();
                console.error("Error body from API:", errorBody);
            } catch (e) {
                console.error("Failed to parse error body.");
            }
            
            // Treat 400 as a configuration error to guide the user.
            if (response.status === 400) {
                 throw new Error("API_KEY_ERROR");
            }
            throw new Error(`Failed to download video. Server responded with status: ${response.status}.`);
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error: any) {
        console.error("Error during video download fetch:", error);
        if (error.message.includes("API_KEY_ERROR")) {
            // Re-throw the specific error if we identified it.
            throw error;
        }
        // "Failed to fetch" is a generic browser error. We can give a better hint now.
        throw new Error("Failed to fetch video. This may be due to a network issue, CORS policy, or an invalid API key. Please check the browser's network console for more details, including the logged API error body.");
    }
};