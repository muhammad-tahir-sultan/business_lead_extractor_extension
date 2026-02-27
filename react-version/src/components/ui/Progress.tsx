import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'surface';
    size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'surface',
    size = 'md'
}) => {
    const variants = {
        primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        error: 'bg-red-500/10 text-red-400 border-red-500/20',
        surface: 'bg-white/5 text-muted border-white/10',
    };

    const sizes = {
        sm: 'px-1.5 py-0.5 text-[8px]',
        md: 'px-2 py-1 text-[10px]',
    };

    return (
        <span className={`inline-flex items-center font-bold uppercase tracking-tight border rounded-full ${variants[variant]} ${sizes[size]}`}>
            {children}
        </span>
    );
};

interface ProgressProps {
    value: number;
    label?: string;
    subLabel?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, label, subLabel }) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <div>
                    {label && <p className="text-xs font-medium text-white">{label}</p>}
                    {subLabel && <p className="text-[10px] text-muted">{subLabel}</p>}
                </div>
                <span className="text-xs font-bold text-indigo-400">{Math.round(value)}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                    className="h-full premium-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                />
            </div>
        </div>
    );
};
