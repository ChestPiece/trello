import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_delete_api_trello_boards_boardid_should_delete_board():
    """
    Test the /api/trello/boards/{boardId} DELETE endpoint to delete a board.
    Confirm board is removed and appropriate response is returned.
    
    This test creates a board, deletes it, and verifies that it no longer exists.
    It also tests error handling for deleting a non-existent board.
    """
    headers = {
        "Content-Type": "application/json"
    }

    board_id = None
    try:
        # Step 1: Create a new board to delete later
        create_payload = {
            "name": f"Test Board {uuid.uuid4()}",
            "desc": "Board created for delete test",
            "defaultLists": False,
            "defaultLabels": False,
            "defaultCards": False,
            "prefs_permissionLevel": "private",
            "prefs_background": "blue",
            "prefs_backgroundBrightness": "light"
        }
        create_resp = requests.post(
            f"{BASE_URL}/api/trello/boards",
            json=create_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert create_resp.status_code in (200, 201), f"Unexpected status code on board creation: {create_resp.status_code}"
        create_data = create_resp.json()
        board_id = create_data.get("id")
        assert board_id, "No board ID returned on creation"

        # Step 2: Delete the created board
        delete_resp = requests.delete(
            f"{BASE_URL}/api/trello/boards/{board_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        assert delete_resp.status_code in (200, 204), f"Failed to delete board with id {board_id}, status: {delete_resp.status_code}"

        # Step 3: Verify the board is deleted by trying to GET it
        get_resp = requests.get(
            f"{BASE_URL}/api/trello/boards/{board_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        # Expecting 404 or error status since board should be deleted
        assert get_resp.status_code == 404 or get_resp.status_code == 400, f"Deleted board still accessible, status: {get_resp.status_code}"

        # Step 4: Test error handling for deleting non-existent board
        fake_board_id = "nonexistent-board-id-12345"
        invalid_delete_resp = requests.delete(
            f"{BASE_URL}/api/trello/boards/{fake_board_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        # Should return 404 or 400 or appropriate error code for invalid deletion
        assert invalid_delete_resp.status_code in (400, 404), f"Unexpected status code when deleting invalid board: {invalid_delete_resp.status_code}"
    finally:
        # Cleanup - just in case board not deleted
        if board_id:
            try:
                requests.delete(
                    f"{BASE_URL}/api/trello/boards/{board_id}",
                    headers=headers,
                    timeout=TIMEOUT
                )
            except Exception:
                pass

test_delete_api_trello_boards_boardid_should_delete_board()
