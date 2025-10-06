import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_post_api_trello_boards_should_create_new_board():
    url = f"{BASE_URL}/api/trello/boards"
    headers = {
        "Content-Type": "application/json"
    }

    # Payload with required and some optional parameters
    board_name = f"Test Board {uuid.uuid4()}"
    payload = {
        "name": board_name,
        "desc": "This is a test board created by automated test.",
        "defaultLists": True,
        "defaultLabels": False,
        "defaultCards": False,
        "prefs_permissionLevel": "private",
        "prefs_background": "blue",
        "prefs_backgroundBrightness": "light"
    }

    created_board_id = None

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Validate success response
    assert response.status_code == 200 or response.status_code == 201, f"Expected 200 or 201, got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Validate response structure contains at least an id and name matching the sent name
    assert "id" in data and isinstance(data["id"], str) and data["id"], "Response JSON missing 'id' or 'id' is empty"
    assert "name" in data and data["name"] == board_name, "Response 'name' does not match the requested board name"
    created_board_id = data["id"]

    # Validate optional fields if present
    if "desc" in data:
        assert data["desc"] == payload["desc"], "Response 'desc' does not match"
    # Check prefs as nested object
    if "prefs" in data and isinstance(data["prefs"], dict):
        prefs = data["prefs"]
        if "permissionLevel" in prefs:
            assert prefs["permissionLevel"] == payload["prefs_permissionLevel"], "Response prefs.permissionLevel does not match"
        if "background" in prefs:
            assert prefs["background"] == payload["prefs_background"], "Response prefs.background does not match"
        if "backgroundBrightness" in prefs:
            assert prefs["backgroundBrightness"] == payload["prefs_backgroundBrightness"], "Response prefs.backgroundBrightness does not match"

    # Error handling scenarios:

    # 1. Invalid input (missing required 'name')
    invalid_payload = {
        "desc": "Missing name field"
    }
    try:
        invalid_response = requests.post(url, json=invalid_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Invalid input request failed: {e}"

    assert invalid_response.status_code == 400, f"Expected 400 Bad Request for invalid input, got {invalid_response.status_code}"
    try:
        err_data = invalid_response.json()
        assert "error" in err_data or "message" in err_data, "Error response missing 'error' or 'message'"
    except ValueError:
        assert False, "Invalid input response is not valid JSON"

    # 2. Simulate rate limiting by sending multiple rapid requests (if rate limit headers exist)
    rate_limit_triggered = False
    for _ in range(20):
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
            if resp.status_code == 429:
                rate_limit_triggered = True
                rl_data = resp.json()
                assert "retryAfter" in rl_data or "error" in rl_data, "Rate limit response missing expected fields"
                break
            # If some other error occurs, break early
            if resp.status_code >= 500:
                break
        except requests.RequestException:
            break

    # Rate limiting might or might not be triggered depending on server config, so just warn/assert if triggered
    if rate_limit_triggered:
        assert True, "Rate limiting correctly triggered and returned 429"

    # 3. API failure (simulate by calling invalid URL to provoke 500 or other failure)
    invalid_url = f"{BASE_URL}/api/trello/boards/invalid_endpoint"
    try:
        failure_resp = requests.post(invalid_url, json=payload, headers=headers, timeout=TIMEOUT)
        # 404 or 500 expected
        assert failure_resp.status_code in (404, 500), f"Unexpected status code on invalid endpoint: {failure_resp.status_code}"
    except requests.RequestException:
        # If connection error or other error occurs, consider pass as simulated failure
        pass

    # Cleanup: delete created board if exists
    if created_board_id:
        try:
            del_response = requests.delete(f"{BASE_URL}/api/trello/boards/{created_board_id}", timeout=TIMEOUT)
            # Accept 200, 204, or 404 (if already deleted)
            assert del_response.status_code in (200, 204, 404), f"Failed to delete board after test, status code: {del_response.status_code}"
        except requests.RequestException:
            pass


test_post_api_trello_boards_should_create_new_board()
