import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';

function App() {
  return (
    <>
      <div>
        {/* 🍏 ✨ iOS STYLE TOAST NOTIFICATIONS */}
        <Toaster
            position="top-center" // iOS ki tarah upar se aayega
            reverseOrder={false}
            toastOptions={{
                // Default animation duration
                duration: 3000,
                // Custom CSS for that smooth Apple Glassmorphism look
                style: {
                    background: 'rgba(25, 25, 25, 0.85)', // Translucent Dark Gray
                    backdropFilter: 'blur(16px)', // ✨ Frosted Glass Effect
                    WebkitBackdropFilter: 'blur(16px)', // Safari support
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.08)', // Halka sa white border
                    borderRadius: '100px', // ✨ Pill Shape (Capsule)
                    padding: '12px 24px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)', // Soft floating shadow
                    fontSize: '14px',
                    fontWeight: '500',
                    letterSpacing: '0.3px',
                },
                
                // Success Messages (iOS Green Icon)
                success: {
                    iconTheme: {
                        primary: '#34C759', // Official iOS Green
                        secondary: '#111',
                    },
                },

                // Error Messages (iOS Red Icon)
                error: {
                    iconTheme: {
                        primary: '#FF3B30', // Official iOS Red
                        secondary: '#fff',
                    },
                },
            }}
        />
      </div>
      
      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/editor/:roomId" element={<EditorPage />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
      </Routes>
    </>
  );
}

export default App;