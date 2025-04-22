import { MCPClient } from './index';

async function testConnection() {
    console.log('Starting MCP Client test...');
    
    const client = new MCPClient();
    
    try {
        // Test command
        console.log('Sending test command...');
        const commandResponse = await client.sendCommand('test', { message: 'Hello from Cursor!' });
        console.log('Command response:', commandResponse);

        // Test query
        console.log('Sending test query...');
        const queryResponse = await client.sendQuery('get_scene_info');
        console.log('Query response:', queryResponse);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        client.disconnect();
    }
}

// Run the test
testConnection(); 