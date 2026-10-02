#!/usr/bin/env node

/**
 * Simple test script to verify Worker deployment
 * Run: node test-worker.js
 */

const WORKER_URL = process.env.WORKER_URL || 'http://localhost:8787';

async function test(name, url, options = {}) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);

    if (response.ok) {
      console.log('   ✅ PASS');
    } else {
      console.log('   ❌ FAIL');
    }

    return response.ok;
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log(`\n🚀 Bikehouse Lein Worker Tests`);
  console.log(`📍 Testing against: ${WORKER_URL}\n`);

  const results = [];

  // Test 1: Health check
  results.push(
    await test('Health Check', `${WORKER_URL}/api/health`)
  );

  // Test 2: Availability check
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateString = tomorrow.toISOString().split('T')[0];

  results.push(
    await test('Availability Check', `${WORKER_URL}/api/availability?date=${dateString}`)
  );

  // Test 3: Invalid date
  results.push(
    await test('Invalid Date Error', `${WORKER_URL}/api/availability?date=invalid`)
  );

  // Test 4: Invalid endpoint
  results.push(
    await test('Invalid Endpoint', `${WORKER_URL}/api/invalid`, { expectError: true })
  );

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`\n📊 Test Summary: ${passed}/${total} passed`);

  if (passed === total) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

runTests();
