import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Smartphone, ChartBar } from 'lucide-react';

const cards = [
    {
        icon: <Zap className="w-8 h-8 text-primary" />,
        title: "Smart Rules",
        description: "Links reorder automatically based on time and context."
    },
    {
        icon: <Smartphone className="w-8 h-8 text-cyan-400" />,
        title: "Context Aware",
        description: "Detect device and prioritize relevant links instantly."
    },
    {
        icon: <ChartBar className="w-8 h-8 text-purple-400" />,
        title: "Deep Analytics",
        description: "Track clicks, CTR, and rule performance."
    }
];

const FeatureCards: React.FC = () => {
    return (
        <section className="py-20 px-4 relative z-10">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {cards.map((card, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 }}
                        whileHover={{ y: -10, boxShadow: "0 10px 40px -10px rgba(0,255,136,0.1)" }}
                        className="p-8 rounded-2xl glass border border-white/5 bg-gradient-to-b from-white/5 to-transparent hover:border-primary/30 transition-colors group cursor-default"
                    >
                        <div className="mb-6 p-4 rounded-full bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300">
                            {card.icon}
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
                        <p className="text-muted leading-relaxed">{card.description}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default FeatureCards;
