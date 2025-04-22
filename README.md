# Unity MCP Cursor Integration

A Unity package that enables integration between Unity and Cursor IDE using the Model Context Protocol (MCP). This package allows Cursor IDE to interact with Unity in real-time, providing enhanced development capabilities.

## Features

- Real-time communication between Unity and Cursor IDE
- WebSocket server implementation for Unity
- Editor window for server control
- MCP protocol implementation
- TypeScript plugin for Cursor IDE

## Installation

### Unity Package
1. Open Unity Package Manager
2. Click the "+" button
3. Select "Add package from disk"
4. Navigate to the `Packages/com.ff.mcp-cursor` directory
5. Select the `package.json` file

### Cursor Plugin
1. Install the plugin through Cursor's plugin marketplace
2. Enable the plugin in Cursor's settings

## Project Structure

```
Cursor Plugin/
├── Packages/
│   └── com.ff.mcp-cursor/
│       ├── Runtime/
│       │   └── Scripts/
│       │       └── MCPServer.cs
│       ├── Editor/
│       │   └── MCPServerWindow.cs
│       ├── Samples/
│       │   └── ExampleScene/
│       ├── package.json
│       ├── CHANGELOG.md
│       └── LICENSE.md
├── CursorPlugin/
│   ├── src/
│   │   ├── index.ts
│   │   └── mcp/
│   │       └── protocol.ts
│   ├── package.json
│   └── tsconfig.json
├── Documentation/
│   ├── installation.md
│   └── usage.md
├── TestProject/
│   └── Assets/
│       └── Scripts/
│           └── TestSceneManager.cs
├── README.md
├── CHANGELOG.md
└── LICENSE.md
```

## Usage

1. Open Unity and import the package
2. Open the MCP Server window (Window > MCP Server)
3. Start the server
4. In Cursor IDE, the plugin will automatically connect to Unity
5. Use the MCP protocol to interact with Unity

## Development

### Unity Package
- Runtime scripts are in `Packages/com.ff.mcp-cursor/Runtime/Scripts`
- Editor scripts are in `Packages/com.ff.mcp-cursor/Editor`
- Example scenes are in `Packages/com.ff.mcp-cursor/Samples`

### Cursor Plugin
- Source code is in `CursorPlugin/src`
- Build output is in `CursorPlugin/dist`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Version History

See [CHANGELOG.md](CHANGELOG.md) for version history and changes. 