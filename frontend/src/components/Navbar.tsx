import React from 'react';
import { motion } from 'framer-motion';

interface NavbarProps {
    isLoggedIn: boolean;
    onOpenAuth: (mode: 'login' | 'signup') => void;
    onNavigateDashboard: () => void;
    onNavigateHome: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, onOpenAuth, onNavigateDashboard, onNavigateHome }) => {
    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="flex justify-between items-center glass rounded-full px-6 py-3 w-full max-w-4xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10"
            >
                <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={onNavigateHome}
                >
                    <span className="text-xl font-bold tracking-tighter group-hover:text-primary transition-colors">HubGen</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(0,255,136,0.8)]" />
                </div>

                <div className="flex items-center gap-1 md:gap-3">
                    {isLoggedIn ? (
                        <button
                            onClick={onNavigateDashboard}
                            className="px-5 py-2 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 text-xs font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)] cursor-pointer"
                        >
                            Go to Dashboard
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => onOpenAuth('login')}
                                className="px-4 py-2 rounded-full text-white/70 hover:text-white transition-colors text-xs font-medium cursor-pointer"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => onOpenAuth('signup')}
                                className="px-5 py-2 rounded-full border border-primary/20 bg-primary/10 hover:bg-primary text-white hover:text-black transition-all duration-300 text-xs font-bold shadow-[0_0_15px_rgba(0,255,136,0.1)] hover:shadow-neon cursor-pointer"
                            >
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </motion.nav>
        </div>
    );
};

export default Navbar;
