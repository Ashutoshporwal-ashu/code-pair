import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    
    // ✨ Flag: Pata lagane ke liye ki user ne khud room banaya ya nahi
    const [isCreatedByMe, setIsCreatedByMe] = useState(false);

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidv4();
        setRoomId(id);
        setIsCreatedByMe(true); // Maine banaya hai, toh valid hai
        toast.success('Created a new room');
    };

    const joinRoom = async () => {
        if (!roomId || !username) {
            toast.error('ROOM ID & username is required');
            return;
        }

        // ✨ CHECK: Agar maine khud room nahi banaya, toh server se pucho
        if (!isCreatedByMe) {
            try {
                // Server API Call (Port 5000) check karne ke liye
                const response = await fetch(`http://localhost:5000/rooms/${roomId}`); 
                const data = await response.json();

                if (!data.exists) {
                    toast.error("Room ID does not exist! Create a new one.");
                    return; // 🛑 Yahi rok do, aage mat jane do
                }
            } catch (err) {
                console.log(err);
                toast.error("Could not verify Room ID. Server down?");
                return;
            }
        }

        // Agar sab sahi hai, tabhi navigate karo
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
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <div className="bg-[#0a0a0a] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-[#1f1f1f]">
                <div className="flex flex-col items-center mb-8">
                    <img className="h-16 mb-4 drop-shadow-lg" src="/code-sync.png" alt="logo" />
                    <h2 className="text-2xl font-bold tracking-wide">Welcome Back!</h2>
                    <p className="text-gray-500 text-sm mt-1">Enter your details to start coding.</p>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider pl-1">Room ID</label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-lg bg-[#111111] border border-[#333] text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder-gray-600"
                            placeholder="e.g. 1234-5678"
                            onChange={(e) => {
                                setRoomId(e.target.value);
                                setIsCreatedByMe(false); // Agar user type kar raha hai, matlab naya nahi bana raha
                            }}
                            value={roomId}
                            onKeyUp={handleInputEnter}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider pl-1">Username</label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-lg bg-[#111111] border border-[#333] text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder-gray-600"
                            placeholder="e.g. Ashutosh"
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
                            onKeyUp={handleInputEnter}
                        />
                    </div>

                    <button 
                        className="mt-2 w-full bg-accent text-white font-bold py-3 rounded-lg hover:bg-accentHover transition-all shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_25px_rgba(139,92,246,0.7)]" 
                        onClick={joinRoom}
                    >
                        Join Room
                    </button>
                    
                    <span className="text-gray-500 text-center mt-4 text-sm">
                        No invite code? &nbsp;
                        <a onClick={createNewRoom} href="" className="text-accent hover:text-accentHover hover:underline font-semibold transition-colors">
                            Create new room
                        </a>
                    </span>
                </div>
            </div>
            
            <footer className="fixed bottom-6 text-gray-600 text-xs tracking-wider">
                BUILT WITH 💜 BY <a href="https://github.com/Ashutoshporwal-ashu" target="_blank" rel="noreferrer" className="text-accent hover:underline">ASHUTOSH</a>
            </footer>
        </div>
    );
};

export default Home;