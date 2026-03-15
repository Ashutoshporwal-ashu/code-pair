import { motion } from 'framer-motion';
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
    const [isFullScreen, setIsFullScreen] = useState(false);
    
    // Mobile Detection
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const username = location.state?.username || localStorage.getItem('savedUsername');

    // Isko replace kar do
    const LANGUAGE_VERSIONS = {
        javascript: "*",
        python: "*",
        java: "*",
        cpp: "*",
        c: "*",
    };

    // Full Screen Toggle
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                toast.error(`Error enabling full-screen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleChat = () => {
        setIsChatOpen((prev) => {
            const newState = !prev;
            isChatOpenRef.current = newState;
            if (newState) setUnreadCount(0);
            return newState;
        });
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

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
            const response = await fetch('/api/v2/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            
            // 1. Agar API server se koi specific error aaye (like version mismatch)
            if (result.message) {
                setOutput(`API Error: ${result.message}`);
                return;
            }

            // 2. Agar Compilation me error ho (jaise syntax error)
            if (result.compile && result.compile.code !== 0) {
                setOutput(`Compilation Error:\n${result.compile.output}`);
                return;
            }

            // 3. Agar code successfully run ho jaye (ya runtime error aaye)
            if (result.run) {
                setOutput(result.run.output);
            } else {
                setOutput('Unknown Error executing code');
            }
            
        } catch (error) {
            setOutput('Failed to run code. Check internet connection or API status.');
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

    // ✨ MODERN SIDEBAR COMPONENT
    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#050505] relative overflow-hidden border-r border-gray-800/50">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-32 bg-purple-600/10 blur-[50px] pointer-events-none"></div>

            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar relative z-10">
                <div className="flex justify-center mb-8 pb-6 border-b border-white/5 relative">
                    <img className="h-14 drop-shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:scale-105 transition-transform" src="/code-sync.png" alt="logo" />
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-accent text-lg">👥</span>
                    <h3 className="font-bold text-gray-300 uppercase tracking-widest text-[10px]">Connected Team</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {clients.map((client) => (
                        <div key={client.socketId} className="bg-white/5 border border-white/5 rounded-xl p-2 flex items-center gap-3 hover:bg-white/10 transition-colors">
                            <Client username={client.username} />
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="p-5 flex flex-col gap-3 relative z-10 bg-[#0a0a0a]/80 backdrop-blur-md border-t border-white/5">
                <button 
                    className="w-full bg-black border border-gray-700 text-gray-300 py-3 px-4 rounded-xl font-bold hover:border-accent hover:text-white hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all text-xs tracking-wider flex justify-center items-center gap-2" 
                    onClick={copyRoomId}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" /></svg>
                    COPY ID
                </button>
                <button 
                    className="w-full bg-red-500/10 border border-red-500/30 text-red-500 py-3 px-4 rounded-xl font-bold hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all text-xs tracking-wider flex justify-center items-center gap-2" 
                    onClick={leaveRoom}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                    SIGN OUT
                </button>
            </div>
        </div>
    );

    // ✨ MODERN EDITOR AREA
    const EditorArea = (
        <div className="flex flex-col h-full bg-black w-full relative">
            <Split
                className="h-full flex flex-col"
                sizes={[75, 25]}
                minSize={100}
                gutterSize={6}
                direction="vertical"
                cursor="row-resize"
            >
                {/* EDITOR TOP SECTION */}
                <div className="flex flex-col h-full relative">
                    
                    {/* TOP NAVIGATION BAR */}
                    <div className="flex justify-between items-center p-3 px-5 bg-[#0a0a0a] border-b border-gray-800">
                        <div className="flex items-center gap-3">
                            {isMobile && (
                                <button className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors" onClick={toggleMobileMenu}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                                </button>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-purple-500">💻</span>
                                <span className="text-gray-200 font-bold text-sm tracking-wide hidden sm:inline">Workspace</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {/* Full Screen Toggle */}
                            <button 
                                onClick={toggleFullScreen}
                                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                                className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                            >
                                {isFullScreen ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                                )}
                            </button>

                            {/* Language Selector */}
                            <div className="relative">
                                <select 
                                    className="appearance-none bg-[#111] text-gray-300 pl-4 pr-8 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-accent transition-all text-xs font-mono cursor-pointer hover:bg-[#1a1a1a]"
                                    value={language} 
                                    onChange={(e) => setLanguage(e.target.value)}
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                </select>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                            </div>

                            {/* Run Button */}
                            <button 
                                className={`px-5 py-2 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2 text-xs tracking-wide ${isRunning ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95'}`}
                                onClick={runCode}
                                disabled={isRunning}
                            >
                                {isRunning ? (
                                    <><span className="animate-spin text-lg">⚙️</span> Running...</>
                                ) : (
                                    <><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" /></svg> Run Code</>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {/* MONACO EDITOR */}
                    <div className="flex-1 overflow-hidden bg-black">
                        <Editor
                            height="100%"
                            language={language}
                            defaultValue="// Welcome to Code Sync!\n// Start typing to collaborate in real-time."
                            theme="vs-dark"
                            onMount={(editor) => { codeRef.current = editor; }}
                            onChange={(value) => {
                                if (isIncomingChange.current) return;
                                socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code: value });
                            }}
                            options={{ 
                                minimap: { enabled: false }, 
                                fontSize: 16, 
                                padding: { top: 24, bottom: 24 }, 
                                fontFamily: '"Fira Code", monospace', 
                                fontLigatures: true,
                                scrollBeyondLastLine: false,
                                smoothScrolling: true,
                                cursorBlinking: "smooth",
                                cursorSmoothCaretAnimation: true
                            }}
                        />
                    </div>
                </div>

                {/* OUTPUT BOTTOM SECTION (OLED Style) */}
                <div className="bg-[#050505] flex gap-4 h-full p-4 border-t border-gray-800">
                    
                    {/* Input Panel */}
                    <div className="flex-1 flex flex-col bg-[#0a0a0a] rounded-xl border border-gray-800 overflow-hidden relative group">
                        <div className="px-4 py-2 border-b border-gray-800 bg-[#111] flex items-center gap-2">
                            <span className="text-gray-500">⌨️</span>
                            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Input (Stdin)</span>
                        </div>
                        <textarea 
                            className="flex-1 bg-transparent text-gray-300 p-4 focus:outline-none resize-none font-mono text-sm placeholder-gray-700 custom-scrollbar"
                            placeholder="Type input here..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        ></textarea>
                        {/* Glow on focus/hover */}
                        <div className="absolute inset-0 pointer-events-none border border-transparent group-focus-within:border-accent/30 rounded-xl transition-colors"></div>
                    </div>

                    {/* Output Panel */}
                    <div className="flex-1 flex flex-col bg-[#0a0a0a] rounded-xl border border-gray-800 overflow-hidden relative group">
                         <div className="px-4 py-2 border-b border-gray-800 bg-[#111] flex items-center gap-2">
                            <span className="text-gray-500">🖥️</span>
                            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Console Output</span>
                        </div>
                        <textarea 
                            className={`flex-1 bg-transparent p-4 focus:outline-none resize-none font-mono text-sm custom-scrollbar ${output.includes('Error') ? 'text-red-400' : 'text-green-400'}`}
                            readOnly 
                            placeholder="Execution result will appear here..."
                            value={output}
                        ></textarea>
                    </div>

                </div>
            </Split>
        </div>
    );

    return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-screen bg-black text-white flex overflow-hidden selection:bg-accent/30 selection:text-white"
    >
            
            {/* Splitter for Sidebar & Editor (Desktop) */}
            {isMobile ? (
                <>
                    {EditorArea}
                </>
            ) : (
                <Split
                    className="flex w-full"
                    sizes={[18, 82]}
                    minSize={260}
                    gutterSize={4}
                    gutterAlign="center"
                    cursor="col-resize"
                >
                    <div className="h-full shadow-2xl z-20 relative">
                        <SidebarContent />
                    </div>
                    {EditorArea}
                </Split>
            )}

            {/* MOBILE MENU OVERLAY (Glassmorphism) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex justify-start">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleMobileMenu}></div>
                    
                    {/* Menu Panel */}
                    <div className="bg-[#050505] w-4/5 max-w-sm h-full flex flex-col shadow-2xl animate-in slide-in-from-left-full relative z-10 border-r border-gray-800">
                        <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-[#0a0a0a]">
                             <div className="flex items-center gap-2">
                                <img src="/code-sync.png" alt="logo" className="h-6" />
                                <h3 className="font-bold text-white tracking-wide">Menu</h3>
                             </div>
                             <button onClick={toggleMobileMenu} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                             </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-5">
                            <h3 className="font-bold text-gray-500 mb-4 uppercase tracking-widest text-[10px]">Connected Users</h3>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {clients.map((client) => (
                                    <div key={client.socketId} className="bg-white/5 border border-white/5 rounded-xl p-2 flex items-center justify-center">
                                        <Client username={client.username} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-5 flex flex-col gap-3 bg-[#0a0a0a] border-t border-gray-800">
                             <button className="bg-white/5 text-white py-3 px-4 rounded-xl font-bold hover:bg-white/10 border border-white/5 transition-all text-xs tracking-wider flex justify-center items-center gap-2" onClick={() => { copyRoomId(); toggleMobileMenu(); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" /></svg>
                                COPY ID
                            </button>
                            <button className="bg-red-500/10 text-red-500 py-3 px-4 rounded-xl font-bold hover:bg-red-500 hover:text-white border border-red-500/30 transition-all text-xs tracking-wider flex justify-center items-center gap-2" onClick={leaveRoom}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                                SIGN OUT
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CHAT UI FLOATING BUTTON */}
            <button 
                className={`fixed bottom-8 right-8 z-40 p-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all transform hover:scale-110 flex items-center justify-center ${isChatOpen ? 'bg-gray-800 text-white border border-gray-700' : 'bg-gradient-to-tr from-accent to-purple-500 text-black shadow-[0_0_20px_rgba(124,58,237,0.4)]'}`}
                onClick={toggleChat}
            >
                {unreadCount > 0 && !isChatOpen && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-black animate-bounce shadow-lg">
                        {unreadCount}
                    </span>
                )}
                {isChatOpen ? (
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                )}
            </button>

            {/* CHAT WINDOW (Glassmorphism) */}
            {isChatOpen && (
                <div className="fixed bottom-28 right-8 w-[90%] sm:w-[350px] h-[60%] sm:h-[450px] bg-[#0a0a0a]/90 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden z-40 animate-in slide-in-from-bottom-5">
                    <div className="bg-[#111] p-4 border-b border-gray-800 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-purple-600"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">💬</span>
                            <span className="text-white font-bold tracking-wide">Team Chat</span>
                        </div>
                        <span className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold uppercase tracking-wider bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            Live
                        </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar bg-transparent">
                        {messages.map((msg, index) => {
                            const isMe = msg.username === username;
                            return (
                                <div key={index} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                                    <span className={`text-[9px] font-bold opacity-50 uppercase tracking-widest mb-1 ${isMe ? 'text-accent' : 'text-gray-400'}`}>
                                        {msg.username}
                                    </span>
                                    <div className={`p-3 rounded-2xl text-sm break-words shadow-sm ${isMe ? 'bg-gradient-to-br from-accent to-purple-500 text-black rounded-tr-none' : 'bg-gray-800/80 text-gray-200 border border-gray-700 rounded-tl-none'}`}>
                                        {msg.message}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="p-3 bg-[#111] border-t border-gray-800 flex gap-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 bg-black text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-all placeholder-gray-600"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyUp={handleEnterKey}
                        />
                        <button 
                            onClick={sendMessage} 
                            className="bg-accent text-black w-12 rounded-xl flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 -rotate-45 ml-1"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default EditorPage;