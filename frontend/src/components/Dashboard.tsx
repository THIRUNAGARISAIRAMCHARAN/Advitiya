import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    MousePointer2,
    Users,
    Plus,
    Trash2,
    Settings2,
    Layout,
    ExternalLink,
    Zap
} from 'lucide-react';

interface Link {
    id: string;
    title: string;
    url: string;
    clicks: number;
}

interface Stats {
    totalClicks: string;
    uniqueVisitors: string;
    ctr: string;
}

const API_BASE = 'http://localhost:3001/api';

const Dashboard: React.FC = () => {
    const [links, setLinks] = useState<Link[]>([]);
    const [stats, setStats] = useState<Stats>({ totalClicks: '0', uniqueVisitors: '0', ctr: '0%' });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newLink, setNewLink] = useState({ title: '', url: '' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [linksRes, statsRes] = await Promise.all([
                fetch(`${API_BASE}/links`),
                fetch(`${API_BASE}/stats`)
            ]);
            const linksData = await linksRes.json();
            const statsData = await statsRes.json();
            setLinks(linksData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLink.title || !newLink.url) return;

        try {
            const res = await fetch(`${API_BASE}/links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLink)
            });
            if (res.ok) {
                const addedLink = await res.json();
                setLinks([addedLink, ...links]);
                setNewLink({ title: '', url: '' });
                setIsAddModalOpen(false);
                // Refresh stats
                const statsUpdate = await fetch(`${API_BASE}/stats`);
                setStats(await statsUpdate.json());
            }
        } catch (error) {
            console.error('Failed to add link:', error);
        }
    };

    const handleDeleteLink = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/links/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setLinks(links.filter(link => link.id !== id));
                // Refresh stats
                const statsUpdate = await fetch(`${API_BASE}/stats`);
                setStats(await statsUpdate.json());
            }
        } catch (error) {
            console.error('Failed to delete link:', error);
        }
    };

    const handleLinkClick = async (url: string, id: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
        try {
            await fetch(`${API_BASE}/analytics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ link_id: id, event_type: 'click' })
            });
            // Update UI optimistically or refresh
            setLinks(prev => prev.map(l => l.id === id ? { ...l, clicks: l.clicks + 1 } : l));
            const statsUpdate = await fetch(`${API_BASE}/stats`);
            setStats(await statsUpdate.json());
        } catch (error) {
            console.error('Failed to record analytics:', error);
        }
    };

    const statsConfig = [
        { label: 'Total Clicks', value: stats.totalClicks, icon: <MousePointer2 className="text-primary" />, trend: '+--%' },
        { label: 'Unique Visitors', value: stats.uniqueVisitors, icon: <Users className="text-cyan-400" />, trend: '+--%' },
        { label: 'Avg. CTR', value: stats.ctr, icon: <BarChart3 className="text-purple-400" />, trend: '+--%' },
    ];

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>;
    }

    return (
        <div className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Performance</h1>
                    <p className="text-muted">Real-time insights for your smart link hub.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 glass rounded-xl border border-white/5 text-xs font-semibold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-neon" />
                        Live Sync
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statsConfig.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            {stat.icon}
                        </div>
                        <p className="text-muted text-sm font-medium mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black mb-1">{stat.value}</h3>
                        <span className="text-xs font-bold text-primary">{stat.trend}</span>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Link Management */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Layout size={20} className="text-primary" />
                            Your Links
                        </h2>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-xl font-bold text-sm hover:shadow-neon transition-all cursor-pointer"
                        >
                            <Plus size={16} /> Add Link
                        </button>
                    </div>

                    <div className="space-y-4">
                        {links.length === 0 ? (
                            <div className="glass p-12 rounded-2xl border border-dashed border-white/10 text-center">
                                <p className="text-muted mb-4">No links added yet. Start by adding your first one!</p>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="text-primary font-bold hover:underline"
                                >
                                    Add your first link →
                                </button>
                            </div>
                        ) : (
                            links.map((link) => (
                                <motion.div
                                    key={link.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => handleLinkClick(link.url, link.id)}
                                    className="glass p-4 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                                            <ExternalLink size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold group-hover:text-primary transition-colors">{link.title}</h4>
                                            <p className="text-xs text-muted truncate max-w-[200px]">{link.url}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs text-muted">Clicks</p>
                                            <p className="font-bold text-primary">{link.clicks}</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteLink(link.id);
                                            }}
                                            className="p-2 text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Smart Rule Engine */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Zap size={20} className="text-primary" />
                        Smart Rules
                    </h2>
                    <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Active Rule</span>
                                    <Settings2 size={14} className="text-primary" />
                                </div>
                                <p className="text-sm font-medium">Prioritize Portfolio on Mobile</p>
                                <p className="text-[10px] text-muted font-medium">Reorders links when device = 'mobile'</p>
                            </div>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 opacity-60">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider">Scheduled</span>
                                </div>
                                <p className="text-sm font-medium">Night Mode Redirect</p>
                                <p className="text-[10px] text-muted font-medium">Hides work links after 9:00 PM</p>
                            </div>
                        </div>

                        <button className="w-full py-3 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/5 transition-all cursor-pointer">
                            Configure New Rule
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Link Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass w-full max-w-md p-8 rounded-3xl border border-white/10 relative"
                    >
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-4 right-4 text-muted hover:text-white transition-colors cursor-pointer"
                        >
                            <Trash2 size={20} className="rotate-45" />
                        </button>
                        <h2 className="text-2xl font-black mb-6">Add New Link</h2>
                        <form onSubmit={handleAddLink} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">Title</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
                                    placeholder="e.g. My Website"
                                    value={newLink.title}
                                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">URL</label>
                                <input
                                    type="url"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
                                    placeholder="https://example.com"
                                    value={newLink.url}
                                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-primary text-black font-black rounded-xl hover:shadow-neon transition-all mt-4 cursor-pointer"
                            >
                                Add Link
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
