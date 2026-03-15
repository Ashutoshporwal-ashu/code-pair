import React from 'react';

const Background = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* 🌌 Animated Cyberpunk Grid */}
            <div className="animated-grid"></div>
            
            {/* 🔮 Big Floating Neon Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-20 animate-float-slow"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent rounded-full blur-[150px] opacity-10 animate-float-fast"></div>

            {/* ✨ Tiny Floating Particles / Stars */}
            <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-white rounded-full animate-pulse opacity-50 shadow-[0_0_10px_white]"></div>
            <div className="absolute top-[60%] right-[20%] w-3 h-3 bg-accent rounded-full animate-bounce opacity-40 shadow-[0_0_15px_#00f0ff] animate-float-slow"></div>
            <div className="absolute bottom-[30%] left-[30%] w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse opacity-60 shadow-[0_0_8px_#7c3aed]"></div>
            <div className="absolute top-[10%] right-[40%] w-2 h-2 bg-white rounded-full animate-ping opacity-30 shadow-[0_0_10px_white]"></div>
            <div className="absolute bottom-[15%] right-[15%] w-2.5 h-2.5 bg-accent rounded-full opacity-50 shadow-[0_0_12px_#00f0ff] animate-float-fast"></div>
        </div>
    );
};

export default Background;