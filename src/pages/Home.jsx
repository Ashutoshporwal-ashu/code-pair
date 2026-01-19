import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidv4();
        setRoomId(id);
        toast.success('Created a new room');
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('ROOM ID & Username is required');
            return;
        }

        // ✨ UPDATE 1: Username ko Local Storage mein save kiya
        // Taki agar Editor page refresh ho, toh humein username yaad rahe
        localStorage.setItem('savedUsername', username);

        // Editor page par navigation
        navigate(`/editor/${roomId}`, {
            state: {
                username,
            },
        });
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };

    // ✨ UPDATE 2: Logout Function
    const logout = () => {
        localStorage.removeItem('savedUsername'); // Purana data saaf
        navigate('/login'); // Wapas login page par
        toast.success('Logged out successfully');
    }

    return (
        <div className="homePageWrapper">
            <div className="formWrapper">
                {/* Logout Button (Optional: Top right of card) */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                     <button 
                        onClick={logout} 
                        style={{ 
                            background: 'transparent', 
                            color: '#e74c3c', // Red color for logout
                            fontSize: '12px', 
                            fontWeight: 'bold',
                            padding: '0'
                        }}>
                        Logout
                     </button>
                </div>

                <img
                    className="homePageLogo"
                    src="/code-sync.png"
                    alt="code-sync-logo"
                />
                <h4 className="mainLabel">Paste invitation ROOM ID</h4>
                <div className="inputGroup">
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="ROOM ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="USERNAME"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                    <button className="btn joinBtn" onClick={joinRoom}>
                        Join
                    </button>
                    <span className="createInfo">
                        If you don't have an invite then create &nbsp;
                        <a href="" onClick={createNewRoom} className="createNewBtn">
                            new room
                        </a>
                    </span>
                </div>
            </div>
            <footer>
                <h4>
                    Built with 💛 by &nbsp;
                    <a href="https://github.com/Ashutoshporwal-ashu">Ashutosh</a>
                </h4>
            </footer>
        </div>
    );
};

export default Home;