import React from 'react';
import { TestConnection } from './components/TestConnection';
import './App.css';

const App: React.FC = () => {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Cursor Plugin</h1>
                <p>Unity Integration</p>
            </header>
            <main className="App-main">
                <TestConnection />
            </main>
        </div>
    );
};

export default App; 