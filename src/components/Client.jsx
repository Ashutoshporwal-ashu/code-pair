import React from 'react';
import Avatar from 'react-avatar';

const Client = ({ username }) => {
    return (
        <div className="flex flex-col items-center gap-2 hover:bg-gray-800 p-2 rounded-lg transition-colors cursor-pointer group">
            <Avatar 
                name={username} 
                size={50} 
                round="14px" 
                className="shadow-lg border-2 border-transparent group-hover:border-accent transition-all duration-300" 
            />
            <span className="text-xs font-semibold text-gray-300 max-w-[60px] truncate group-hover:text-white">{username}</span>
        </div>
    );
};

export default Client;