import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
    onOpenAuth: () => void;
    isLoggedIn: boolean;
    onNavigateDashboard: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenAuth, isLoggedIn, onNavigateDashboard }) => {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-20">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 max-w-4xl mx-auto"
            >
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight">
                    The Link Hub That <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 drop-shadow-[0_0_30px_rgba(0,255,136,0.5)]">
                        THINKS.
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
                    Smart link-in-bio that adapts using time, device, and location.
                    <br className="hidden md:block" />
                    No static links. Only what matters now.
                </p>

                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 255, 136, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isLoggedIn ? onNavigateDashboard : onOpenAuth}
                    className="group relative px-8 py-4 bg-primary text-black font-bold rounded-xl text-lg flex items-center gap-2 mx-auto overflow-hidden transition-all cursor-pointer"
                >
                    <span className="relative z-10">
                        {isLoggedIn ? 'Go to Dashboard' : 'Claim Your Hub →'}
                    </span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </motion.button>
            </motion.div>
        </section>
    );
};

export default Hero;
