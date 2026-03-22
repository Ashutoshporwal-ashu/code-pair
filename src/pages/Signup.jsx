import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Background from '../components/Background';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const [signupText, setSignupText] = useState('');
    const [signupDeleting, setSignupDeleting] = useState(false);
    const fullSignupText = "Code at Lightning Speed";
    
    const signupTypingSpeed = 120;
    const signupDeletingSpeed = 70;
    const signupPauseTime = 2500;

    useEffect(() => {
        let signupTimer;
        const handleSignupTyping = () => {
            if (!signupDeleting) {
                if (signupText.length < fullSignupText.length) {
                    setSignupText(fullSignupText.slice(0, signupText.length + 1));
                    signupTimer = setTimeout(handleSignupTyping, signupTypingSpeed);
                } else {
                    signupTimer = setTimeout(() => {
                        setSignupDeleting(true);
                        handleSignupTyping();
                    }, signupPauseTime);
                }
            } else {
                if (signupText.length > 0) {
                    setSignupText(fullSignupText.slice(0, signupText.length - 1));
                    signupTimer = setTimeout(handleSignupTyping, signupDeletingSpeed);
                } else {
                    setSignupDeleting(false);
                    signupTimer = setTimeout(handleSignupTyping, signupTypingSpeed);
                }
            }
        };

        signupTimer = setTimeout(handleSignupTyping, signupTypingSpeed);
        return () => clearTimeout(signupTimer);
    }, [signupText, signupDeleting]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = (e) => {
        e.preventDefault();
        
        if (!formData.username || !formData.email || !formData.password) {
            toast.error('All fields are required!');
            return;
        }

        const users = JSON.parse(localStorage.getItem('codeSync_users')) || [];
        const userExists = users.some(u => u.email === formData.email);

        if (userExists) {
            toast.error('Email is already registered! Please Login. ⚠️');
            return;
        }

        users.push(formData);
        localStorage.setItem('codeSync_users', JSON.stringify(users));

        toast.success('Account created successfully! Please Log In. 🎉');
        navigate('/login');
    };

    const handleSocialAuth = (provider) => {
        toast.success(`${provider} authentication coming soon!`);
    };

    return (
        /* ✨ FIX 1: overflow-hidden ki jagah overflow-y-auto aur py-10 lagaya taaki scroll ho sake agar screen choti ho */
        <div className="min-h-screen bg-[#020202] flex items-center justify-center py-10 px-4 relative overflow-y-auto overflow-x-hidden selection:bg-purple-500/30">
            <Background />
            
            {/* ✨ FIX 2: min-h-[600px] hata diya taaki card automatic apni height adjust kare */}
            <div className="bg-[#0a0a0a] rounded-3xl shadow-2xl flex flex-row-reverse max-w-4xl w-full border border-gray-800 animate-in fade-in zoom-in duration-300 relative z-10 my-auto">
                
                {/* 📝 RIGHT SIDE: FORM (Spacing reduce ki gayi hai) */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center relative z-10 bg-[#0a0a0a] rounded-r-3xl md:rounded-l-none rounded-l-3xl">
                    <div className="absolute top-6 right-6 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>

                    <div className="mb-5 mt-2">
                        <h4 className="text-purple-500 font-bold text-xs uppercase tracking-wider mb-1">Join Us</h4>
                        <h1 className="text-3xl font-extrabold text-white mb-1">Create Account</h1>
                        <p className="text-gray-500 text-xs">Sign up to start collaborating in real-time.</p>
                    </div>

                    {/* ✨ FIX 3: gap-4 ko gap-3 kar diya */}
                    <form onSubmit={handleSignup} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Username</label>
                            <input 
                                type="text" 
                                name="username"
                                placeholder="e.g. Ashutosh"
                                className="bg-black border border-gray-800 text-white p-2.5 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-700 text-sm"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address</label>
                            <input 
                                type="email" 
                                name="email"
                                placeholder="name@example.com"
                                className="bg-black border border-gray-800 text-white p-2.5 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-700 text-sm"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Password</label>
                            <input 
                                type="password" 
                                name="password"
                                placeholder="••••••••"
                                className="bg-black border border-gray-800 text-white p-2.5 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-700 text-sm"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex items-center gap-3 my-1 opacity-70">
                            <hr className="flex-1 border-gray-800" />
                            <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold">Or sign up with</span>
                            <hr className="flex-1 border-gray-800" />
                        </div>

                        {/* ✨ FIX 4: Social buttons ki padding p-3 se p-2 kar di */}
                        <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => handleSocialAuth('Google')}
                                className="flex-1 flex items-center justify-center gap-2 bg-black border border-gray-800 p-2 rounded-xl hover:bg-white/5 transition-all shadow-sm group"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 48 48">
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                                </svg>
                                <span className="text-white text-xs font-bold group-hover:text-gray-200">Google</span>
                            </button>

                            <button 
                                type="button" 
                                onClick={() => handleSocialAuth('LinkedIn')}
                                className="flex-1 flex items-center justify-center gap-2 bg-black border border-gray-800 p-2 rounded-xl hover:bg-white/5 transition-all shadow-sm group"
                            >
                                <svg className="w-4 h-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                                <span className="text-white text-xs font-bold group-hover:text-gray-200">LinkedIn</span>
                            </button>
                        </div>

                        {/* ✨ FIX 5: Main button ki height py-4 se py-3 ki */}
                        <button 
                            type="submit"
                            className="mt-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all transform hover:scale-[1.01] active:scale-95 text-sm"
                        >
                            Sign Up
                        </button>
                    </form>

                    <p className="mt-4 text-center text-gray-500 text-xs">
                        Already have an account? <Link to="/login" className="text-purple-400 font-bold hover:underline">Log In</Link>
                    </p>
                </div>

                {/* 🎨 LEFT SIDE: DESIGN */}
                <div className="hidden md:flex w-1/2 bg-[#050505] relative items-center justify-center overflow-hidden border-r border-gray-800 rounded-l-3xl">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#555 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    <div className="absolute top-20 right-20 w-32 h-32 bg-purple-600 rounded-full blur-[70px] opacity-30 animate-pulse"></div>

                    <div className="relative z-10 flex flex-col items-center text-center p-8">
                        <div className="w-20 h-20 mb-5 bg-gradient-to-tr from-gray-800 to-black border border-gray-800 rounded-2xl flex items-center justify-center shadow-2xl transform -rotate-6 hover:rotate-0 transition-all duration-500">
                            <span className="text-4xl text-purple-400">⚡</span>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-white mb-3 min-h-[35px]">
                            {signupText}
                            <span className="text-purple-400 animate-pulse">|</span>
                        </h2>

                        <p className="text-gray-400 text-xs max-w-xs">Compile and run your code instantly while sharing your screen with peers.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;