#!/usr/bin/env node

/**
 * Simple API Route Test Script
 * Tests basic functionality of Trello API routes
 */

const BASE_URL = "http://localhost:3000";

async function testAPIEndpoint(method, endpoint, data = null) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(`Testing ${method} ${endpoint}...`);
    const response = await fetch(url, options);
    const result = await response.json();

    if (response.ok) {
      console.log(`✅ ${method} ${endpoint} - Success`);
      return { success: true, data: result };
    } else {
      console.log(
        `❌ ${method} ${endpoint} - Error: ${result.error || "Unknown error"}`
      );
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log("🧪 Starting API Route Tests...\n");

  const tests = [
    // Test GET endpoints
    { method: "GET", endpoint: "/api/boards" },
    { method: "GET", endpoint: "/api/workspaces" },

    // Test POST endpoints (these will fail without proper data, but we can test the structure)
    {
      method: "POST",
      endpoint: "/api/boards",
      data: { name: "Test Board", description: "Test Description" },
    },
    {
      method: "POST",
      endpoint: "/api/workspaces",
      data: { displayName: "Test Workspace" },
    },
  ];

  const results = [];
  for (const test of tests) {
    const result = await testAPIEndpoint(test.method, test.endpoint, test.data);
    results.push({ ...test, result });
  }

  console.log("\n📊 Test Results Summary:");
  const successCount = results.filter((r) => r.result.success).length;
  const totalCount = results.length;

  console.log(`✅ Passed: ${successCount}/${totalCount}`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);

  if (successCount === totalCount) {
    console.log("\n🎉 All tests passed!");
  } else {
    console.log("\n⚠️  Some tests failed. Check the output above for details.");
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAPIEndpoint, runTests };

