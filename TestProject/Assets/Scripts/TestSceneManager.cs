using UnityEngine;
using FF.MCPCursor;

public class TestSceneManager : MonoBehaviour
{
    private MCPServer server;

    private void Start()
    {
        // Find or create the server instance
        server = FindObjectOfType<MCPServer>();
        if (server == null)
        {
            var go = new GameObject("MCP Server");
            server = go.AddComponent<MCPServer>();
        }

        // Start the server
        server.StartServer();
    }

    private void OnDestroy()
    {
        if (server != null)
        {
            server.StopServer();
        }
    }
} 