import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, AlertCircle, Info } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
    initialMode: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, initialMode }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsLogin(initialMode === 'login');
        setError(null);
    }, [initialMode, isOpen]);

    const handleMockAuth = (mode: 'login' | 'signup') => {
        const users = JSON.parse(localStorage.getItem('hubgen_mock_users') || '[]');

        if (mode === 'login') {
            const user = users.find((u: any) => u.email === email && u.password === password);
            if (user) {
                onLoginSuccess();
                onClose();
            } else {
                const emailExists = users.some((u: any) => u.email === email);
                if (emailExists) {
                    throw new Error('Invalid password. Please try again.');
                } else {
                    throw new Error('Account not found. Please sign up first.');
                }
            }
        } else {
            const emailExists = users.some((u: any) => u.email === email);
            if (emailExists) {
                throw new Error('Account already exists. Please login instead.');
            }
            users.push({ email, password });
            localStorage.setItem('hubgen_mock_users', JSON.stringify(users));
            alert('Mock account created! You can now login.');
            setIsLogin(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (!isSupabaseConfigured) {
                // Fallback to Mock Auth for Demo Perfection
                console.warn('Supabase not configured, using LocalStorage mock auth.');
                handleMockAuth(isLogin ? 'login' : 'signup');
                setLoading(false);
                return;
            }

            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
                        throw new Error('Account not found or password incorrect. Please sign up if you haven\'t yet.');
                    }
                    throw error;
                }
                onLoginSuccess();
                onClose();
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Verification email sent! Please check your inbox.');
                onClose();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md glass p-8 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#0A0A0A]"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-muted hover:text-white transition-colors cursor-pointer"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-black mb-2 tracking-tight">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-muted mb-6">
                            {isLogin ? 'Login to manage your smart hub' : 'Join HubGen and create your smart link hub'}
                        </p>

                        {!isSupabaseConfigured && (
                            <div className="mb-6 p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center gap-2 text-xs font-medium">
                                <Info size={14} />
                                <span>Demo Mode: Running with Local Auth</span>
                            </div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3 text-sm"
                            >
                                <AlertCircle className="shrink-0 w-5 h-5" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="email"
                                    required
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 focus:border-primary/50 focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="password"
                                    required
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 focus:border-primary/50 focus:outline-none transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-black font-bold py-4 rounded-xl mt-4 hover:shadow-neon hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm">
                            <span className="text-muted">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                            </span>
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-primary font-bold hover:underline cursor-pointer"
                            >
                                {isLogin ? 'Sign Up' : 'Login'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
