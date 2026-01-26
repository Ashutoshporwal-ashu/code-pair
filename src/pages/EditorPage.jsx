import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import Client from '../components/Client';
import Editor from '@monaco-editor/react';
import Split from 'react-split';
import { initSocket } from '../socket';
import { ACTIONS } from '../Actions';
import {
    useParams,
    useLocation,
    useNavigate,
    Navigate,
} from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const isIncomingChange = useRef(false);
    // ✨ FIX: Chat Open status ko Ref mein bhi rakhenge taaki socket listener ko hamesha current value mile
    const isChatOpenRef = useRef(false); 

    const location = useLocation();
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [clients, setClients] = useState([]);
    const [language, setLanguage] = useState('javascript');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    
    // Chat States
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    // ✨ NEW: Unread Messages Counter
    const [unreadCount, setUnreadCount] = useState(0);

    const username = location.state?.username || localStorage.getItem('savedUsername');

    const LANGUAGE_VERSIONS = {
        javascript: "18.15.0",
        python: "3.10.0",
        java: "15.0.2",
        cpp: "10.2.0",
        c: "10.2.0",
    };

    // ✨ Toggle Function: Jab chat khule, counter 0 kar do
    const toggleChat = () => {
        setIsChatOpen((prev) => {
            const newState = !prev;
            isChatOpenRef.current = newState; // Ref update
            if (newState) {
                setUnreadCount(0); // Chat khuli, count reset
            }
            return newState;
        });
    };

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                navigate('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                const currentCode = codeRef.current.getValue();
                if (code !== currentCode) {
                    isIncomingChange.current = true;
                    codeRef.current.setValue(code);
                    isIncomingChange.current = false;
                }
            });

            socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} joined the room.`);
                    if (codeRef.current) {
                        socketRef.current.emit(ACTIONS.SYNC_CODE, {
                            code: codeRef.current.getValue(),
                            socketId,
                        });
                    }
                }
                setClients(clients);
            });

            // ✨ NOTIFICATION LOGIC
            socketRef.current.on(ACTIONS.RECEIVE_MESSAGE, ({ username: sender, message, timestamp }) => {
                setMessages((prev) => [...prev, { username: sender, message, timestamp }]);
                
                // Agar Chat BAND hai AUR message kisi aur ne bheja hai -> Notification Badhao
                if (!isChatOpenRef.current && sender !== username) {
                    setUnreadCount((prev) => prev + 1);
                }
            });

            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                toast.success(`${username} left the room.`);
                setClients((prev) => prev.filter((client) => client.socketId !== socketId));
            });
        };
        init();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current.off(ACTIONS.JOINED);
                socketRef.current.off(ACTIONS.DISCONNECTED);
                socketRef.current.off(ACTIONS.RECEIVE_MESSAGE);
            }
        };
    }, []);

    const sendMessage = () => {
        if (!newMessage.trim()) return;
        socketRef.current.emit(ACTIONS.SEND_MESSAGE, {
            roomId,
            message: newMessage,
            username,
        });
        setNewMessage('');
    };

    const handleEnterKey = (e) => {
        if (e.key === 'Enter') sendMessage();
    }

    const runCode = async () => {
        setIsRunning(true);
        setOutput('Running...');
        const sourceCode = codeRef.current.getValue();
        const payload = {
            language: language === 'cpp' ? 'c++' : language,
            version: LANGUAGE_VERSIONS[language],
            files: [{ content: sourceCode }],
            stdin: input,
        };
        try {
            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (result.run) setOutput(result.run.output);
            else setOutput('Error executing code');
        } catch (error) {
            setOutput('Failed to run code. Check internet connection.');
        } finally {
            setIsRunning(false);
        }
    };

    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
        }
    }

    const leaveRoom = () => {
        localStorage.removeItem('savedUsername');
        navigate('/');
    }

    if (!username) return <Navigate to="/" />;

    return (
        <div className="mainWrap">
            <Split className="split" sizes={[20, 80]} minSize={200} gutterSize={10} direction="horizontal" cursor="col-resize">
                <div className="aside">
                    <div className="asideInner">
                        <div className="logo">
                            <img className="logoImage" src="/code-sync.png" alt="logo" />
                        </div>
                        <h3>Connected</h3>
                        <div className="clientsList">
                            {clients.map((client) => (
                                <Client key={client.socketId} username={client.username} />
                            ))}
                        </div>
                    </div>
                    
                    <div className="aside-buttons">
                        <button className="btn copyBtn" onClick={copyRoomId}>Copy ROOM ID</button>
                        <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
                    </div>
                </div>

                <div className="editorWrap">
                    <Split className="split-vertical" sizes={[70, 30]} minSize={100} gutterSize={10} direction="vertical" cursor="row-resize">
                        <div className="editor-container">
                            <div className="editor-header">
                                <select className="language-dropdown" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                </select>
                                <button className="btn runBtn" onClick={runCode} disabled={isRunning}>
                                    {isRunning ? 'Running...' : 'Run ▶'}
                                </button>
                            </div>
                            <Editor
                                height="90%"
                                language={language}
                                defaultValue="// Code Sync: Start coding here..."
                                theme="vs-dark"
                                onMount={(editor) => { codeRef.current = editor; }}
                                onChange={(value) => {
                                    if (isIncomingChange.current) return;
                                    socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code: value });
                                }}
                                options={{ minimap: { enabled: false }, fontSize: 16 }}
                            />
                        </div>
                        <div className="output-container">
                            <div className="io-box">
                                <label>Input:</label>
                                <textarea className="input-area" placeholder="Enter input here" value={input} onChange={(e) => setInput(e.target.value)}></textarea>
                            </div>
                            <div className="io-box">
                                <label>Output:</label>
                                <textarea className="output-area" readOnly placeholder="Output will appear here..." value={output}></textarea>
                            </div>
                        </div>
                    </Split>
                </div>
            </Split>

            {/* ✨ Toggle Button with Badge */}
            <button 
                className={`chat-toggle-btn ${unreadCount > 0 ? 'shake-animation' : ''}`} 
                onClick={toggleChat}
            >
                {/* Agar Unread Count 0 se zyada hai, toh Badge dikhao */}
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                {isChatOpen ? '❌' : '💬 Chat'}
            </button>

            {isChatOpen && (
                <div className="chat-window-floating">
                    <div className="chat-header">Group Chat</div>
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-bubble ${msg.username === username ? 'my-message' : ''}`}>
                                <span className="msg-user">{msg.username}</span>
                                <p>{msg.message}</p>
                            </div>
                        ))}
                    </div>
                    <div className="chat-input-area">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyUp={handleEnterKey}
                        />
                        <button onClick={sendMessage} className="btn sendBtn">➤</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditorPage;