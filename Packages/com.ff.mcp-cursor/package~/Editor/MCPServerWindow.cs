using UnityEngine;
using UnityEditor;
using FF.MCPCursor.Runtime;

namespace FF.MCPCursor.Editor
{
    public class MCPServerWindow : EditorWindow
    {
        private MCPServer server;
        private bool isServerRunning = false;
        private Vector2 scrollPosition;

        [MenuItem("Tools/MCP Cursor/Server Window")]
        public static void ShowWindow()
        {
            GetWindow<MCPServerWindow>("MCP Server");
        }

        private void OnEnable()
        {
            // Find or create the server instance
            server = FindObjectOfType<MCPServer>();
            if (server == null)
            {
                var go = new GameObject("MCP Server");
                server = go.AddComponent<MCPServer>();
                go.hideFlags = HideFlags.HideInHierarchy;
            }
        }

        private void OnGUI()
        {
            scrollPosition = EditorGUILayout.BeginScrollView(scrollPosition);

            EditorGUILayout.Space(10);
            EditorGUILayout.LabelField("MCP Server Control", EditorStyles.boldLabel);
            EditorGUILayout.Space(5);

            // Server status
            EditorGUILayout.BeginHorizontal();
            EditorGUILayout.LabelField("Status:", GUILayout.Width(50));
            GUI.color = isServerRunning ? Color.green : Color.red;
            EditorGUILayout.LabelField(isServerRunning ? "Running" : "Stopped");
            GUI.color = Color.white;
            EditorGUILayout.EndHorizontal();

            EditorGUILayout.Space(10);

            // Server controls
            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button(isServerRunning ? "Stop Server" : "Start Server"))
            {
                if (isServerRunning)
                {
                    server.StopServer();
                }
                else
                {
                    server.StartServer();
                }
                isServerRunning = !isServerRunning;
            }
            EditorGUILayout.EndHorizontal();

            EditorGUILayout.Space(10);

            // Server information
            EditorGUILayout.LabelField("Server Information", EditorStyles.boldLabel);
            EditorGUILayout.LabelField("Port: 8090");
            EditorGUILayout.LabelField("Protocol: MCP");
            EditorGUILayout.LabelField("Status: " + (isServerRunning ? "Listening" : "Not running"));

            EditorGUILayout.EndScrollView();
        }

        private void OnDestroy()
        {
            if (server != null && isServerRunning)
            {
                server.StopServer();
            }
        }
    }
} 