import React, { useState } from 'react';
import Client from '../components/Client';
import Editor from '@monaco-editor/react';
import Split from 'react-split';
import { useParams, useLocation, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditorPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // ✨ UPDATE 1: Fallback Mechanism
    // Agar location.state mein username nahi mila (refresh karne par), 
    // toh localStorage se utha lo.
    const username = location.state?.username || localStorage.getItem('savedUsername');

    const [clients, setClients] = useState([
        { socketId: 1, username: 'Ashutosh A' },
        { socketId: 2, username: 'John Doe' },
    ]);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        // ✨ UPDATE 2: Leave karte waqt safai
        localStorage.removeItem('savedUsername');
        navigate('/');
    }

    // ✨ UPDATE 3: Better Protection
    // Agar username kahin bhi nahi mila, tabhi wapas bhejo
    if (!username) {
        return <Navigate to="/" />;
    }

    return (
        <Split
            className="mainWrap"
            sizes={[20, 80]}
            minSize={200}
            gutterSize={10}
            direction="horizontal"
            cursor="col-resize"
        >
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img className="logoImage" src="/code-sync.png" alt="logo" />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client 
                                key={client.socketId} 
                                username={client.username} 
                            />
                        ))}
                    </div>
                </div>
                <button className="btn copyBtn" onClick={copyRoomId}>
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
            </div>

            <div className="editorWrap">
                <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    defaultValue="// Code Sync: Start coding here..."
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 20,
                    }}
                />
            </div>
        </Split>
    );
};

export default EditorPage;