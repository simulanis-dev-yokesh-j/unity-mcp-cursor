import React from 'react';

interface MCPServerStatusProps {
    isRunning: boolean;
    port: number;
    onStart: () => void;
    onStop: () => void;
}

export const MCPServerStatus: React.FC<MCPServerStatusProps> = ({
    isRunning,
    port,
    onStart,
    onStop
}) => {
    return (
        <div className="mcp-server-status">
            <h2>MCP Server Status</h2>
            <div className="status-indicator">
                <span className={`status-dot ${isRunning ? 'running' : 'stopped'}`} />
                <span>{isRunning ? 'Running' : 'Stopped'}</span>
            </div>
            <div className="server-info">
                <p>Port: {port}</p>
            </div>
            <div className="server-controls">
                {isRunning ? (
                    <button onClick={onStop} className="stop-button">
                        Stop Server
                    </button>
                ) : (
                    <button onClick={onStart} className="start-button">
                        Start Server
                    </button>
                )}
            </div>
        </div>
    );
}; 