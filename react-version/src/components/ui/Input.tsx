import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    icon,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-indigo-400 transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    className={`
            w-full bg-white/5 border border-white/10 rounded-xl py-2.5 text-sm 
            focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 
            transition-all placeholder:text-muted/50
            ${icon ? 'pl-10' : 'px-4'}
            ${className}
          `}
                    {...props}
                />
            </div>
        </div>
    );
};

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({
    label,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block ml-1">
                    {label}
                </label>
            )}
            <textarea
                className={`
          w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm 
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 
          transition-all placeholder:text-muted/50 resize-none
          ${className}
        `}
                {...props}
            />
        </div>
    );
};
