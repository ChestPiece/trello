import requests
import uuid
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def put_api_trello_boards_boardid_should_update_board():
    headers = {
        "Content-Type": "application/json"
    }
    created_board_id = None
    try:
        # Step 1: Create a new board to update
        create_payload = {
            "name": f"Test Board {uuid.uuid4()}",
            "desc": "Initial description for update test",
            "defaultLists": False,
            "defaultLabels": False,
            "defaultCards": False,
            "prefs_permissionLevel": "private",
            "prefs_background": "blue",
            "prefs_backgroundBrightness": "light"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/trello/boards",
            json=create_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert create_response.status_code in (200, 201), f"Unexpected create board status: {create_response.status_code}"
        created_board = create_response.json()
        created_board_id = created_board.get("id")
        assert created_board_id is not None, "Created board ID is missing in the create board response"

        # Step 2: Update the board with new details
        update_payload = {
            "name": f"Updated Board Name {uuid.uuid4()}",
            "desc": "Updated description to verify changes",
            "prefs_permissionLevel": "org",
            "prefs_background": "green",
            "prefs_backgroundBrightness": "dark"
        }
        update_response = requests.put(
            f"{BASE_URL}/api/trello/boards/{created_board_id}",
            json=update_payload,
            headers=headers,
            timeout=TIMEOUT
        )

        # Handle potential status codes including rate limiting and errors
        if update_response.status_code == 429:
            # Rate limit hit, wait and retry once
            retry_after = update_response.json().get("retryAfter", 5)
            time.sleep(retry_after)
            update_response = requests.put(
                f"{BASE_URL}/api/trello/boards/{created_board_id}",
                json=update_payload,
                headers=headers,
                timeout=TIMEOUT
            )

        # Validate successful update or proper error handling
        assert update_response.status_code == 200, f"Unexpected update board status: {update_response.status_code}"

        updated_board = update_response.json()
        # Validate that the response reflects the updated changes
        assert updated_board.get("name") == update_payload["name"], "Board name was not updated correctly"
        assert updated_board.get("desc") == update_payload["desc"], "Board description was not updated correctly"
        prefs = updated_board.get("prefs") or {}
        assert prefs.get("permissionLevel") == update_payload["prefs_permissionLevel"], "Permission level not updated"
        assert prefs.get("background") == update_payload["prefs_background"], "Background not updated"
        assert prefs.get("backgroundBrightness") == update_payload["prefs_backgroundBrightness"], "Background brightness not updated"

        # Step 3: Test error handling for invalid boardId
        invalid_board_id = "invalid-board-id-12345"
        invalid_response = requests.put(
            f"{BASE_URL}/api/trello/boards/{invalid_board_id}",
            json=update_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert invalid_response.status_code in (400,404), "Expected 400 or 404 for invalid board ID"

    finally:
        # Clean up: delete the created board if exists
        if created_board_id:
            try:
                del_response = requests.delete(
                    f"{BASE_URL}/api/trello/boards/{created_board_id}",
                    headers=headers,
                    timeout=TIMEOUT
                )
                # Accept 200 or 204 as success
                assert del_response.status_code in (200, 204), f"Failed to delete test board {created_board_id}"
            except Exception:
                pass

put_api_trello_boards_boardid_should_update_board()
