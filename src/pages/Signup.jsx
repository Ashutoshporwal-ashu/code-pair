import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
// ✨ 1. Imports
import { motion } from 'framer-motion';
import { pageAnimation, elementAnimation } from '../animations';

const Signup = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const handleInput = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!userData.username || !userData.email || !userData.password) {
            toast.error('Please fill all fields');
            return;
        }
        toast.success('Registration successful! Please login.');
        navigate('/login');
    };

    return (
        // ✨ 2. Main wrapper animation
        <motion.div 
            className="homePageWrapper"
            variants={pageAnimation}
            initial="hidden"
            animate="show"
            exit="exit"
        >
            <div className="formWrapper">
                {/* ✨ 3. Inner elements animation */}
                <motion.img variants={elementAnimation} className="homePageLogo" src="/code-sync.png" alt="logo" />
                <motion.h4 variants={elementAnimation} className="mainLabel">Create your Account</motion.h4>
                
                <form className="inputGroup" onSubmit={handleSubmit}>
                     <motion.div variants={elementAnimation}>
                        <input
                            type="text"
                            name="username"
                            className="inputBox"
                            placeholder="FULL NAME"
                            onChange={handleInput}
                            value={userData.username}
                            style={{width: '100%'}}
                        />
                     </motion.div>
                     <motion.div variants={elementAnimation}>
                        <input
                            type="email"
                            name="email"
                            className="inputBox"
                            placeholder="EMAIL"
                            onChange={handleInput}
                            value={userData.email}
                            style={{width: '100%'}}
                        />
                     </motion.div>
                     <motion.div variants={elementAnimation}>
                        <input
                            type="password"
                            name="password"
                            className="inputBox"
                            placeholder="PASSWORD"
                            onChange={handleInput}
                            value={userData.password}
                            style={{width: '100%'}}
                        />
                     </motion.div>

                    <motion.div variants={elementAnimation}>
                        <button type="submit" className="btn joinBtn" style={{width: '100%'}}>
                            Sign Up
                        </button>
                    </motion.div>
                    
                    <motion.span variants={elementAnimation} className="createInfo">
                        Already have an account? &nbsp;
                        <Link to="/login" className="createNewBtn">Login</Link>
                    </motion.span>
                </form>
            </div>
        </motion.div>
    );
};

export default Signup;