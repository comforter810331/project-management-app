import React, { useEffect, useRef } from 'react';

const LoginScreen: React.FC = () => {
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const hasRendered = useRef(false);

    useEffect(() => {
        const renderGoogleButton = () => {
            if (window.google && window.google.accounts && googleButtonRef.current && !hasRendered.current) {
                hasRendered.current = true;
                window.google.accounts.id.renderButton(
                    googleButtonRef.current,
                    { 
                        theme: "filled_blue", 
                        size: "large", 
                        text: "signin_with",
                        shape: "rectangular", 
                        logo_alignment: "left",
                        width: "280"
                    }
                );
                // Optionally show one-tap prompt
                // window.google.accounts.id.prompt(); 
            }
        };

        const interval = setInterval(() => {
            if (window.google && window.google.accounts) {
                clearInterval(interval);
                renderGoogleButton();
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
            <div className="w-full max-w-md mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-lg text-center">
                 <h1 className="text-3xl font-bold text-slate-800">
                    專案管理系統
                </h1>
                <p className="mt-3 text-md text-slate-500">
                    請使用您的 Google 帳號登入以繼續
                </p>
                <div className="mt-8 flex justify-center">
                    <div ref={googleButtonRef}></div>
                </div>
            </div>
            <footer className="text-center mt-8 text-sm text-slate-400">
                <p>&copy; {new Date().getFullYear()} 專案管理系統. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LoginScreen;
