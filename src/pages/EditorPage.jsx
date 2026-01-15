import React from 'react';
import Editor from '@monaco-editor/react';

const EditorPage = () => {
    return (
        <div style={{ height: '100vh', padding: '20px', backgroundColor: '#1e1e1e' }}>
          {/* Heading ko English mein change kiya */}
          <h1 style={{ color: 'white' }}>Code Sync Editor</h1>
          <Editor 
            height="80vh" 
            defaultLanguage="javascript" 
            defaultValue="// Type your code here" 
            theme="vs-dark"
          />
        </div>
      );
}

export default EditorPage;