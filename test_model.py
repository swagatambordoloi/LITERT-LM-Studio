import json
import urllib.request

# Define local server parameters
url = "http://localhost:8001/v1/chat/completions"
headers = {"Content-Type": "application/json"}

# Simple completion payload structure
payload = {
    "model": "local-model",
    "messages": [
        {"role": "user", "content": "Tell me a short joke about programming."}
    ],
    "temperature": 0.7,
    "max_tokens": 128
}

req = urllib.request.Request(
    url, 
    data=json.dumps(payload).encode("utf-8"), 
    headers=headers, 
    method="POST"
)

try:
    print("🤖 Sending prompt to local model...")
    with urllib.request.urlopen(req) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        answer = res_data["choices"][0]["message"]["content"]
        print(f"\n✨ Response:\n{answer}")
except Exception as e:
    print(f"❌ Failed to reach inference server: {e}")