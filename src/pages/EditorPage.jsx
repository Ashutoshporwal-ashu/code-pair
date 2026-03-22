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

// ✨ FAANG-STYLE BOILERPLATES
const CODE_SNIPPETS = {
    javascript: "function solve() {\n  // Write your logic here\n}\n\nconsole.log(solve());",
    python: "def solve():\n    # Write your logic here\n    pass\n\nif __name__ == '__main__':\n    solve()",
    java: "public class Main {\n    public static void main(String[] args) {\n        // Write your logic here\n    }\n}",
    cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your logic here\n    return 0;\n}",
    c: "#include <stdio.h>\n\nint main() {\n    // Write your logic here\n    return 0;\n}"
};

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const isIncomingChange = useRef(false);
    const isChatOpenRef = useRef(false); 
    
    const popSound = new Audio('https://res.cloudinary.com/dxfq3iotg/video/upload/v1557233524/pop.mp3');

    const location = useLocation();
    const { roomId } = useParams();
    const navigate = useNavigate();

    // States
    const [clients, setClients] = useState([]);
    const [language, setLanguage] = useState('cpp'); // Default set to C++
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    
    // ✨ NEW: TAB STATE FOR INPUT/OUTPUT
    const [activeTab, setActiveTab] = useState('input'); // 'input' or 'output'
    
    // UI States
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const playPopSound = () => {
        popSound.currentTime = 0; 
        popSound.play().catch((err) => console.log("Browser blocked sound:", err));
    };

    const username = location.state?.username || localStorage.getItem('savedUsername');

    const LANGUAGE_VERSIONS = {
        javascript: "*",
        python: "*",
        java: "*",
        cpp: "*",
        c: "*",
    };

    const FILE_EXTENSIONS = {
        javascript: "js",
        python: "py",
        java: "java",
        cpp: "cpp",
        c: "c",
    };

    // Load saved code OR use default boilerplate
    const savedCode = localStorage.getItem(`codeSync_${roomId}`) || CODE_SNIPPETS['cpp'];

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
                    localStorage.setItem(`codeSync_${roomId}`, code);
                }
            });

            socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
                if (username !== location.state?.username) {
                    playPopSound();
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
                    playPopSound();
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

    const formatCode = () => {
        if (codeRef.current) {
            codeRef.current.getAction('editor.action.formatDocument').run();
            toast.success('Code formatted! ✨');
        }
    };

    const downloadCode = () => {
        const content = codeRef.current.getValue();
        const extension = FILE_EXTENSIONS[language] || "txt";
        const filename = `code-sync-${roomId}.${extension}`;

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`File downloaded as ${filename} 📥`);
    };

    const clearConsole = () => {
        setOutput('');
        toast.success('Console cleared! 🧹');
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        // Ask before overwriting code with new boilerplate
        if (codeRef.current) {
            const currentCode = codeRef.current.getValue();
            if (currentCode.trim() === '' || currentCode === CODE_SNIPPETS['cpp'] || currentCode === CODE_SNIPPETS['javascript'] || currentCode === CODE_SNIPPETS['python'] || currentCode === CODE_SNIPPETS['java']) {
                codeRef.current.setValue(CODE_SNIPPETS[newLang]);
                localStorage.setItem(`codeSync_${roomId}`, CODE_SNIPPETS[newLang]);
            } else {
                toast("Language changed. Existing code kept intact.", { icon: "ℹ️" });
            }
        }
    };

    const runCode = async () => {
        setIsRunning(true);
        setActiveTab('output'); // ✨ AUTO-SWITCH TO OUTPUT TAB
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
            
            if (result.message) {
                setOutput(`API Error: ${result.message}`);
                return;
            }

            if (result.compile && result.compile.code !== 0) {
                setOutput(`Compilation Error:\n${result.compile.output}`);
                return;
            }

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

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#050505] relative overflow-hidden border-r border-gray-800/50">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-32 bg-purple-600/10 blur-[50px] pointer-events-none"></div>

            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar relative z-10">
                
                {/* ✨ NEW PREMIUM LOGO (No Image Needed) */}
                <div className="flex items-center justify-center gap-3 mb-8 pb-6 border-b border-gray-800/50 select-none group cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)] group-hover:scale-105 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 18 22 12 16 6"></polyline>
                            <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight flex flex-col leading-none">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">Code</span>
                        <span className="text-[11px] text-gray-500 font-bold tracking-[0.25em] uppercase mt-0.5">Sync</span>
                    </h1>
                </div>
                
                <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                    <h3 className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Connected Team</h3>
                </div>

                {/* ✨ REFINED CLIENT LIST */}
                <div className="flex flex-col gap-2">
                    {clients.map((client) => (
                        <div key={client.socketId} className="group relative bg-[#111] hover:bg-[#1a1a1a] border border-gray-800/50 hover:border-gray-700 rounded-xl p-3 flex items-center gap-3 transition-all cursor-pointer">
                            <Client username={client.username} />
                        </div>
                    ))}
                </div>
            </div>
            
            {/* ✨ REDESIGNED BOTTOM BUTTONS */}
            <div className="p-5 flex flex-col gap-3 relative z-10 bg-[#080808] border-t border-gray-800/50">
                <button 
                    className="w-full bg-[#111] border border-gray-800 text-gray-300 py-3 px-4 rounded-xl font-bold hover:border-accent hover:text-accent hover:bg-accent/5 transition-all text-xs tracking-wider flex justify-center items-center gap-2 group" 
                    onClick={copyRoomId}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:scale-110 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" /></svg>
                    COPY ID
                </button>
                <button 
                    className="w-full bg-red-500/5 border border-red-500/20 text-red-500 py-3 px-4 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all text-xs tracking-wider flex justify-center items-center gap-2 group" 
                    onClick={leaveRoom}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                    SIGN OUT
                </button>
            </div>
        </div>
    );

    const EditorArea = (
        <div className="flex flex-col h-full bg-black w-full relative">
            <Split
                className="h-full flex flex-col"
                sizes={[70, 30]}
                minSize={100}
                gutterSize={6}
                direction="vertical"
                cursor="row-resize"
            >
                {/* EDITOR TOP SECTION */}
                <div className="flex flex-col h-full relative">
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
                        
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button 
                                onClick={toggleFullScreen}
                                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                                className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-all hidden sm:block"
                            >
                                {isFullScreen ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                                )}
                            </button>

                            <div className="relative">
                                <select 
                                    className="appearance-none bg-[#111] text-gray-300 pl-3 pr-7 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-accent transition-all text-xs font-mono cursor-pointer hover:bg-[#1a1a1a]"
                                    value={language} 
                                    onChange={handleLanguageChange}
                                >
                                    <option value="cpp">C++</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="javascript">JavaScript</option>
                                </select>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                            </div>

                            <button 
                                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all hidden sm:block"
                                onClick={downloadCode}
                                title="Download Code"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                            </button>

                            <button 
                                className={`px-4 py-2 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2 text-xs tracking-wide ${isRunning ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95'}`}
                                onClick={runCode}
                                disabled={isRunning}
                            >
                                {isRunning ? (
                                    <><span className="animate-spin text-sm">⚙️</span> Run...</>
                                ) : (
                                    <><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" /></svg> Run</>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-hidden bg-black">
                        <Editor
                            height="100%"
                            language={language === 'cpp' ? 'cpp' : language}
                            defaultValue={savedCode}
                            theme="vs-dark"
                            onMount={(editor) => { codeRef.current = editor; }}
                            onChange={(value) => {
                                localStorage.setItem(`codeSync_${roomId}`, value);
                                if (isIncomingChange.current) return;
                                socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code: value });
                            }}
                            options={{ 
                                minimap: { enabled: false }, 
                                fontSize: 15, 
                                padding: { top: 20, bottom: 20 }, 
                                fontFamily: '"Fira Code", monospace', 
                                scrollBeyondLastLine: false,
                                smoothScrolling: true,
                                cursorBlinking: "smooth",
                            }}
                        />
                    </div>
                </div>

                {/* ✨ NEW: TABBED OUTPUT BOTTOM SECTION */}
                <div className="bg-[#050505] flex flex-col h-full border-t border-gray-800">
                    {/* TABS HEADER */}
                    <div className="flex items-center gap-2 px-4 pt-3 pb-2 bg-[#0a0a0a] border-b border-gray-800">
                        <button 
                            onClick={() => setActiveTab('input')}
                            className={`px-4 py-2 rounded-t-lg text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'input' ? 'bg-[#111] text-accent border-t-2 border-accent' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                        >
                            <span>⌨️</span> Custom Input
                        </button>
                        <button 
                            onClick={() => setActiveTab('output')}
                            className={`px-4 py-2 rounded-t-lg text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'output' ? 'bg-[#111] text-green-400 border-t-2 border-green-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                        >
                            <span>🖥️</span> Console Result
                        </button>
                        
                        {/* CLEAR CONSOLE BUTTON */}
                        {activeTab === 'output' && output && (
                            <button 
                                onClick={clearConsole}
                                className="ml-auto text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-colors"
                                title="Clear Console"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                            </button>
                        )}
                    </div>

                    {/* TAB CONTENT */}
                    <div className="flex-1 relative bg-[#111] p-4">
                        {activeTab === 'input' ? (
                            <textarea 
                                className="w-full h-full bg-transparent text-gray-300 focus:outline-none resize-none font-mono text-sm placeholder-gray-700 custom-scrollbar"
                                placeholder="Enter input here for your program (e.g. values for cin / scanner)..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            ></textarea>
                        ) : (
                            <textarea 
                                className={`w-full h-full bg-transparent focus:outline-none resize-none font-mono text-sm custom-scrollbar ${output.includes('Error') ? 'text-red-400' : 'text-gray-300'}`}
                                readOnly 
                                placeholder="Execution result will appear here. Click 'Run' to compile and execute."
                                value={output}
                            ></textarea>
                        )}
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

            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex justify-start">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleMobileMenu}></div>
                    
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