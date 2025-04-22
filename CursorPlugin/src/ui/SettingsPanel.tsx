import React, { useState } from 'react';

interface Settings {
    port: number;
    autoConnect: boolean;
    showNotifications: boolean;
}

interface SettingsPanelProps {
    settings: Settings;
    onSettingsChange: (settings: Settings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    settings,
    onSettingsChange
}) => {
    const [localSettings, setLocalSettings] = useState<Settings>(settings);

    const handleChange = (key: keyof Settings, value: any) => {
        const newSettings = { ...localSettings, [key]: value };
        setLocalSettings(newSettings);
        onSettingsChange(newSettings);
    };

    return (
        <div className="mcp-settings-panel">
            <h3>Unity MCP Settings</h3>
            
            <div className="setting-group">
                <label>
                    <span>Port</span>
                    <input
                        type="number"
                        value={localSettings.port}
                        onChange={(e) => handleChange('port', parseInt(e.target.value))}
                        min="1024"
                        max="65535"
                    />
                </label>
            </div>

            <div className="setting-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={localSettings.autoConnect}
                        onChange={(e) => handleChange('autoConnect', e.target.checked)}
                    />
                    <span>Auto-connect on startup</span>
                </label>
            </div>

            <div className="setting-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={localSettings.showNotifications}
                        onChange={(e) => handleChange('showNotifications', e.target.checked)}
                    />
                    <span>Show notifications</span>
                </label>
            </div>

            <style jsx>{`
                .mcp-settings-panel {
                    padding: 16px;
                    background-color: var(--vscode-editor-background);
                    border-radius: 6px;
                    border: 1px solid var(--vscode-panel-border);
                }

                h3 {
                    margin: 0 0 16px 0;
                    color: var(--vscode-foreground);
                    font-size: 16px;
                }

                .setting-group {
                    margin-bottom: 12px;
                }

                label {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: var(--vscode-foreground);
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                input[type="number"] {
                    width: 80px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    border: 1px solid var(--vscode-input-border);
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                }

                input[type="checkbox"] {
                    margin: 0;
                }
            `}</style>
        </div>
    );
}; 