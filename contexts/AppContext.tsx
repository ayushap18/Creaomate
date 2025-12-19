import React, { createContext, useState, useEffect, ReactNode, useRef } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    User as FirebaseUser
} from 'firebase/auth';
// FIX: Add getDocs to firebase/firestore import to resolve "Cannot find name 'getDocs'" error.
import { collection, doc, getDoc, getDocs, onSnapshot, setDoc, addDoc, writeBatch, query, where, serverTimestamp, orderBy, updateDoc, Unsubscribe } from 'firebase/firestore';
import { app, db } from '../firebaseConfig';
import type { User, Page, Project, Volunteer, Artisan, Product, CartItem, Conversation, ChatMessage, Role, ParticipantDetails, BargainRequest, Notification, ConnectionRequest, ProjectApplication, Collaboration, CompletedProject, Certificate } from '../types';
import { useLocalization, type Language, LocalizationProvider } from '../hooks/useLocalization';
import { initialArtisans, initialVolunteers, initialProducts, initialProjects } from '../lib/initialData';
import { generateCertificateText } from '../services/geminiService';

type AuthPage = 'landing' | 'login' | 'signup';

interface AppContextType {
    currentUser: User | null;
    setCurrentUser: (user: User | Artisan | Volunteer | null | ((prev: User | null) => User | Artisan | Volunteer | null)) => void;
    updateUserProfile: (profileData: Partial<Artisan | Volunteer | User>) => Promise<void>;
    activePage: Page;
    setActivePage: (page: Page) => void;
    theme: string;
    toggleTheme: () => void;
    language: Language;
    setLanguage: (language: Language) => void;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    postNewProject: (projectData: { title: string; description: string; skillsNeeded: string[] }) => Promise<void>;
    volunteers: Volunteer[];
    setVolunteers: React.Dispatch<React.SetStateAction<Volunteer[]>>;
    artisans: Artisan[];
    products: Product[];
    // FIX: Updated `addProduct` signature to accept an optional certificateId.
    addProduct: (productData: Omit<Product, 'id' | 'artisanId' | 'dateAdded'>, certificateId?: string) => Promise<void>;
    selectedProduct: Product | null;
    setSelectedProduct: (product: Product | null) => void;
    selectedPortfolioUser: User | null;
    setSelectedPortfolioUser: (user: User | null) => void;
    cart: CartItem[];
    addToCart: (product: Product, offerPrice: number) => void;
    removeFromCart: (productId: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    favorites: string[]; // Array of product IDs
    toggleFavorite: (productId: string) => void;
    isFavorite: (productId: string) => boolean;
    conversations: Conversation[];
    sendMessage: (conversationId: string, messageText: string) => Promise<void>;
    startChatWith: ParticipantDetails | null;
    startChat: (participant: ParticipantDetails) => void;
    createOrSelectConversation: (participant: ParticipantDetails) => Promise<string>;
    
    // Auth
    firebaseUser: FirebaseUser | null;
    authLoading: boolean;
    isAuthenticated: boolean;
    isInitialLogin: boolean;
    setIsInitialLogin: (isInitial: boolean) => void;
    login: (email:string, pass:string) => Promise<any>;
    signup: (name:string, email:string, pass:string) => Promise<any>;
    loginWithGoogle: () => Promise<any>;
    logout: () => void;
    bypassLogin: () => void;
    authPage: AuthPage;
    setAuthPage: (page: AuthPage) => void;
    switchUserRole: (role: Role) => void;

    // Bargaining
    bargainRequests: BargainRequest[];
    createBargainRequest: (product: Product, offerPrice: number) => Promise<void>;
    updateBargainRequestStatus: (requestId: string, status: 'accepted' | 'rejected') => Promise<void>;
    completeBargainRequest: (requestId: string) => Promise<void>;

    // Connection Requests
    connectionRequests: ConnectionRequest[];
    sendConnectionRequest: (receiver: User) => Promise<void>;
    respondToConnectionRequest: (request: ConnectionRequest, response: 'accepted' | 'rejected') => Promise<void>;

    // Project Applications & Collaborations
    projectApplications: ProjectApplication[];
    collaborations: Collaboration[];
    applyForProject: (project: Project) => Promise<void>;
    respondToApplication: (application: ProjectApplication, response: 'accepted' | 'declined') => Promise<void>;
    endCollaboration: (collaboration: Collaboration, feedback: string, rating: number) => Promise<void>;
    issueCertificate: (collaboration: Collaboration) => Promise<void>;
    // FIX: Added missing properties to context for certificate management.
    addCertificate: (certificate: Certificate) => Promise<void>;
    certificates: Certificate[];
    getCertificate: (certificateId: string) => Promise<Certificate | null>;

    // Notifications
    notifications: Notification[];
    removeNotification: (id: string) => void;

    clearStartChat: () => void;
    t: (key: string, replacements?: { [key: string]: string | number }) => string;
    firestoreError: string | null;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// Data Seeding Function
const seedDatabase = async () => {
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        if (usersSnapshot.empty) {
            console.log('Database is empty. Seeding initial data...');
            const batch = writeBatch(db);

            initialArtisans.forEach(artisan => {
                const docRef = doc(db, 'users', artisan.id);
                batch.set(docRef, artisan);
            });

            initialVolunteers.forEach(volunteer => {
                const docRef = doc(db, 'users', volunteer.id);
                batch.set(docRef, volunteer);
            });

            initialProducts.forEach(product => {
                const docRef = doc(db, 'products', product.id.toString());
                batch.set(docRef, product);
            });

            initialProjects.forEach(project => {
                const docRef = doc(db, 'projects', project.id.toString());
                batch.set(docRef, project);
            });

            await batch.commit();
            console.log('Initial data seeded successfully.');
        } else {
            console.log('Database already contains data. Skipping seed.');
        }
    } catch (error) {
        console.error("Error seeding database:", error);
    }
};

const AppProviderContent: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { t, language, setLanguage } = useLocalization();
    const [activePage, setActivePage] = useState<Page>('dashboard');
    const [theme, setTheme] = useState('light');
    
    // Auth state
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [authPage, setAuthPage] = useState<AuthPage>('landing');
    const [isInitialLogin, setIsInitialLogin] = useState(false);
    const auth = getAuth(app);

    // Data state
    const [projects, setProjects] = useState<Project[]>([]);
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const prevVolunteersRef = useRef<Volunteer[]>([]);
    const [artisans, setArtisans] = useState<Artisan[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    // FIX: Added state for certificates
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [firestoreError, setFirestoreError] = useState<string | null>(null);
    
    // UI State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedPortfolioUser, setSelectedPortfolioUser] = useState<User | null>(null);
    
    // Cart & Favorites
    const [cart, setCart] = useState<CartItem[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);

    // Chat
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [startChatWith, setStartChatWith] = useState<ParticipantDetails | null>(null);
    const messageListenersRef = useRef<{ [key: string]: () => void }>({});
    
    // Bargaining, Connections & Notifications
    const [bargainRequests, setBargainRequests] = useState<BargainRequest[]>([]);
    const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
    const [projectApplications, setProjectApplications] = useState<ProjectApplication[]>([]);
    const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const prevBargainRequestsRef = useRef<BargainRequest[]>([]);
    const prevConnectionRequestsRef = useRef<ConnectionRequest[]>([]);

    const firestoreFailedRef = useRef(false);
    const handleFirestoreError = (error: any, collectionName: string) => {
        console.error(`Error fetching ${collectionName}: `, error);
        if (!firestoreFailedRef.current && (error.code === 'permission-denied' || (error.message && error.message.includes('Missing or insufficient permissions')) || (error.message && error.message.includes('requires an index')))) {
            firestoreFailedRef.current = true;
            const errorMessage = "Could not connect to live database. Using sample data. Please check your Firebase configuration and security rules.";
            setFirestoreError(errorMessage);
            console.warn(`Firestore permission denied or index required. Falling back to initial local data. Please check your Firestore security rules to enable real-time features.`);
            setProducts(initialProducts);
            setProjects(initialProjects);
            setArtisans(initialArtisans);
            setVolunteers(initialVolunteers);
        }
    };

    // #region Notification Functions
    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const addNotification = (message: string, type: 'success' | 'info' | 'error', link?: Notification['link']) => {
        const id = Date.now().toString() + Math.random();
        setNotifications(prev => [...prev, { id, message, type, link }]);
        setTimeout(() => {
            removeNotification(id);
        }, 6000);
    };
    // #endregion

    // Seed database on initial load
    useEffect(() => {
        seedDatabase();
    }, []);

    useEffect(() => {
        const productsUnsub = onSnapshot(collection(db, 'products'), (snapshot) => {
            if (firestoreFailedRef.current) return;
            const productsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Product);
            setProducts(productsData.length > 0 ? productsData : initialProducts);
        }, (error) => handleFirestoreError(error, 'products'));

        const projectsUnsub = onSnapshot(collection(db, 'projects'), (snapshot) => {
            if (firestoreFailedRef.current) return;
            const projectsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Project);
            setProjects(projectsData.length > 0 ? projectsData : initialProjects);
        }, (error) => handleFirestoreError(error, 'projects'));
        
        const usersUnsub = onSnapshot(collection(db, "users"), (snapshot) => {
            if (firestoreFailedRef.current) return;
            const allUsers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as User);
            
            const artisansData = allUsers.filter(u => u.role === 'artisan') as Artisan[];
            setArtisans(artisansData.length > 0 ? artisansData : initialArtisans);
            
            const volunteersData = allUsers.filter(v => v.role === 'volunteer') as Volunteer[];
            setVolunteers(volunteersData.length > 0 ? volunteersData : initialVolunteers);

            // Check for new certificates for the current user if they are a volunteer
            if (currentUser?.role === 'volunteer') {
                const oldVolunteerProfile = prevVolunteersRef.current.find(v => v.id === currentUser.id);
                const newVolunteerProfile = volunteersData.find(v => v.id === currentUser.id);

                if (newVolunteerProfile && oldVolunteerProfile) {
                    const oldCertCount = oldVolunteerProfile.completedProjects?.length || 0;
                    const newCertCount = newVolunteerProfile.completedProjects?.length || 0;

                    if (newCertCount > oldCertCount) {
                        const newCert = newVolunteerProfile.completedProjects[newVolunteerProfile.completedProjects.length - 1];
                        addNotification(
                            `You've received a certificate for "${newCert.projectName}"!`, 
                            'success',
                            {
                                text: 'View My Certifications',
                                action: () => setActivePage('volunteers')
                            }
                        );
                    }
                }
            }
            prevVolunteersRef.current = volunteersData;

        }, (error) => handleFirestoreError(error, 'users'));

        return () => {
            productsUnsub();
            projectsUnsub();
            usersUnsub();
        };
    }, [currentUser]); // Re-run if currentUser changes to correctly identify volunteer

    // FIX: Added a listener for certificates for the current artisan user.
    useEffect(() => {
        if (firestoreFailedRef.current || !currentUser || currentUser.role !== 'artisan') {
            setCertificates([]);
            return;
        }

        const q = query(collection(db, 'certificates'), where('artistName', '==', currentUser.name));
        const unsubscribe = onSnapshot(q, snapshot => {
            const certs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certificate));
            setCertificates(certs);
        }, error => handleFirestoreError(error, 'certificates'));

        return () => unsubscribe();
    }, [currentUser]);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setFirebaseUser(user);

            if (user) {
                setIsAuthenticated(true);
                setIsInitialLogin(true); 

                const userDocRef = doc(db, 'users', user.uid);
                const unsubProfile = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        setCurrentUser(doc.data() as User);
                    } else {
                        setCurrentUser(null);
                    }
                    setAuthLoading(false);
                }, (error) => {
                    console.error("Error listening to user profile:", error);
                    setCurrentUser(null);
                    setAuthLoading(false);
                });
                return () => unsubProfile();
            } else {
                setIsAuthenticated(false);
                setCurrentUser(null);
                setAuthLoading(false);
                setIsInitialLogin(false);
            }
        });
        return () => unsubscribe();
    }, [auth]);


    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    useEffect(() => {
        if (currentUser?.profileComplete) {
            if (currentUser.role === 'customer') {
                setActivePage('customer-marketplace');
            } else if (!isInitialLogin) { 
                setActivePage('dashboard');
            }
            setSelectedPortfolioUser(null);
            setSelectedProduct(null);
        }
    }, [currentUser?.profileComplete, currentUser?.role]);
    
    useEffect(() => {
        if(selectedPortfolioUser) {
            setSelectedProduct(null);
        }
    }, [selectedPortfolioUser]);

    // #region Auth functions
    const login = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
    
    const signup = async (name: string, email: string, pass: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        if(userCredential.user) {
            await updateProfile(userCredential.user, { displayName: name });
            setFirebaseUser(auth.currentUser);
        }
        return userCredential;
    };

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    }

    const logout = () => {
        if (currentUser?.id.startsWith('guest_')) {
            setIsAuthenticated(false);
            setCurrentUser(null);
            setFirebaseUser(null);
            setAuthPage('landing');
            setCart([]);
            setFavorites([]);
            return;
        }
        signOut(auth).then(() => {
            setAuthPage('landing');
        });
    };
    
    const bypassLogin = () => {
        const guestUser: Artisan = {
            ...initialArtisans[0],
            id: `guest_${Date.now()}`,
            name: 'Guest User',
            profileComplete: false,
        };
        
        setFirebaseUser(null);
        setCurrentUser(guestUser);
        setIsAuthenticated(true);
        setAuthLoading(false);
        setAuthPage('landing');
    };

    const switchUserRole = (role: Role) => {
        if (!currentUser) return;
    
        let targetUser: User | Artisan | Volunteer | null = null;
        
        const mockCustomer: User = {
            id: 'customer_switched_1',
            name: currentUser.name,
            role: 'customer',
            avatar: currentUser.avatar,
            profileComplete: true,
        };
    
        if (role === 'artisan') {
            const targetArtisan = artisans.find(a => a.id !== currentUser.id) || artisans[0];
            if (targetArtisan) {
                targetUser = { ...targetArtisan, profileComplete: true };
            }
        } else if (role === 'volunteer') {
            const targetVolunteer = volunteers.find(v => v.id !== currentUser.id) || volunteers[0];
            if (targetVolunteer) {
                targetUser = { ...targetVolunteer, profileComplete: true };
            }
        } else if (role === 'customer') {
            targetUser = mockCustomer;
        }
    
        if (targetUser) {
            setSelectedProduct(null);
            setSelectedPortfolioUser(null);
            setCurrentUser(targetUser);
        }
    };

    const handleSetCurrentUser = async (newUser: any) => {
        if (typeof newUser === 'function') {
             setCurrentUser(newUser);
             return;
        }

        const userToSet = newUser as User;

        if (userToSet && userToSet.id.startsWith('guest_')) {
             setCurrentUser(userToSet);
             return;
        }

        if (userToSet && firebaseUser) {
            try {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                await setDoc(userDocRef, { ...userToSet, id: firebaseUser.uid }, { merge: true });
            } catch (error) {
                console.error("CRITICAL: Failed to create user profile in Firestore:", error);
                alert("Error: Could not save your profile. Please check your network connection and Firestore security rules.");
            }
        } else if (userToSet === null) {
            setCurrentUser(null);
        }
    };

    const updateUserProfile = async (profileData: Partial<Artisan | Volunteer | User>) => {
        if (currentUser?.id.startsWith('guest_')) {
            setCurrentUser(prev => ({
                ...prev!,
                ...profileData,
                profileComplete: true
            }));
            return;
        }

        if (firebaseUser) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            await setDoc(userDocRef, { ...profileData, profileComplete: true }, { merge: true });
        }
    };
    // #endregion

    // FIX: Added function to create a new certificate.
    const addCertificate = async (certificate: Certificate) => {
        if (!currentUser || currentUser.role !== 'artisan') return;
        try {
            const certCollection = collection(db, 'certificates');
            // We strip 'id' because Firestore generates it, but keep the data.
            const { id, ...certData } = certificate;
            await addDoc(certCollection, certData);
        } catch (error) {
            console.error("Error adding certificate:", error);
            handleFirestoreError(error, 'certificates');
        }
    };

    const getCertificate = async (certificateId: string): Promise<Certificate | null> => {
        if (firestoreFailedRef.current) {
            console.warn("Firestore connection failed. Cannot fetch individual certificate.");
            return null; 
        }
        try {
            const certRef = doc(db, 'certificates', certificateId);
            const certSnap = await getDoc(certRef);
            if (certSnap.exists()) {
                return { id: certSnap.id, ...certSnap.data() } as Certificate;
            }
            return null;
        } catch (error) {
            console.error("Error fetching certificate:", error);
            handleFirestoreError(error, 'certificates');
            return null;
        }
    };

    // FIX: Updated `addProduct` to handle certificate linking.
    const addProduct = async (productData: Omit<Product, 'id' | 'artisanId' | 'dateAdded'>, certificateId?: string) => {
        if (!currentUser || currentUser.role !== 'artisan') return;

        const batch = writeBatch(db);
        const newProductRef = doc(collection(db, "products"));

        const newProductData: Omit<Product, 'id'> = {
            ...productData,
            artisanId: currentUser.id,
            dateAdded: new Date().toISOString(),
            certificateId: certificateId || undefined,
        };
        
        batch.set(newProductRef, newProductData);
        
        if (certificateId) {
            // Firestore doesn't allow adding a document with an ID that might not exist yet in a batch, so we have to assume the cert ID is correct.
            // Also, we need to update the cert to link it to the *new* product ID.
            const certRef = doc(db, 'certificates', certificateId);
            batch.update(certRef, { assignedToProductId: newProductRef.id });
        }

        try {
            await batch.commit();
        } catch (error) {
            console.error("Error adding product and updating certificate: ", error);
            handleFirestoreError(error, 'products/certificates');
        }
    };

    const postNewProject = async (projectData: { title: string; description: string; skillsNeeded: string[] }) => {
        if (!currentUser || currentUser.role !== 'artisan') return;
    
        const newProject = {
            ...projectData,
            postedBy: currentUser.name,
            status: 'Open',
        };
    
        try {
            await addDoc(collection(db, "projects"), newProject);
        } catch (error) {
            console.error("Error adding project: ", error);
            handleFirestoreError(error, 'projects');
        }
    };
    
    // Cart functions
    const addToCart = (product: Product, offerPrice: number) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product.id === product.id);
            if (existingItem) {
                return prevCart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1, offerPrice } : item);
            }
            return [...prevCart, { product, quantity: 1, offerPrice }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    };

    const updateCartQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            setCart(prevCart => prevCart.map(item => item.product.id === productId ? { ...item, quantity } : item));
        }
    };

    // Favorites functions
    const toggleFavorite = (productId: string) => {
        setFavorites(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
    };
    const isFavorite = (productId: string) => favorites.includes(productId);

    // #region Chat functions
    useEffect(() => {
        if (!currentUser?.id || currentUser.id.startsWith('guest_')) {
            Object.keys(messageListenersRef.current).forEach(convId => messageListenersRef.current[convId]());
            messageListenersRef.current = {};
            setConversations([]);
            return;
        }
        
        const q = query(collection(db, 'conversations'), where('participantIds', 'array-contains', currentUser.id));

        const unsubscribeConversations = onSnapshot(q, (snapshot) => {
            const currentConversationIds = new Set<string>();
            const conversationsFromFS = snapshot.docs.map(doc => {
                currentConversationIds.add(doc.id);
                return {
                    id: doc.id,
                    messages: [],
                    ...doc.data()
                } as Conversation;
            });

            setConversations(prevConvs => {
                return conversationsFromFS.map(newConv => {
                    const existingConv = prevConvs.find(p => p.id === newConv.id);
                    return { ...newConv, messages: existingConv?.messages || [] };
                });
            });

            Object.keys(messageListenersRef.current).forEach(convId => {
                if (!currentConversationIds.has(convId)) {
                    messageListenersRef.current[convId]();
                    delete messageListenersRef.current[convId];
                }
            });

            conversationsFromFS.forEach(conv => {
                if (!messageListenersRef.current[conv.id]) {
                    const messagesQuery = query(collection(db, `conversations/${conv.id}/messages`), orderBy('timestamp', 'asc'));
                    const unsubMessages = onSnapshot(messagesQuery, (messagesSnapshot) => {
                        const messages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
                        setConversations(prev => prev.map(p => p.id === conv.id ? { ...p, messages } : p));
                    });
                    messageListenersRef.current[conv.id] = unsubMessages;
                }
            });
        }, (error) => handleFirestoreError(error, 'conversations'));

        return () => {
            unsubscribeConversations();
            Object.keys(messageListenersRef.current).forEach(convId => messageListenersRef.current[convId]());
            messageListenersRef.current = {};
        };
    }, [currentUser]);

    const startChat = (participant: ParticipantDetails) => {
        setStartChatWith(participant);
        if (currentUser?.role === 'customer') {
            setActivePage('customer-chat');
        } else {
            setActivePage('chat');
        }
    };
    
    const clearStartChat = () => setStartChatWith(null);

    const createOrSelectConversation = async (otherParticipant: ParticipantDetails): Promise<string> => {
        if (!currentUser) return '';
        const sortedIds = [currentUser.id, otherParticipant.id].sort();
        const conversationId = sortedIds.join('-');

        const conversationRef = doc(db, 'conversations', conversationId);
        const conversationSnap = await getDoc(conversationRef);

        if (!conversationSnap.exists()) {
            const newConversationData = {
                participantIds: sortedIds,
                participants: {
                    [currentUser.id]: { name: currentUser.name, avatar: currentUser.avatar },
                    [otherParticipant.id]: { name: otherParticipant.name, avatar: otherParticipant.avatar },
                },
            };
            await setDoc(conversationRef, newConversationData);
        }
        
        return conversationId;
    };

    const sendMessage = async (conversationId: string, messageText: string) => {
        if (!currentUser) return;
        
        const conversationRef = doc(db, 'conversations', conversationId);
        const messagesCollectionRef = collection(conversationRef, 'messages');

        const newMessage = {
            senderId: currentUser.id,
            text: messageText,
            timestamp: serverTimestamp(),
        };

        const batch = writeBatch(db);
        const newMessageRef = doc(messagesCollectionRef);
        batch.set(newMessageRef, newMessage);

        batch.update(conversationRef, {
            lastMessage: {
                text: messageText,
                timestamp: serverTimestamp()
            }
        });

        await batch.commit();
    };
    // #endregion
    
    // #region Bargain functions
    useEffect(() => {
        if (!currentUser) {
            setBargainRequests([]);
            prevBargainRequestsRef.current = [];
            return;
        }

        let q;
        if (currentUser.role === 'customer') {
            q = query(collection(db, 'bargainRequests'), where('customerId', '==', currentUser.id));
        } else if (currentUser.role === 'artisan') {
            q = query(collection(db, 'bargainRequests'), where('artisanId', '==', currentUser.id));
        } else {
            return; 
        }
        
        const unsubscribe = onSnapshot(q, snapshot => {
            const newRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BargainRequest));
            
            if (currentUser.role === 'customer') {
                const oldRequests = prevBargainRequestsRef.current;
                if (oldRequests.length > 0) { 
                    newRequests.forEach(newReq => {
                        const oldReq = oldRequests.find(o => o.id === newReq.id);
                        if (oldReq && oldReq.status === 'pending' && newReq.status === 'accepted') {
                            addNotification(`Offer accepted for "${newReq.productName}"!`, 'success', { text: 'View My Offers', action: () => setActivePage('customer-offers')});
                        } else if (oldReq && oldReq.status === 'pending' && newReq.status === 'rejected') {
                            addNotification(`Your offer for "${newReq.productName}" was not accepted.`, 'info');
                        }
                    });
                }
            }

            setBargainRequests(newRequests);
            prevBargainRequestsRef.current = newRequests;
        }, (error) => handleFirestoreError(error, 'bargainRequests'));
        
        return () => {
            unsubscribe();
            prevBargainRequestsRef.current = [];
        };
    }, [currentUser]);

    const createBargainRequest = async (product: Product, offerPrice: number) => {
        if (!currentUser || currentUser.role !== 'customer') return;

        const newRequest: Omit<BargainRequest, 'id'> = {
            productId: product.id,
            productName: product.name,
            productImage: product.image,
            customerId: currentUser.id,
            customerName: currentUser.name,
            artisanId: product.artisanId,
            originalPrice: product.price,
            offerPrice: offerPrice,
            status: 'pending',
            requestDate: serverTimestamp(),
        };
        await addDoc(collection(db, 'bargainRequests'), newRequest);
    };

    const updateBargainRequestStatus = async (requestId: string, status: 'accepted' | 'rejected') => {
        const reqRef = doc(db, 'bargainRequests', requestId);
        await updateDoc(reqRef, { status });
    };

    const completeBargainRequest = async (requestId: string) => {
        const reqRef = doc(db, 'bargainRequests', requestId);
        await updateDoc(reqRef, { status: 'completed' });
    };
    // #endregion

    // #region Connection Request Functions
    useEffect(() => {
        if (!currentUser?.id || currentUser.id.startsWith('guest_')) {
            setConnectionRequests([]);
            prevConnectionRequestsRef.current = [];
            return;
        }

        const receivedQuery = query(collection(db, 'connectionRequests'), where('receiverId', '==', currentUser.id));
        const sentQuery = query(collection(db, 'connectionRequests'), where('senderId', '==', currentUser.id));

        let receivedRequests: ConnectionRequest[] = [];
        let sentRequests: ConnectionRequest[] = [];
        
        const combineAndSet = () => {
            const all = [...receivedRequests, ...sentRequests];
            const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
            
            const oldRequests = prevConnectionRequestsRef.current;
            if (oldRequests.length > 0 && currentUser) {
                 unique.forEach(newReq => {
                    const oldReq = oldRequests.find(o => o.id === newReq.id);
                    // Notify receiver of new request
                    if (!oldReq && newReq.receiverId === currentUser.id && newReq.status === 'pending') {
                         addNotification(`${newReq.senderName} wants to connect.`, 'info', { text: 'View Requests', action: () => setActivePage(currentUser.role === 'customer' ? 'customer-offers' : 'dashboard') });
                    }
                    // Notify sender of status change
                    if (oldReq && oldReq.status === 'pending' && newReq.senderId === currentUser.id) {
                        const allAppUsers = [...artisans, ...volunteers];
                        const receiverUser = allAppUsers.find(u => u.id === newReq.receiverId);
                        const receiverName = receiverUser?.name || 'The user';

                        const chatPage: Page = currentUser.role === 'customer' ? 'customer-chat' : 'chat';
                        
                        if (newReq.status === 'accepted') {
                            addNotification(`${receiverName} accepted your connection request!`, 'success', { text: 'Go to Chat', action: () => setActivePage(chatPage) });
                        } else if (newReq.status === 'rejected') {
                            addNotification(`${receiverName} declined your connection request.`, 'info');
                        }
                    }
                });
            }
            
            setConnectionRequests(unique);
            prevConnectionRequestsRef.current = unique;
        };

        const unsubReceived = onSnapshot(receivedQuery, snapshot => {
            receivedRequests = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ConnectionRequest));
            combineAndSet();
        }, error => handleFirestoreError(error, 'connectionRequests (received)'));

        const unsubSent = onSnapshot(sentQuery, snapshot => {
            sentRequests = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ConnectionRequest));
            combineAndSet();
        }, error => handleFirestoreError(error, 'connectionRequests (sent)'));

        return () => {
            unsubReceived();
            unsubSent();
            prevConnectionRequestsRef.current = [];
        };
    }, [currentUser, artisans, volunteers]);

    const sendConnectionRequest = async (receiver: User) => {
        if (!currentUser) return;
        
        const newRequest: Omit<ConnectionRequest, 'id'> = {
            senderId: currentUser.id,
            receiverId: receiver.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar,
            senderRole: currentUser.role,
            status: 'pending',
            timestamp: serverTimestamp()
        };
        await addDoc(collection(db, 'connectionRequests'), newRequest);
    };

    const respondToConnectionRequest = async (request: ConnectionRequest, response: 'accepted' | 'rejected') => {
        if (!currentUser) return;
        const requestRef = doc(db, 'connectionRequests', request.id);
        await updateDoc(requestRef, { status: response });
    
        if (response === 'accepted') {
            const otherParticipant: ParticipantDetails = {
                id: request.senderId,
                name: request.senderName,
                avatar: request.senderAvatar
            };
            await createOrSelectConversation(otherParticipant);
            const chatPage: Page = currentUser.role === 'customer' ? 'customer-chat' : 'chat';
            addNotification(`You are now connected with ${request.senderName}.`, 'success', { text: 'Go to Chat', action: () => setActivePage(chatPage) });
        }
    };
    // #endregion
    
     // #region Project Application & Collaboration Functions
    useEffect(() => {
        if (!currentUser?.id || firestoreFailedRef.current) {
            setProjectApplications([]);
            setCollaborations([]);
            return;
        };

        let unsubApp: Unsubscribe;
        let unsubCollab: Unsubscribe;

        if (currentUser.role === 'artisan') {
            const appQuery = query(collection(db, 'projectApplications'), where('artisanId', '==', currentUser.id));
            unsubApp = onSnapshot(appQuery, snapshot => {
                const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectApplication));
                setProjectApplications(apps);
            }, (error) => handleFirestoreError(error, 'projectApplications'));

            const collabQuery = query(collection(db, 'collaborations'), where('artisanId', '==', currentUser.id));
            unsubCollab = onSnapshot(collabQuery, snapshot => {
                const collabs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collaboration));
                setCollaborations(collabs);
            }, (error) => handleFirestoreError(error, 'collaborations'));

        } else if (currentUser.role === 'volunteer') {
            const appQuery = query(collection(db, 'projectApplications'), where('volunteerId', '==', currentUser.id));
            unsubApp = onSnapshot(appQuery, snapshot => {
                const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectApplication));
                setProjectApplications(apps);
            }, (error) => handleFirestoreError(error, 'projectApplications'));
            
            const collabQuery = query(collection(db, 'collaborations'), where('volunteerId', '==', currentUser.id));
            unsubCollab = onSnapshot(collabQuery, snapshot => {
                const collabs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collaboration));
                setCollaborations(collabs);
            }, (error) => handleFirestoreError(error, 'collaborations'));
        }

        return () => {
            unsubApp?.();
            unsubCollab?.();
        };

    }, [currentUser]);

    const applyForProject = async (project: Project) => {
        if (!currentUser || currentUser.role !== 'volunteer') return;
        const artisan = artisans.find(a => a.name === project.postedBy);
        if (!artisan) return;
        
        const newApplication: Omit<ProjectApplication, 'id'> = {
            projectId: project.id,
            volunteerId: currentUser.id,
            artisanId: artisan.id,
            status: 'pending',
            applicationDate: new Date().toISOString(),
        };

        await addDoc(collection(db, 'projectApplications'), newApplication);
        addNotification(`Application sent for "${project.title}"!`, 'success');
    };

    const respondToApplication = async (application: ProjectApplication, response: 'accepted' | 'declined') => {
        if (!currentUser || currentUser.role !== 'artisan') return;

        const batch = writeBatch(db);
        const appRef = doc(db, 'projectApplications', application.id);
        batch.update(appRef, { status: response });

        if (response === 'accepted') {
            const volunteer = volunteers.find(v => v.id === application.volunteerId);
            if (!volunteer) throw new Error("Volunteer not found");
            
            const collabRef = doc(collection(db, 'collaborations'));
            batch.set(collabRef, {
                projectId: application.projectId,
                volunteerId: application.volunteerId,
                artisanId: currentUser.id,
                startDate: new Date().toISOString(),
                status: 'in-progress'
            } as Omit<Collaboration, 'id'>);

            const projectRef = doc(db, 'projects', application.projectId);
            batch.update(projectRef, { status: 'In Progress' });
            
            const otherAppsQuery = query(collection(db, 'projectApplications'), where('projectId', '==', application.projectId), where('status', '==', 'pending'));
            const otherAppsSnapshot = await getDocs(otherAppsQuery);
            otherAppsSnapshot.docs.forEach(doc => {
                if (doc.id !== application.id) {
                    batch.update(doc.ref, { status: 'declined' });
                }
            });
            
            addNotification(`You have accepted ${volunteer.name}'s application.`, 'success');

        } else {
             addNotification(`Application for ${volunteers.find(v => v.id === application.volunteerId)?.name} declined.`, 'info');
        }

        await batch.commit();
    };

    const endCollaboration = async (collaboration: Collaboration, feedback: string, rating: number) => {
        if (!currentUser || currentUser.role !== 'artisan') return;
    
        const volunteer = volunteers.find(v => v.id === collaboration.volunteerId);
        if (!volunteer) return;
    
        const batch = writeBatch(db);
        const collabRef = doc(db, 'collaborations', collaboration.id);
        batch.update(collabRef, { status: 'completed', endDate: new Date().toISOString(), feedback, rating });
        
        const projectRef = doc(db, 'projects', collaboration.projectId);
        batch.update(projectRef, { status: 'Completed' });
        
        if (feedback.trim()) {
            const volunteerRef = doc(db, 'users', volunteer.id);
            const volunteerDoc = await getDoc(volunteerRef);
            const volunteerData = volunteerDoc.data() as Volunteer;
            
            batch.update(volunteerRef, {
                testimonials: [...(volunteerData.testimonials || []), { quote: feedback, artisanName: currentUser.name, artisanAvatar: currentUser.avatar }]
            });
        }
        
        await batch.commit();
        addNotification(`Collaboration with ${volunteer.name} ended.`, 'success');
    };

    const issueCertificate = async (collaboration: Collaboration) => {
        if (!currentUser || currentUser.role !== 'artisan') return;

        const volunteer = volunteers.find(v => v.id === collaboration.volunteerId);
        const project = projects.find(p => p.id === collaboration.projectId);

        if (!volunteer || !project) {
            addNotification('Could not find volunteer or project details.', 'error');
            return;
        }

        if (volunteer.completedProjects?.some(p => p.id === collaboration.id)) {
            addNotification('A certificate has already been issued for this project.', 'info');
            return;
        }

        try {
            const certificateText = await generateCertificateText(currentUser.name, volunteer.name, project.title, 40, project.skillsNeeded, language);

            const newCompletedProject: CompletedProject = {
                id: collaboration.id,
                projectName: project.title,
                artisanName: currentUser.name,
                artisanAvatar: currentUser.avatar,
                certificateText,
                skills: project.skillsNeeded,
                issuedDate: new Date().toISOString(),
            };

            const volunteerRef = doc(db, 'users', volunteer.id);
            const volunteerDoc = await getDoc(volunteerRef);
            const volunteerData = volunteerDoc.data() as Volunteer;

            await updateDoc(volunteerRef, {
                projectsCompleted: (volunteerData.projectsCompleted || 0) + 1,
                completedProjects: [...(volunteerData.completedProjects || []), newCompletedProject],
            });
            
            addNotification(`Certificate issued to ${volunteer.name}!`, 'success');

        } catch (error) {
            console.error("Error issuing certificate:", error);
            addNotification('Failed to generate or issue certificate.', 'error');
        }
    };
    // #endregion


    const value: AppContextType = {
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        updateUserProfile,
        activePage,
        setActivePage,
        theme,
        toggleTheme,
        language,
        setLanguage,
        projects,
        setProjects,
        postNewProject,
        volunteers,
        setVolunteers,
        artisans,
        products,
        addProduct,
        selectedProduct,
        setSelectedProduct,
        selectedPortfolioUser,
        setSelectedPortfolioUser,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        favorites,
        toggleFavorite,
        isFavorite,
        conversations,
        sendMessage,
        startChatWith,
        startChat,
        createOrSelectConversation,
        firebaseUser,
        authLoading,
        isAuthenticated,
        isInitialLogin,
        setIsInitialLogin,
        login,
        signup,
        loginWithGoogle,
        logout,
        bypassLogin,
        authPage,
        setAuthPage,
        switchUserRole,
        clearStartChat,
        t,
        firestoreError,
        bargainRequests,
        createBargainRequest,
        updateBargainRequestStatus,
        completeBargainRequest,
        connectionRequests,
        sendConnectionRequest,
        respondToConnectionRequest,
        projectApplications,
        collaborations,
        applyForProject,
        respondToApplication,
        endCollaboration,
        issueCertificate,
        // FIX: Added missing properties to the context value.
        addCertificate,
        certificates,
        getCertificate,
        notifications,
        removeNotification,
    };
    
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');
    const value = { language, setLanguage };
    return (
        <LocalizationProvider value={value}>
            <AppProviderContent>{children}</AppProviderContent>
        </LocalizationProvider>
    );
};