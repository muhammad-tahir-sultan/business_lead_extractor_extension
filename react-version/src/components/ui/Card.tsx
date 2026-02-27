import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    animate?: boolean;
    delay?: number;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    animate = false,
    delay = 0,
    onClick
}) => {
    const content = (
        <div
            onClick={onClick}
            className={`glass-card p-4 ${onClick ? 'cursor-pointer hover:border-white/20' : ''} ${className}`}
        >
            {children}
        </div>
    );

    if (animate) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay }}
            >
                {content}
            </motion.div>
        );
    }

    return content;
};
