import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Personnel, Role } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

// --- CONFIGURATION ---
// This is the static database of users and their roles for authentication purposes.
// It decouples the auth system from the live personnel state in the app.
const PERSONNEL_DB: Omit<Personnel, 'id'>[] = [
    { name: '戎書甫', email: 'souby0000@gmail.com', title: '副理', role: 'admin' },
    { name: '陳小明', email: 'ming.chen@example.com', role: 'editor' },
    { name: '林美麗', email: 'mei.lin@example.com', role: 'editor' },
    { name: '張大偉', email: 'david.chang@example.com', role: 'viewer' },
    { name: '王經理', email: 'manager.wang@example.com', title: '經理', role: 'admin' },
    { name: '技術支援部', email: 'it-support@example.com', role: 'viewer' },
];

// --- TYPES ---
export interface UserProfile {
    email: string;
    name: string;
    picture: string;
    role: Role;
}

interface AuthContextType {
    user: UserProfile | null;
    isAuthorized: boolean;
    isLoading: boolean;
    logout: () => void;
}

// --- CONTEXT ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    const handleCredentialResponse = useCallback((response: any) => {
        setIsLoading(true);
        try {
            const decoded: any = jwtDecode(response.credential);
            const userInDb = PERSONNEL_DB.find(p => p.email === decoded.email);

            if (userInDb) {
                 const userProfile: UserProfile = {
                    email: decoded.email,
                    name: decoded.name,
                    picture: decoded.picture,
                    role: userInDb.role,
                };
                sessionStorage.setItem('google_credential', response.credential);
                setUser(userProfile);
                setIsAuthorized(true);
            } else {
                // User's Google account is valid, but they are not in our DB.
                const unauthorizedProfile: UserProfile = {
                    email: decoded.email,
                    name: decoded.name,
                    picture: decoded.picture,
                    role: 'viewer', // Assign a non-privileged role
                };
                sessionStorage.removeItem('google_credential');
                setUser(unauthorizedProfile);
                setIsAuthorized(false);
            }
        } catch (error) {
            console.error("Error decoding credential:", error);
            sessionStorage.removeItem('google_credential');
            setUser(null);
            setIsAuthorized(false);
        }
        setIsLoading(false);
    }, []);

    const logout = useCallback(() => {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        sessionStorage.removeItem('google_credential');
        setUser(null);
        setIsAuthorized(false);
    }, []);

    useEffect(() => {
        const GOOGLE_CLIENT_ID = localStorage.getItem('google_client_id');

        if (!GOOGLE_CLIENT_ID) {
            console.error("Google Client ID not found in storage. Setup is incomplete.");
            setIsLoading(false);
            return;
        }

        const initializeGsi = () => {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse,
                    auto_select: true
                });
                const storedCredential = sessionStorage.getItem('google_credential');
                if (storedCredential) {
                    handleCredentialResponse({ credential: storedCredential });
                } else {
                    setIsLoading(false);
                }
            } else {
                setTimeout(initializeGsi, 150);
            }
        };
        
        initializeGsi();
    }, [handleCredentialResponse]);

    const value = { user, isAuthorized, isLoading, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- HOOK ---
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
