import React from 'react';
import Editor from '@monaco-editor/react';

function App() {
  return (
    <div style={{ height: '100vh', padding: '20px', backgroundColor: '#1e1e1e' }}>
      <h1 style={{ color: 'white' }}>Mera C++ Editor</h1>
      <Editor 
        height="80vh" 
        defaultLanguage="cpp" 
        defaultValue={`#include <iostream>
using namespace std;

int main() {
    cout << "Hello World!" << endl;
    return 0;
}`} 
        theme="vs-dark"
      />
    </div>
  );
}

export default App;