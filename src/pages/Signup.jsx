import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    // ✨ SIGNUP TYPEWRITER STATE
    const [signupText, setSignupText] = useState('');
    const [signupDeleting, setSignupDeleting] = useState(false);
    const fullSignupText = "Code at Lightning Speed";
    
    // Animation Speeds (in ms)
    const signupTypingSpeed = 120; // Thoda slow typing
    const signupDeletingSpeed = 70; // Thoda fast deleting
    const signupPauseTime = 2500; // Pause before deleting

    // ✨ SIGNUP TYPEWRITER LOGIC
    useEffect(() => {
        let signupTimer;
        const handleSignupTyping = () => {
            if (!signupDeleting) {
                // Typing...
                if (signupText.length < fullSignupText.length) {
                    setSignupText(fullSignupText.slice(0, signupText.length + 1));
                    signupTimer = setTimeout(handleSignupTyping, signupTypingSpeed);
                } else {
                    // Finished typing, wait before deleting
                    signupTimer = setTimeout(() => {
                        setSignupDeleting(true);
                        handleSignupTyping();
                    }, signupPauseTime);
                }
            } else {
                // Deleting...
                if (signupText.length > 0) {
                    setSignupText(fullSignupText.slice(0, signupText.length - 1));
                    signupTimer = setTimeout(handleSignupTyping, signupDeletingSpeed);
                } else {
                    // Finished deleting, start typing again
                    setSignupDeleting(false);
                    signupTimer = setTimeout(handleSignupTyping, signupTypingSpeed);
                }
            }
        };

        // Start the loop
        signupTimer = setTimeout(handleSignupTyping, signupTypingSpeed);

        return () => clearTimeout(signupTimer);
    }, [signupText, signupDeleting]); // Infinite loop dependencies

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = (e) => {
        e.preventDefault();
        
        if (!formData.username || !formData.email || !formData.password) {
            toast.error('All fields are required!');
            return;
        }

        // Mini Database logic
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

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-purple-500/30">
            {/* Split layout: Login design logic flipped (Design Left, Form Right) */}
            <div className="bg-[#0a0a0a] rounded-3xl shadow-2xl flex flex-row-reverse max-w-4xl w-full overflow-hidden border border-gray-800 min-h-[600px] animate-in fade-in zoom-in duration-300">
                
                {/* 📝 RIGHT SIDE: FORM */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-10 bg-[#0a0a0a]">
                    <div className="absolute top-8 right-8 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>

                    <div className="mb-8">
                        <h4 className="text-purple-500 font-bold text-sm uppercase tracking-wider mb-2">Join Us</h4>
                        <h1 className="text-4xl font-extrabold text-white mb-2">Create Account</h1>
                        <p className="text-gray-500 text-sm">Sign up to start collaborating in real-time.</p>
                    </div>

                    <form onSubmit={handleSignup} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Username</label>
                            <input 
                                type="text" 
                                name="username"
                                placeholder="e.g. Ashutosh"
                                className="bg-black border border-gray-800 text-white p-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-700"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                            <input 
                                type="email" 
                                name="email"
                                placeholder="name@example.com"
                                className="bg-black border border-gray-800 text-white p-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-700"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
                            <input 
                                type="password" 
                                name="password"
                                placeholder="••••••••"
                                className="bg-black border border-gray-800 text-white p-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-700"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button 
                            type="submit"
                            className="mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all transform hover:scale-[1.02] active:scale-95"
                        >
                            Sign Up
                        </button>
                    </form>

                    <p className="mt-6 text-center text-gray-500 text-sm">
                        Already have an account? <Link to="/login" className="text-purple-400 font-bold hover:underline">Log In</Link>
                    </p>
                </div>

                {/* 🎨 LEFT SIDE: DESIGN (ANIMATED TYPEWRITER) */}
                <div className="hidden md:flex w-1/2 bg-[#050505] relative items-center justify-center overflow-hidden border-r border-gray-800">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#555 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    <div className="absolute top-20 right-20 w-32 h-32 bg-purple-600 rounded-full blur-[70px] opacity-30 animate-pulse"></div>

                    <div className="relative z-10 flex flex-col items-center text-center p-10">
                        <div className="w-24 h-24 mb-6 bg-gradient-to-tr from-gray-800 to-black border border-gray-800 rounded-2xl flex items-center justify-center shadow-2xl transform -rotate-6 hover:rotate-0 transition-all duration-500">
                            <span className="text-5xl text-purple-400">⚡</span>
                        </div>
                        
                        {/* ✨ HERE IS THE TYPING EFFECT */}
                        <h2 className="text-3xl font-bold text-white mb-4 min-h-[40px]">
                            {signupText}
                            {/* Blinking Cursor */}
                            <span className="text-purple-400 animate-pulse">|</span>
                        </h2>

                        <p className="text-gray-400 text-sm">Compile and run your code instantly while sharing your screen with peers.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;