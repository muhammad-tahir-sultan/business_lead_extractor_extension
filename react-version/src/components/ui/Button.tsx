import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'premium' | 'premium-alt';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none rounded-xl';

    const variants = {
        primary: 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20',
        secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
        danger: 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20',
        ghost: 'bg-transparent text-muted hover:text-white',
        premium: 'premium-gradient text-white shadow-lg',
        'premium-alt': 'premium-gradient-alt text-white shadow-lg',
    };

    const sizes = {
        sm: 'py-1.5 px-3 text-[10px] tracking-wider uppercase',
        md: 'py-2.5 px-5 text-sm',
        lg: 'py-3.5 px-6 text-base',
        icon: 'p-2',
    };

    return (
        <motion.button
            whileHover={{ y: -1 }}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            {...props as any}
        >
            {children}
        </motion.button>
    );
};
