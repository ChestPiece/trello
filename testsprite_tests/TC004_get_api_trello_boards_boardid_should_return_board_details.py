import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def create_board():
    url = f"{BASE_URL}/api/trello/boards"
    board_name = f"Test Board {uuid.uuid4()}"
    payload = {
        "name": board_name,
        "desc": "Temporary board for testing",
        "defaultLists": False,
        "defaultLabels": False,
        "defaultCards": False,
        "prefs_permissionLevel": "private",
        "prefs_background": "blue",
        "prefs_backgroundBrightness": "light"
    }
    response = requests.post(url, json=payload, timeout=TIMEOUT)
    response.raise_for_status()
    return response.json()

def delete_board(board_id):
    url = f"{BASE_URL}/api/trello/boards/{board_id}"
    response = requests.delete(url, timeout=TIMEOUT)
    if response.status_code not in [204, 200, 404]:
        response.raise_for_status()

def test_get_api_trello_boards_boardid_should_return_board_details():
    # Create a board first to test successful retrieval
    board = create_board()
    board_id = board.get("id")
    assert board_id is not None, "Created board response does not contain 'id'"

    try:
        # Test successful retrieval of existing board details
        get_url = f"{BASE_URL}/api/trello/boards/{board_id}"
        resp = requests.get(get_url, timeout=TIMEOUT)

        assert resp.status_code == 200, f"Expected 200 OK, got {resp.status_code}"
        data = resp.json()
        assert isinstance(data, dict), "Response JSON is not an object"
        assert data.get("id") == board_id, "Returned board ID does not match requested boardId"
        assert data.get("name") == board.get("name"), "Board name mismatch in response"

        # Test error handling with invalid boardId
        invalid_board_id = "invalid-board-id-123456"
        invalid_url = f"{BASE_URL}/api/trello/boards/{invalid_board_id}"
        invalid_resp = requests.get(invalid_url, timeout=TIMEOUT)

        # Check error response codes for invalid board ID: assuming 404 or 400
        assert invalid_resp.status_code in [400, 404], f"Expected 400 or 404 for invalid boardId, got {invalid_resp.status_code}"

        # Optionally check error structure if JSON response given
        if invalid_resp.headers.get("Content-Type", "").startswith("application/json"):
            error_json = invalid_resp.json()
            assert isinstance(error_json, dict), "Error response JSON is not an object"
            assert "error" in error_json or "message" in error_json, "Error response missing expected keys"

        # Test rate limiting scenario if possible by repeated requests (simulate quickly 10 requests)
        # We'll do 10 rapid requests to try triggering 429
        rate_limit_triggered = False
        for _ in range(10):
            r = requests.get(get_url, timeout=TIMEOUT)
            if r.status_code == 429:
                rate_limit_triggered = True
                rl_json = r.json()
                assert "error" in rl_json, "Rate limit response missing error key"
                assert "retryAfter" in rl_json, "Rate limit response missing retryAfter key"
                break
        # It's acceptable if rate limiting is not triggered in this test environment

    finally:
        # Clean up: Delete the created board
        delete_board(board_id)

test_get_api_trello_boards_boardid_should_return_board_details()
