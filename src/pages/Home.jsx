import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [isCreatedByMe, setIsCreatedByMe] = useState(false);
    
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [storedUser, setStoredUser] = useState('');

    // ✨ TYPING ANIMATION STATE
    const [typingText, setTypingText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const fullText = "Code. Sync. Ship.";
    const typingSpeed = 150; // Typing speed (ms)
    const deletingSpeed = 100; // Backspace speed (ms)
    const pauseTime = 2000; // Pause before deleting (ms)

    // ✨ TYPING EFFECT LOGIC
    useEffect(() => {
        let timer;
        const handleTyping = () => {
            if (!isDeleting) {
                // Typing...
                if (typingText.length < fullText.length) {
                    setTypingText(fullText.slice(0, typingText.length + 1));
                    timer = setTimeout(handleTyping, typingSpeed);
                } else {
                    // Finished typing, wait before deleting
                    timer = setTimeout(() => {
                        setIsDeleting(true);
                        handleTyping();
                    }, pauseTime);
                }
            } else {
                // Deleting...
                if (typingText.length > 0) {
                    setTypingText(fullText.slice(0, typingText.length - 1));
                    timer = setTimeout(handleTyping, deletingSpeed);
                } else {
                    // Finished deleting, start typing again
                    setIsDeleting(false);
                    timer = setTimeout(handleTyping, typingSpeed);
                }
            }
        };

        // Start the loop
        timer = setTimeout(handleTyping, typingSpeed);

        return () => clearTimeout(timer);
    }, [typingText, isDeleting]); // Dependencies ensure loop continues

    useEffect(() => {
        const user = localStorage.getItem('username');
        if (user) {
            setIsAuthenticated(true);
            setStoredUser(user);
            setUsername(user); 
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setStoredUser('');
        setUsername('');
        toast.success("Logged out successfully");
        navigate('/login');
    };

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidv4();
        setRoomId(id);
        setIsCreatedByMe(true);
        toast.success('Created a new room');
    };

    const joinRoom = async () => {
        if (!roomId || !username) {
            toast.error('ROOM ID & username is required');
            return;
        }

        if (!isCreatedByMe) {
            try {
                const response = await fetch(`http://localhost:5000/rooms/${roomId}`); 
                const data = await response.json();

                if (!data.exists) {
                    toast.error("Room ID does not exist! Create a new one.");
                    return; 
                }
            } catch (err) {
                console.log(err);
                toast.error("Could not verify Room ID.");
                return;
            }
        }

        navigate(`/editor/${roomId}`, {
            state: { username },
        });
    };

    const handleInputEnter = (e) => {
        if (e.key === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            
            {/* TOP NAVIGATION BAR */}
            <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-30">
                <div className="hidden md:flex items-center gap-2">
                     <img src="/code-sync.png" alt="logo" className="h-8 drop-shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
                </div>
                
                <div className="flex gap-4 ml-auto">
                    {!isAuthenticated ? (
                        <>
                            <Link to="/login">
                                <button className="px-5 py-2 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-gray-600">
                                    Login
                                </button>
                            </Link>
                            <Link to="/signup">
                                <button className="px-5 py-2 rounded-lg text-xs font-bold bg-accent text-black hover:bg-accentHover shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all transform hover:scale-105">
                                    Sign Up
                                </button>
                            </Link>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <span className="text-gray-400 text-xs font-mono hidden sm:inline">Hi, <span className="text-accent font-bold">{storedUser}</span></span>
                            <button 
                                onClick={logout}
                                className="px-5 py-2 rounded-lg text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* MAIN SPLIT CARD */}
            <div className="bg-[#0a0a0a] rounded-3xl shadow-2xl flex max-w-4xl w-full overflow-hidden border border-gray-800 min-h-[550px] relative z-20 animate-in fade-in zoom-in duration-300">
                
                {/* LEFT SIDE: FORM SECTION */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
                    
                    <div className="absolute top-6 left-6 flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>

                    <div className="mb-8 mt-4">
                        <h4 className="text-accent font-bold text-xs uppercase tracking-wider mb-2">Real-time Collaboration</h4>
                        <h1 className="text-4xl font-extrabold text-white mb-2">Join a Room</h1>
                        <p className="text-gray-500 text-sm">Enter your Room ID to start coding together.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Room ID</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Paste ID here"
                                    className="w-full bg-black border border-gray-800 text-white p-4 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder-gray-700 font-mono"
                                    value={roomId}
                                    onChange={(e) => {
                                        setRoomId(e.target.value);
                                        setIsCreatedByMe(false);
                                    }}
                                    onKeyUp={handleInputEnter}
                                />
                                <span className="absolute right-4 top-4 text-gray-600">#</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Username</label>
                            <input 
                                type="text" 
                                placeholder="Your Name"
                                className="w-full bg-black border border-gray-800 text-white p-4 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder-gray-700"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyUp={handleInputEnter}
                            />
                        </div>

                        <button 
                            onClick={joinRoom}
                            className="mt-2 bg-gradient-to-r from-accent to-purple-600 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span>Join Room</span> <span>🚀</span>
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <span className="text-gray-500 text-sm">Don't have an invite code?</span>
                        <br/>
                        <button 
                            onClick={createNewRoom} 
                            className="text-accent font-bold hover:underline mt-1 text-sm transition-all hover:text-white"
                        >
                            Create a new room
                        </button>
                    </div>
                </div>

                {/* RIGHT SIDE: ANIMATED TYPING SECTION */}
                <div className="hidden md:flex w-1/2 bg-[#050505] relative items-center justify-center overflow-hidden border-l border-gray-800">
                    
                    <div className="absolute inset-0 opacity-20" 
                        style={{ 
                            backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', 
                            backgroundSize: '30px 30px' 
                        }}>
                    </div>

                    <div className="absolute top-10 left-10 w-24 h-24 bg-green-500 rounded-full blur-[60px] opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-600 rounded-full blur-[60px] opacity-20 animate-pulse"></div>

                    <div className="relative z-10 flex flex-col items-center text-center p-10">
                        <div className="w-24 h-24 mb-6 bg-gradient-to-br from-gray-800 to-black border border-gray-700 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500 group">
                            <span className="text-5xl group-hover:scale-110 transition-transform">💻</span>
                        </div>
                        
                        {/* ✨ HERE IS THE TYPING EFFECT */}
                        <h2 className="text-3xl font-bold text-white mb-3 min-h-[40px]">
                            {typingText}
                            {/* Blinking Cursor */}
                            <span className="text-accent animate-pulse">|</span>
                        </h2>

                        <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                            Share the Room ID with your friends and start coding in real-time with instant sync.
                        </p>
                        
                        <div className="mt-8 flex gap-2">
                             <span className="bg-gray-900 border border-gray-700 text-gray-300 text-[10px] px-3 py-1 rounded-full font-mono">JS</span>
                             <span className="bg-gray-900 border border-gray-700 text-gray-300 text-[10px] px-3 py-1 rounded-full font-mono">C++</span>
                             <span className="bg-gray-900 border border-gray-700 text-gray-300 text-[10px] px-3 py-1 rounded-full font-mono">Python</span>
                        </div>
                    </div>
                </div>

            </div>
            
            <footer className="fixed bottom-4 text-gray-700 text-[10px] tracking-widest uppercase z-10">
                Built with 💜 by Ashutosh
            </footer>
        </div>
    );
};

export default Home;