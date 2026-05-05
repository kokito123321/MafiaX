#!/usr/bin/env node

/**
 * Mafia Video Chat - Backend Setup Test Script
 * Run this script to verify all configurations are working
 */

const { Pool } = require('pg');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Mkvdarilana32145@db.uulexfrpvydusifwixxy.supabase.co:5432/postgres'
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database query successful:', result.rows[0].current_time);
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

function testEnvironmentVariables() {
  console.log('🔍 Checking environment variables...');
  
  const required = [
    'DATABASE_URL',
    'LIVEKIT_URL',
    'LIVEKIT_API_KEY',
    'LIVEKIT_API_SECRET',
    'PORT'
  ];

  let allSet = true;
  
  required.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: SET`);
    } else {
      console.log(`❌ ${varName}: NOT SET`);
      allSet = false;
    }
  });

  return allSet;
}

function testLiveKitConfig() {
  console.log('🔍 Testing LiveKit configuration...');
  
  const url = process.env.LIVEKIT_URL || 'wss://mafiax-a4cmo105.livekit.cloud';
  const apiKey = process.env.LIVEKIT_API_KEY || 'APIYri54qd9xj2r';
  const secret = process.env.LIVEKIT_API_SECRET || '3QBRxzI3NAfHkkMjAwOjbuf7bR0RplgOfhfAO201z64B';
  
  if (url.startsWith('wss://')) {
    console.log('✅ LiveKit URL format is correct');
  } else {
    console.log('❌ LiveKit URL format is incorrect');
    return false;
  }
  
  if (apiKey && secret) {
    console.log('✅ LiveKit credentials are set');
  } else {
    console.log('❌ LiveKit credentials missing');
    return false;
  }
  
  return true;
}

async function runTests() {
  console.log('🚀 Starting Mafia Video Chat Backend Setup Tests\n');
  
  const envOk = testEnvironmentVariables();
  const livekitOk = testLiveKitConfig();
  const dbOk = await testDatabaseConnection();
  
  console.log('\n📊 Test Results:');
  console.log(`Environment Variables: ${envOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`LiveKit Config: ${livekitOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Database Connection: ${dbOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (envOk && livekitOk && dbOk) {
    console.log('\n🎉 All tests passed! Backend is ready for deployment.');
    process.exit(0);
  } else {
    console.log('\n💥 Some tests failed. Please check the configuration.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
