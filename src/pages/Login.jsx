import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
// ✨ 1. Imports
import { motion } from 'framer-motion';
import { pageAnimation, elementAnimation } from '../animations';

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });

    const handleInput = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (!credentials.email || !credentials.password) {
            toast.error('Email and Password are required');
            return;
        }
        // Backend banne ke baad yahan asli login hoga
        toast.success('Logged in successfully!');
        navigate('/');
    };

    return (
        // ✨ 2. Sabse bahar wale div ko motion.div banaya
        // Aur pageAnimation settings pass ki
        <motion.div 
            className="homePageWrapper"
            variants={pageAnimation}
            initial="hidden"
            animate="show"
            exit="exit"
        >
            <div className="formWrapper">
                {/* ✨ 3. Har element ko motion.img / motion.h4 / motion.div banaya 
                     taaki wo stagger effect (ek ke baad ek aana) kaam kare */}
                
                <motion.img variants={elementAnimation} className="homePageLogo" src="/code-sync.png" alt="logo" />
                <motion.h4 variants={elementAnimation} className="mainLabel">Login to Code-Pair</motion.h4>
                
                <form className="inputGroup" onSubmit={handleLogin}>
                    <motion.div variants={elementAnimation}>
                        <input
                            type="email"
                            name="email"
                            className="inputBox"
                            placeholder="EMAIL"
                            onChange={handleInput}
                            value={credentials.email}
                            style={{width: '100%'}} // Thoda fix
                        />
                    </motion.div>
                    <motion.div variants={elementAnimation}>
                        <input
                            type="password"
                            name="password"
                            className="inputBox"
                            placeholder="PASSWORD"
                            onChange={handleInput}
                            value={credentials.password}
                            style={{width: '100%'}}
                        />
                    </motion.div>
                    
                    <motion.div variants={elementAnimation}>
                         <button type="submit" className="btn joinBtn" style={{width: '100%'}}>
                            Login
                        </button>
                    </motion.div>
                   
                    <motion.span variants={elementAnimation} className="createInfo">
                        Don't have an account? &nbsp;
                        <Link to="/signup" className="createNewBtn">Sign Up</Link>
                    </motion.span>
                </form>
            </div>
        </motion.div>
    );
};

export default Login;