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
    const isChatOpenRef = useRef(false); 

    const location = useLocation();
    const { roomId } = useParams();
    const navigate = useNavigate();

    // States
    const [clients, setClients] = useState([]);
    const [language, setLanguage] = useState('javascript');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    
    // UI States
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // ✨ FIX: Mobile Detection
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const username = location.state?.username || localStorage.getItem('savedUsername');

    const LANGUAGE_VERSIONS = {
        javascript: "18.15.0",
        python: "3.10.0",
        java: "15.0.2",
        cpp: "10.2.0",
        c: "10.2.0",
    };

    // ✨ Screen Resize Listener
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleChat = () => {
        setIsChatOpen((prev) => {
            const newState = !prev;
            isChatOpenRef.current = newState;
            if (newState) {
                setUnreadCount(0);
            }
            return newState;
        });
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    }

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

            socketRef.current.on(ACTIONS.RECEIVE_MESSAGE, ({ username: sender, message, timestamp }) => {
                setMessages((prev) => [...prev, { username: sender, message, timestamp }]);
                
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

    // ✨ Component for Sidebar (Reused in Desktop Split & Mobile Menu)
    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                <div className="flex justify-center mb-6 border-b border-gray-700 pb-4">
                    <img className="h-16 hover:scale-110 transition-transform" src="/code-sync.png" alt="logo" />
                </div>
                <h3 className="font-bold text-gray-400 mb-4 uppercase tracking-wider text-sm">Connected Users</h3>
                <div className="grid grid-cols-3 gap-3">
                    {clients.map((client) => (
                        <Client key={client.socketId} username={client.username} />
                    ))}
                </div>
            </div>
            <div className="p-4 flex flex-col gap-3 border-t border-gray-800 bg-gray-900">
                <button className="bg-gray-700 text-white py-2 px-4 rounded-md font-bold hover:bg-gray-600 hover:text-accent transition-all shadow-md" onClick={copyRoomId}>
                    Copy ROOM ID
                </button>
                <button className="bg-red-500 text-white py-2 px-4 rounded-md font-bold hover:bg-red-600 transition-all shadow-md" onClick={leaveRoom}>
                    Leave Room
                </button>
            </div>
        </div>
    );

    // ✨ Component for Editor Area (Right Side)
    const EditorArea = (
        <div className="flex flex-col h-full bg-dark w-full">
            <Split
                className="h-full flex flex-col"
                sizes={[75, 25]}
                minSize={100}
                gutterSize={8}
                direction="vertical"
                cursor="row-resize"
            >
                {/* EDITOR TOP SECTION */}
                <div className="flex flex-col h-full relative">
                    <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700">
                        <div className="flex items-center gap-4">
                            {/* Hamburger only on Mobile */}
                            {isMobile && (
                                <button className="p-2 rounded-md hover:bg-gray-700 text-white" onClick={toggleMobileMenu}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    </svg>
                                </button>
                            )}
                            <span className="text-accent font-bold text-lg hidden sm:inline">Code Editor</span>
                        </div>
                        <div className="flex gap-2 sm:gap-4">
                            <select 
                                className="bg-gray-700 text-white px-2 sm:px-3 py-1.5 rounded-md outline-none border border-gray-600 focus:border-accent transition-all text-xs sm:text-sm"
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option value="javascript">JS</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                            </select>
                            <button 
                                className={`px-3 sm:px-6 py-1.5 rounded-md font-bold transition-all shadow-lg flex items-center gap-2 text-xs sm:text-sm ${isRunning ? 'bg-gray-500 cursor-not-allowed' : 'bg-accent text-black hover:bg-accentHover hover:scale-105'}`}
                                onClick={runCode}
                                disabled={isRunning}
                            >
                                {isRunning ? 'Run...' : 'Run ▶'}
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            language={language}
                            defaultValue="// Code Sync: Start coding here..."
                            theme="vs-dark"
                            onMount={(editor) => { codeRef.current = editor; }}
                            onChange={(value) => {
                                if (isIncomingChange.current) return;
                                socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code: value });
                            }}
                            options={{ minimap: { enabled: false }, fontSize: 16, padding: { top: 20 }, fontFamily: 'Fira Code, monospace' }}
                        />
                    </div>
                </div>

                {/* OUTPUT BOTTOM SECTION */}
                <div className="bg-darker p-4 flex gap-4 h-full border-t-2 border-gray-700">
                    <div className="flex-1 flex flex-col">
                        <label className="text-gray-400 font-bold mb-2 text-sm">Input</label>
                        <textarea 
                            className="flex-1 bg-gray-800 text-white p-3 rounded-md border border-gray-700 focus:outline-none focus:border-accent resize-none font-mono text-sm"
                            placeholder="Stdin"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        ></textarea>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label className="text-gray-400 font-bold mb-2 text-sm">Output</label>
                        <textarea 
                            className={`flex-1 bg-gray-800 text-white p-3 rounded-md border border-gray-700 focus:outline-none resize-none font-mono text-sm ${output.includes('Error') ? 'text-red-400 border-red-500' : 'text-green-400'}`}
                            readOnly 
                            placeholder="Result..."
                            value={output}
                        ></textarea>
                    </div>
                </div>
            </Split>
        </div>
    );

    return (
        <div className="h-screen bg-gray-900 text-white flex overflow-hidden">
            {/* ✨ LOGIC: Agar Mobile hai toh sirf Editor dikhao, Split mat karo */}
            {isMobile ? (
                <>
                    {EditorArea}
                </>
            ) : (
                <Split
                    className="flex w-full"
                    sizes={[18, 82]}
                    minSize={250}
                    gutterSize={8}
                    gutterAlign="center"
                    cursor="col-resize"
                >
                    <div className="bg-darker flex flex-col h-full border-r border-gray-800 shadow-xl z-10">
                        <SidebarContent />
                    </div>
                    {EditorArea}
                </Split>
            )}

            {/* ✨ MOBILE MENU OVERLAY */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 md:hidden flex justify-start">
                    <div className="bg-darker w-3/4 max-w-xs h-full p-4 flex flex-col shadow-2xl animate-slide-in border-r border-gray-700">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                             <h3 className="font-bold text-accent text-lg">Menu</h3>
                             <button onClick={toggleMobileMenu} className="text-gray-400 hover:text-white text-2xl">✕</button>
                        </div>
                        {/* Reuse Sidebar Content Logic */}
                        <div className="flex-1 overflow-y-auto">
                            <h3 className="font-bold text-gray-400 mb-4 uppercase tracking-wider text-xs">Connected Users</h3>
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {clients.map((client) => (
                                    <Client key={client.socketId} username={client.username} />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                             <button className="bg-gray-700 text-white py-3 px-4 rounded-md font-bold hover:bg-gray-600 hover:text-accent transition-all shadow-md" onClick={() => { copyRoomId(); toggleMobileMenu(); }}>
                                Copy ROOM ID
                            </button>
                            <button className="bg-red-500 text-white py-3 px-4 rounded-md font-bold hover:bg-red-600 transition-all shadow-md" onClick={leaveRoom}>
                                Leave Room
                            </button>
                        </div>
                    </div>
                    <div className="flex-1" onClick={toggleMobileMenu}></div>
                </div>
            )}

            {/* CHAT UI */}
            <button 
                className={`fixed bottom-8 right-8 z-40 p-3 sm:p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 flex items-center justify-center ${isChatOpen ? 'bg-red-500 rotate-90' : 'bg-accent'}`}
                onClick={toggleChat}
            >
                {unreadCount > 0 && !isChatOpen && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                        {unreadCount}
                    </span>
                )}
                <span className="text-xl sm:text-2xl font-bold text-black">{isChatOpen ? '✕' : '💬'}</span>
            </button>

            {isChatOpen && (
                <div className="fixed bottom-24 right-4 sm:right-8 w-[90%] sm:w-80 h-[60%] sm:h-96 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl flex flex-col overflow-hidden z-40">
                    <div className="bg-gray-900 p-3 border-b border-gray-700 flex justify-between items-center">
                        <span className="text-accent font-bold">Group Chat</span>
                        <span className="text-xs text-gray-400">● Live</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar bg-dark">
                        {messages.map((msg, index) => (
                            <div key={index} className={`max-w-[85%] p-2 rounded-lg text-sm break-words ${msg.username === username ? 'bg-accent text-gray-900 self-end rounded-br-none' : 'bg-gray-700 text-white self-start rounded-bl-none'}`}>
                                <span className="text-[10px] font-bold block opacity-70 mb-1">{msg.username}</span>
                                {msg.message}
                            </div>
                        ))}
                    </div>
                    <div className="p-3 bg-gray-900 border-t border-gray-700 flex gap-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-800 text-white p-2 rounded-md outline-none border border-gray-700 focus:border-accent text-sm"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyUp={handleEnterKey}
                        />
                        <button onClick={sendMessage} className="bg-accent text-black p-2 rounded-md font-bold hover:bg-accentHover">➤</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditorPage;