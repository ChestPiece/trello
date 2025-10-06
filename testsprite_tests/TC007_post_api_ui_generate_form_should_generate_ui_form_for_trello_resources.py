import requests
import json

BASE_URL = "http://localhost:3000"
GENERATE_FORM_ENDPOINT = f"{BASE_URL}/api/ui/generate-form"
TIMEOUT = 30

def test_post_api_ui_generate_form_should_generate_ui_form_for_trello_resources():
    headers = {
        "Content-Type": "application/json",
    }

    resource_types = [
        "board",
        "list",
        "card",
        "workspace",
        "label",
        "attachment",
        "checklist"
    ]
    actions = ["create", "update", "delete"]

    # Test successful form generation for all resource types and actions
    for resource_type in resource_types:
        for action in actions:
            payload = {
                "resourceType": resource_type,
                "action": action
            }
            try:
                response = requests.post(GENERATE_FORM_ENDPOINT, headers=headers, json=payload, timeout=TIMEOUT)
            except requests.RequestException as e:
                assert False, f"Request failed for resourceType={resource_type}, action={action} with exception: {e}"

            # Validate response status code
            assert response.status_code == 200, (
                f"Expected status code 200 but got {response.status_code} "
                f"for resourceType={resource_type}, action={action}, response text: {response.text}"
            )

            try:
                response_json = response.json()
            except json.JSONDecodeError:
                assert False, f"Response is not valid JSON for resourceType={resource_type}, action={action}"

            # Validate keys in response
            assert "formComponent" in response_json, (
                f"'formComponent' key missing in response for resourceType={resource_type}, action={action}"
            )
            assert isinstance(response_json["formComponent"], str) and len(response_json["formComponent"].strip()) > 0, (
                f"'formComponent' must be non-empty string for resourceType={resource_type}, action={action}"
            )

            assert "metadata" in response_json, (
                f"'metadata' key missing in response for resourceType={resource_type}, action={action}"
            )
            assert isinstance(response_json["metadata"], dict), (
                f"'metadata' must be an object/dict for resourceType={resource_type}, action={action}"
            )

    # Test error handling for invalid input: missing resourceType
    invalid_payloads = [
        {"action": "create"},
        {"resourceType": "invalid_resource", "action": "create"},
        {"resourceType": "board", "action": "invalid_action"},
        {},  # empty payload
        {"resourceType": None, "action": None},
    ]
    for invalid_payload in invalid_payloads:
        try:
            response = requests.post(GENERATE_FORM_ENDPOINT, headers=headers, json=invalid_payload, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request failed for invalid payload {invalid_payload} with exception: {e}"

        # Expect 4xx error (likely 400)
        assert response.status_code >= 400 and response.status_code < 500, (
            f"Expected 4xx status code for invalid payload {invalid_payload} but got {response.status_code}"
        )

    # Test rate limiting handling by simulating multiple rapid calls
    # Only test if response 429 occurs; do not cause actual DoS
    try:
        for _ in range(20):
            response = requests.post(GENERATE_FORM_ENDPOINT, headers=headers,
                                     json={"resourceType": "board", "action": "create"}, timeout=TIMEOUT)
            if response.status_code == 429:
                # Validate presence of retryAfter and error fields if json response
                try:
                    json_resp = response.json()
                except Exception:
                    assert False, "429 response is not valid JSON"

                assert "retryAfter" in json_resp, "'retryAfter' missing in 429 response"
                assert "error" in json_resp, "'error' missing in 429 response"
                break
        else:
            # If no 429 received after 20 requests, that's acceptable (server may not rate limit aggressively)
            pass
    except requests.RequestException as e:
        assert False, f"Request exception during rate limiting test: {e}"

test_post_api_ui_generate_form_should_generate_ui_form_for_trello_resources()