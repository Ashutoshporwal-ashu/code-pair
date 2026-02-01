import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [isCreatedByMe, setIsCreatedByMe] = useState(false);

    // SQUARE PARTICLES LOGIC (Same as before)
    const particles = useMemo(() => {
        return Array.from({ length: 60 }).map((_, i) => ({
            id: i,
            size: Math.random() * 15 + 10 + 'px', 
            left: Math.random() * 100 + '%',
            duration: Math.random() * 20 + 5 + 's', 
            delay: Math.random() * 10 + 's',
            opacity: Math.random() * 0.7 + 0.3,
        }));
    }, []);

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
        <div className="relative flex items-center justify-center min-h-screen bg-black text-white overflow-hidden">
            
            {/* BACKGROUND GRID & PARTICLES */}
            <div className="bg-grid"></div>
            <div className="particles-container">
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="square-particle"
                        style={{
                            width: particle.size,
                            height: particle.size,
                            left: particle.left,
                            animationDuration: particle.duration,
                            animationDelay: particle.delay,
                            opacity: particle.opacity
                        }}
                    ></div>
                ))}
            </div>

            {/* ✨ GLASS LOGIN CARD (Transparency Reduced) */}
            {/* 👇 CHANGE: bg-gray-900/50 ko bg-gray-900/85 kiya, aur blur badhaya */}
            <div className="relative z-20 bg-gray-900/85 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/10">
                
                <div className="flex flex-col items-center mb-8">
                    <img 
                        className="h-20 mb-4 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]" 
                        src="/code-sync.png" 
                        alt="logo" 
                    />
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                        Code Sync
                    </h2>
                    <p className="text-gray-400 text-sm mt-2">Real-time collaboration for devs.</p>
                </div>

                <div className="flex flex-col gap-5">
                    
                    <div className="group">
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                            Room ID
                        </label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder-gray-600 font-mono"
                            placeholder="Paste ID here"
                            onChange={(e) => {
                                setRoomId(e.target.value);
                                setIsCreatedByMe(false);
                            }}
                            value={roomId}
                            onKeyUp={handleInputEnter}
                        />
                    </div>

                    <div className="group">
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder-gray-600"
                            placeholder="Your Name"
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
                            onKeyUp={handleInputEnter}
                        />
                    </div>

                    <button 
                        className="mt-4 w-full bg-gradient-to-r from-accent to-purple-600 text-white font-bold py-3 rounded-lg hover:from-accentHover hover:to-purple-700 transition-all shadow-lg shadow-purple-500/20 active:scale-95" 
                        onClick={joinRoom}
                    >
                        Join Room &nbsp; 🚀
                    </button>
                    
                    <div className="text-center mt-4">
                        <span className="text-gray-500 text-sm">No invite? &nbsp;</span>
                        <button 
                            onClick={createNewRoom} 
                            className="text-accent hover:text-white hover:underline font-semibold transition-colors text-sm"
                        >
                            Create new room
                        </button>
                    </div>
                </div>
            </div>
            
            <footer className="fixed bottom-6 text-gray-600 text-xs tracking-wider z-20">
                BUILT WITH 💜 BY <a href="https://github.com/Ashutoshporwal-ashu" target="_blank" rel="noreferrer" className="text-accent hover:text-white transition-colors">ASHUTOSH</a>
            </footer>
        </div>
    );
};

export default Home;