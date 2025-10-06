import requests
import time
import json

BASE_URL = "http://localhost:3000"
CHAT_ENDPOINT = f"{BASE_URL}/api/chat"
TIMEOUT = 30

# If authentication is required, set your API key here (dummy key used)
OPENAI_API_KEY = "Bearer test-openai-api-key"

headers = {
    "Authorization": OPENAI_API_KEY,
    "Content-Type": "application/json",
    "Accept": "text/event-stream",
}


def test_post_api_chat_should_stream_ai_responses_with_trello_integration():
    # Test 1: Successful streaming response with valid user message triggering Trello integration
    messages = [
        {
            "role": "user",
            "parts": [
                {
                    "type": "text",
                    "text": "Please create a new Trello board named 'Test Board' with default lists and labels."
                }
            ],
        }
    ]
    payload = {"messages": messages}
    try:
        resp = requests.post(
            CHAT_ENDPOINT, headers=headers, json=payload, timeout=TIMEOUT, stream=True
        )
    except requests.RequestException as e:
        assert False, f"Request failed unexpectedly: {e}"

    assert resp.status_code == 200, f"Expected 200 OK, got {resp.status_code}"
    # Validate streaming format - checking for server-sent-events format typical patterns ("data: ...")
    # We'll read some lines from the stream and confirm format & presence of AI-related text and tool call info
    try:
        has_tool_call = False
        has_ai_response = False
        lines_checked = 0
        for line in resp.iter_lines(decode_unicode=True):
            if line.strip() == "":
                continue
            if line.startswith("data:"):
                lines_checked += 1
                data = line[len("data:"):].strip()
                # Try parsing JSON from the data line to detect part types
                try:
                    obj = json.loads(data)
                    # obj could be a dict representing a message part or contains 'parts'
                    # We check if obj is dict and has 'type' key with value 'tool-call' or 'tool-result'
                    # Or if obj has a 'parts' list, check within them
                    def check_tool_call(o):
                        if isinstance(o, dict):
                            if o.get('type') in ('tool-call', 'tool-result'):
                                return True
                            if 'parts' in o and isinstance(o['parts'], list):
                                return any(check_tool_call(p) for p in o['parts'])
                        elif isinstance(o, list):
                            return any(check_tool_call(i) for i in o)
                        return False

                    if check_tool_call(obj):
                        has_tool_call = True
                    # Also check for AI response keywords in text fields
                    # Flatten all text fields in obj
                    def extract_texts(o):
                        texts = []
                        if isinstance(o, dict):
                            if 'text' in o and isinstance(o['text'], str):
                                texts.append(o['text'])
                            for v in o.values():
                                texts.extend(extract_texts(v))
                        elif isinstance(o, list):
                            for item in o:
                                texts.extend(extract_texts(item))
                        return texts

                    texts = extract_texts(obj)
                    if any(keyword.lower() in (t or '').lower() for t in texts for keyword in ["board", "list", "card", "created", "Trello"]):
                        has_ai_response = True
                except Exception:
                    # If JSON parse fails, fallback to original substring checking
                    if 'tool-call' in data or 'tool-result' in data:
                        has_tool_call = True
                    if data and any(keyword in data for keyword in ["board", "list", "card", "created", "Trello"]):
                        has_ai_response = True
            # Stop after checking a reasonable amount of streamed lines
            if lines_checked >= 10:
                break
        assert has_ai_response, "AI-generated response content not found in stream."
        assert has_tool_call, "Trello tool call data not found in stream."
    finally:
        resp.close()

    # Test 2: Error handling for invalid input format (missing 'messages' field)
    invalid_payloads = [
        {},  # empty payload
        {"messages": "invalid-string"},  # wrong messages type
        {"messages": [{"role": "user"}]},  # missing parts in message
        {"messages": [{"parts": [{"type": "text", "text": "hello"}]}]},  # missing role
        {"messages": [{"role": "unknown", "parts": [{"type": "text", "text": "hi"}]}]},  # invalid role enum
    ]
    for invalid_payload in invalid_payloads:
        try:
            r = requests.post(CHAT_ENDPOINT, headers=headers, json=invalid_payload, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request failed unexpectedly: {e}"
        assert r.status_code == 400, f"Invalid input should result in 400, got {r.status_code}"
        # Validate error response structure
        try:
            error_resp = r.json()
            assert "error" in error_resp
            assert "message" in error_resp
            assert "requestId" in error_resp
        except Exception:
            assert False, "Invalid input response must have JSON error structure."

    # Test 3: Rate limiting handling (simulate by sending many requests quickly)
    # Note: Actual rate limit threshold unknown, so we attempt spikes until 429 or max attempts reached.
    rate_limit_hit = False
    for _ in range(15):
        try:
            r = requests.post(CHAT_ENDPOINT, headers=headers, json=payload, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request failed unexpectedly during rate limit testing: {e}"
        if r.status_code == 429:
            rate_limit_hit = True
            try:
                rl_resp = r.json()
                assert "error" in rl_resp
                assert "retryAfter" in rl_resp
                assert "requestId" in rl_resp
                retry_after = rl_resp["retryAfter"]
                assert isinstance(retry_after, (int, float)) and retry_after > 0
            except Exception:
                assert False, "429 response must contain proper JSON with error and retryAfter."
            break
        # brief pause to reduce hammering the server excessively if no rate limit triggered
        time.sleep(0.2)
    # It is acceptable if no rate-limit triggered; this is a best effort test
    # But if rate-limit is supported the test confirms handling
    # So no assertion on rate_limit_hit True required

    # Test 4: Internal server error simulation is environment dependent and hard to trigger here
    # Instead, we test unexpected payload content type to validate 400 and fallback

    wrong_content_type_headers = headers.copy()
    wrong_content_type_headers["Content-Type"] = "text/plain"
    try:
        r500 = requests.post(CHAT_ENDPOINT, headers=wrong_content_type_headers, data="Just text", timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed unexpectedly with wrong content-type test: {e}"
    assert r500.status_code in [400, 415, 500], f"Unexpected status code for wrong content-type: {r500.status_code}"

    # Summary: This test function covers successful streaming, input validation errors, rate limiting, and general error handling.


test_post_api_chat_should_stream_ai_responses_with_trello_integration()
