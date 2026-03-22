import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Background from '../components/Background';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [codeText, setCodeText] = useState('');
    const fullCode = "const data = await connect();\n// Connection established.\nwhile (true) {\n  send(JSON.stringify({msg: 'sync'}));\n  // ...syncing...\n}";
    
    useEffect(() => {
        let i = 0;
        let isDeleting = false;
        let timer;
        
        const typeCode = () => {
            if (!isDeleting) {
                if (i <= fullCode.length) {
                    setCodeText(fullCode.slice(0, i));
                    i++;
                    timer = setTimeout(typeCode, 50);
                } else {
                    isDeleting = true;
                    timer = setTimeout(typeCode, 3000);
                }
            } else {
                if (i >= 0) {
                    setCodeText(fullCode.slice(0, i));
                    i -= 2;
                    timer = setTimeout(typeCode, 20);
                } else {
                    isDeleting = false;
                    i = 0;
                    timer = setTimeout(typeCode, 500);
                }
            }
        };

        timer = setTimeout(typeCode, 50);
        return () => clearTimeout(timer);
    }, []);

    const highlightSyntax = (text) => {
        if (!text) return '';
        return text
            .replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/(const|await|while|true)/g, '<span class="text-purple-400">$1</span>')
            .replace(/(connect|send|JSON|stringify)/g, '<span class="text-blue-400">$1</span>')
            .replace(/('sync')/g, '<span class="text-green-400">$1</span>')
            .replace(/(msg)/g, '<span class="text-cyan-400">$1</span>')
            .replace(/(\/\/.*)/g, '<span class="text-gray-500">$1</span>');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password) {
            toast.error('All fields are required!');
            return;
        }

        const users = JSON.parse(localStorage.getItem('codeSync_users')) || [];
        const foundUser = users.find(
            (u) => u.email === formData.email && u.password === formData.password
        );

        if (foundUser) {
            localStorage.setItem('username', foundUser.username);
            localStorage.setItem('token', 'fake-jwt-token'); 
            
            toast.success(`Welcome back, ${foundUser.username}! 🚀`);
            navigate('/'); 
        } else {
            toast.error('Invalid Email or Password! 🚫');
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 py-10 relative overflow-y-auto overflow-x-hidden selection:bg-accent/30 selection:text-white">
            
            <Background />

            <div className="bg-[#0a0a0a] rounded-3xl shadow-2xl flex flex-col md:flex-row max-w-4xl w-full overflow-hidden border border-gray-800 min-h-[600px] animate-in fade-in zoom-in duration-300 relative z-10 my-auto">
                
                {/* 📝 LEFT SIDE: FORM */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative items-start">
                    <div className="absolute top-8 left-8 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>

                    {/* ✨ FIX: Added text-left to align the headers properly */}
                    <div className="mb-10 w-full text-left mt-4">
                        <h4 className="text-accent font-bold text-sm uppercase tracking-wider mb-2">Code Sync</h4>
                        <h1 className="text-4xl font-extrabold text-white mb-2">Welcome Back!</h1>
                        <p className="text-gray-500 text-sm">Enter your credentials to access your workspace.</p>
                    </div>

                    {/* ✨ FIX: Added text-left and w-full to the form and its children */}
                    <form onSubmit={handleLogin} className="flex flex-col gap-5 w-full text-left">
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Email Address</label>
                            <input 
                                type="email" 
                                name="email"
                                placeholder="name@example.com"
                                className="w-full bg-black border border-gray-800 text-white p-4 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder-gray-700 font-mono text-sm"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center w-full">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Password</label>
                                <a href="#" className="text-[10px] text-accent hover:underline font-bold text-right">Forgot Password?</a>
                            </div>
                            <input 
                                type="password" 
                                name="password"
                                placeholder="••••••••"
                                className="w-full bg-black border border-gray-800 text-white p-4 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder-gray-700 font-mono text-sm"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button 
                            type="submit"
                            className="mt-4 w-full bg-gradient-to-r from-accent to-purple-500 text-black font-extrabold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all transform hover:scale-[1.02] active:scale-95"
                        >
                            Log In
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-500 text-sm w-full">
                        Don't have an account? <Link to="/signup" className="text-accent font-bold hover:underline">Register</Link>
                    </p>
                </div>

                {/* 🎨 RIGHT SIDE: DESIGN */}
                <div className="hidden md:flex w-1/2 bg-[#050505] relative items-center justify-center overflow-hidden border-l border-gray-800">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    <div className="absolute top-10 right-10 w-24 h-24 bg-purple-600 rounded-full blur-[60px] opacity-30 animate-pulse"></div>
                    <div className="absolute bottom-10 left-10 w-32 h-32 bg-accent rounded-full blur-[70px] opacity-20 animate-pulse"></div>

                    <div className="relative z-10 flex flex-col items-center text-center p-10 w-full">
                        {/* ✨ NEW PREMIUM CSS LOGO FOR THE CARD */}
                        <div className="w-16 h-16 bg-gradient-to-br from-accent to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(124,58,237,0.4)] mb-6 hover:scale-105 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8 text-black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="16 18 22 12 16 6"></polyline>
                                <polyline points="8 6 2 12 8 18"></polyline>
                            </svg>
                        </div>
                        
                        <h2 className="text-3xl font-bold text-white mb-4 tracking-wide">Join the Community</h2>
                        <p className="text-gray-400 text-sm mb-8">Collaborate, debug, and ship code faster with real-time sync.</p>

                        {/* ✨ DYNAMIC CODE BLOCK */}
                        <div className="bg-[#0a0a0a]/80 backdrop-blur-md p-5 rounded-xl border border-gray-800 font-mono text-xs text-left w-full max-w-sm shadow-2xl relative">
                            {/* Window controls styling */}
                            <div className="flex gap-1.5 mb-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                            </div>
                            
                            {/* Typed Code Container */}
                            <div className="text-gray-300 min-h-[90px] whitespace-pre-wrap leading-relaxed">
                                <span dangerouslySetInnerHTML={{ __html: highlightSyntax(codeText) }}></span>
                                <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-0.5 align-middle"></span>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;