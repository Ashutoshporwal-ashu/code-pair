import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Background from '../components/Background';
import { auth, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';

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
    
    useEffect(() => {
        let signupTimer;
        const handleSignupTyping = () => {
            if (!signupDeleting) {
                if (signupText.length < fullSignupText.length) {
                    setSignupText(fullSignupText.slice(0, signupText.length + 1));
                    signupTimer = setTimeout(handleSignupTyping, 120);
                } else {
                    signupTimer = setTimeout(() => {
                        setSignupDeleting(true);
                        handleSignupTyping();
                    }, 2500);
                }
            } else {
                if (signupText.length > 0) {
                    setSignupText(fullSignupText.slice(0, signupText.length - 1));
                    signupTimer = setTimeout(handleSignupTyping, 70);
                } else {
                    setSignupDeleting(false);
                    signupTimer = setTimeout(handleSignupTyping, 120);
                }
            }
        };

        signupTimer = setTimeout(handleSignupTyping, 120);
        return () => clearTimeout(signupTimer);
    }, [signupText, signupDeleting]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        
        if (!formData.username || !formData.email || !formData.password) {
            toast.error('All fields are required!');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            
            await updateProfile(userCredential.user, {
                displayName: formData.username
            });

            localStorage.setItem('username', formData.username);
            localStorage.setItem('token', userCredential.user.accessToken);
            
            toast.success('Account created successfully! 🎉');
            navigate('/'); 
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                toast.error('Email is already registered! Please Login. ⚠️');
            } else if (error.code === 'auth/weak-password') {
                toast.error('Password should be at least 6 characters. 🔒');
            } else {
                toast.error(error.message);
            }
        }
    };

    const handleGoogleAuth = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            localStorage.setItem('username', user.displayName || 'Google User');
            localStorage.setItem('token', user.accessToken);
            
            toast.success(`Welcome, ${user.displayName}! 🚀`);
            navigate('/');
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
                toast.error("Google Sign-In Failed! 🚫");
                console.error(error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 relative overflow-y-auto overflow-x-hidden selection:bg-purple-500/30">
            <Background />
            
            <div className="bg-[#0a0a0a] rounded-2xl shadow-2xl flex flex-col md:flex-row-reverse max-w-4xl w-full border border-gray-800 animate-in fade-in zoom-in duration-300 relative z-10 m-auto">
                
                {/* 📝 FORM SIDE */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center relative z-10 bg-[#0a0a0a] rounded-2xl md:rounded-l-none text-left items-start">
                    <div className="absolute top-5 right-5 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    </div>

                    <div className="mb-4 mt-2 w-full text-left">
                        <h4 className="text-purple-500 font-bold text-[10px] uppercase tracking-wider mb-1">Join Us</h4>
                        <h1 className="text-2xl font-extrabold text-white mb-1">Create Account</h1>
                        <p className="text-gray-500 text-xs">Sign up to start collaborating.</p>
                    </div>

                    <form onSubmit={handleSignup} className="flex flex-col gap-3 w-full text-left">
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Username</label>
                            <input 
                                type="text" 
                                name="username"
                                placeholder="e.g. Ashutosh"
                                className="w-full bg-black border border-gray-800 text-white p-2.5 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-700 text-sm"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Email Address</label>
                            <input 
                                type="email" 
                                name="email"
                                placeholder="name@example.com"
                                className="w-full bg-black border border-gray-800 text-white p-2.5 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-700 text-sm"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Password</label>
                            <input 
                                type="password" 
                                name="password"
                                placeholder="••••••••"
                                className="w-full bg-black border border-gray-800 text-white p-2.5 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-700 text-sm"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button 
                            type="submit"
                            className="mt-1 w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all transform hover:scale-[1.01] active:scale-95 text-sm"
                        >
                            Sign Up
                        </button>

                        <div className="flex items-center gap-3 my-0.5 opacity-70 w-full">
                            <hr className="flex-1 border-gray-800" />
                            <span className="text-gray-500 text-[9px] uppercase tracking-widest font-semibold">OR</span>
                            <hr className="flex-1 border-gray-800" />
                        </div>

                        <button 
                            type="button" 
                            onClick={handleGoogleAuth}
                            className="w-full flex items-center justify-center gap-2 bg-[#111] border border-gray-800 p-2.5 rounded-xl hover:bg-white/5 transition-all shadow-sm group"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                            </svg>
                            <span className="text-white text-xs font-bold group-hover:text-gray-200">Continue with Google</span>
                        </button>
                    </form>

                    <p className="mt-4 text-center text-gray-500 text-xs w-full">
                        Already have an account? <Link to="/login" className="text-purple-400 font-bold hover:underline">Log In</Link>
                    </p>
                </div>

                {/* 🎨 DESIGN SIDE */}
                <div className="hidden md:flex w-1/2 bg-[#050505] relative items-center justify-center overflow-hidden border-r border-gray-800 rounded-l-2xl">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#555 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    <div className="absolute top-10 right-10 w-24 h-24 bg-purple-600 rounded-full blur-[60px] opacity-30 animate-pulse"></div>

                    <div className="relative z-10 flex flex-col items-center text-center p-6">
                        <div className="w-16 h-16 mb-4 bg-gradient-to-tr from-gray-800 to-black border border-gray-800 rounded-2xl flex items-center justify-center shadow-2xl transform -rotate-6 hover:rotate-0 transition-all duration-500">
                            <span className="text-3xl text-purple-400">⚡</span>
                        </div>
                        
                        <h2 className="text-xl font-bold text-white mb-2 min-h-[30px]">
                            {signupText}
                            <span className="text-purple-400 animate-pulse">|</span>
                        </h2>

                        <p className="text-gray-400 text-[11px] max-w-xs">Compile and run your code instantly while sharing your screen with peers.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;