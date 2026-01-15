import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    // Ye data store karega
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    // Naya Room ID generate karne ka function
    const createNewRoom = (e) => {
        e.preventDefault(); // Page reload hone se rokega
        const id = uuidv4(); // Nayi unique ID banayi
        setRoomId(id); // Input box mein daal di
        toast.success('Created a new room'); // Notification dikhaya
    };

    // Join button dabane par kya hoga
    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('ROOM ID & Username is required');
            return;
        }

        // Editor page par le jao (Navigation)
        navigate(`/editor/${roomId}`, {
            state: {
                username, // Saath mein username bhi le jao
            },
        });
    };

    // Agar user "Enter" button dabaye tab bhi join ho jaye
    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div className="homePageWrapper">
            <div className="formWrapper">
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