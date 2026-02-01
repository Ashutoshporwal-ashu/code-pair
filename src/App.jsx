import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';
// ✨ Naya Import: Framer Motion se AnimatePresence
import { AnimatePresence } from 'framer-motion';

function App() {
  // ✨ Location hook taaki pata chale page kab change hua
  const location = useLocation();

  return (
    <>
      <div>
        {/* ✨ CUSTOM DARK TOASTS START */}
        <Toaster
            position="top-right"
            toastOptions={{
                // Default Options
                className: '',
                style: {
                    background: '#0f0f0f', // Dark Background
                    color: '#fff',         // White Text
                    border: '1px solid #7c3aed', // Purple Border
                    padding: '16px',
                    borderRadius: '10px',
                    boxShadow: '0 0 10px rgba(124, 58, 237, 0.3)', // Halki Purple Glow
                    fontFamily: 'monospace', // Techy Font
                    fontSize: '14px',
                },
                
                // Success Messages (Green/Purple Icon)
                success: {
                    theme: {
                        primary: '#4ade80', // Bright Green
                        secondary: 'black',
                    },
                    iconTheme: {
                        primary: '#4ade80',
                        secondary: '#0f0f0f',
                    },
                },

                // Error Messages (Red Icon)
                error: {
                    style: {
                        border: '1px solid #000000', // Red Border for Errors
                        boxShadow: '0 0 10px rgba(106, 42, 146, 0.83)',
                    },
                    iconTheme: {
                        primary: '#000000',
                        secondary: '#7c44ad',
                    },
                },
            }}
        />
        {/* ✨ CUSTOM DARK TOASTS END */}
      </div>
      
      {/* ✨ AnimatePresence ko wrap kiya Routes ke bahar. 
          mode="wait" ka matlab: pehla page jane do, phir naya lao. */}
      <AnimatePresence mode="wait">
        {/* ✨ location aur key add kiya taaki Framer ko pata chale route change hua */}
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />}></Route>
          <Route path="/editor/:roomId" element={<EditorPage />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;