import React from 'react';

/**
 * Reusable Skeleton loading component
 * @param {string} width - Width of the skeleton
 * @param {string} height - Height of the skeleton
 * @param {string} borderRadius - Border radius of the skeleton
 * @param {string} className - Additional CSS classes
 */
const Skeleton = ({ width = '100%', height = '20px', borderRadius = '4px', className = '' }) => {
    return (
        <div
            className={`relative overflow-hidden bg-slate-200 ${className}`}
            style={{
                width,
                height,
                borderRadius,
            }}
        >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        </div>
    );
};

export default Skeleton;
