import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom'; // useLocation add kiya
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
        <Toaster
          position="top-right"
          toastOptions={{
            success: { theme: { primary: '#4aed88' } },
          }}
        ></Toaster>
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