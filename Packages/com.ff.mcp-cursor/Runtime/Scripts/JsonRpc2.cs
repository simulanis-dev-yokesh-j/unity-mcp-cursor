using System;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FF.MCPCursor.Runtime
{
    public class JsonRpc2
    {
        public static JsonRpcRequest CreateRequest(string method, object parameters = null)
        {
            return new JsonRpcRequest
            {
                jsonrpc = "2.0",
                method = method,
                @params = parameters,
                id = Guid.NewGuid().ToString()
            };
        }

        public static JsonRpcResponse CreateResponse(string id, object result = null, JsonRpcError error = null)
        {
            return new JsonRpcResponse
            {
                jsonrpc = "2.0",
                id = id,
                result = result,
                error = error
            };
        }

        public static JsonRpcNotification CreateNotification(string method, object parameters = null)
        {
            return new JsonRpcNotification
            {
                jsonrpc = "2.0",
                method = method,
                @params = parameters
            };
        }

        public static JsonRpcError CreateError(int code, string message, object data = null)
        {
            return new JsonRpcError
            {
                code = code,
                message = message,
                data = data
            };
        }

        public static bool IsValidMessage(string message)
        {
            try
            {
                var json = JsonConvert.DeserializeObject<JsonRpcMessage>(message);
                return json.jsonrpc == "2.0" &&
                       (json.method != null || json.result != null || json.error != null);
            }
            catch
            {
                return false;
            }
        }

        public static JsonRpcMessage ParseMessage(string message)
        {
            return JsonConvert.DeserializeObject<JsonRpcMessage>(message);
        }

        public static string SerializeMessage(object message)
        {
            return JsonConvert.SerializeObject(message);
        }
    }

    public class JsonRpcMessage
    {
        public string jsonrpc { get; set; }
        public string method { get; set; }
        public object @params { get; set; }
        public string id { get; set; }
        public object result { get; set; }
        public JsonRpcError error { get; set; }
    }

    public class JsonRpcRequest
    {
        public string jsonrpc { get; set; }
        public string method { get; set; }
        public object @params { get; set; }
        public string id { get; set; }
    }

    public class JsonRpcResponse
    {
        public string jsonrpc { get; set; }
        public string id { get; set; }
        public object result { get; set; }
        public JsonRpcError error { get; set; }
    }

    public class JsonRpcNotification
    {
        public string jsonrpc { get; set; }
        public string method { get; set; }
        public object @params { get; set; }
    }

    public class JsonRpcError
    {
        public int code { get; set; }
        public string message { get; set; }
        public object data { get; set; }
    }

    public static class JsonRpcErrorCodes
    {
        public const int ParseError = -32700;
        public const int InvalidRequest = -32600;
        public const int MethodNotFound = -32601;
        public const int InvalidParams = -32602;
        public const int InternalError = -32603;
        public const int ServerError = -32000;
        public const int Timeout = -32001;
        public const int ConnectionError = -32002;
    }
} 