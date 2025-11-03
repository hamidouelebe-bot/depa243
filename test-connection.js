/**
 * Database Connection Test Script
 * Run this with: node test-connection.js
 */

import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Polyfill WebSocket for Node.js
if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws;
}

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const databaseUrl = process.env.VITE_DATABASE_URL;

console.log('🔍 Testing Neon Database Connection...\n');

if (!databaseUrl) {
  console.error('❌ ERROR: VITE_DATABASE_URL is not set in .env file');
  console.log('   Please make sure you have a .env file with:');
  console.log('   VITE_DATABASE_URL=postgresql://...\n');
  process.exit(1);
}

console.log('✓ Environment variable found');
console.log(`✓ Database URL: ${databaseUrl.substring(0, 40)}...\n`);

async function testConnection() {
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    console.log('🔌 Attempting to connect to database...');
    
    // Test 1: Simple query
    console.log('\n📊 Test 1: Running simple query...');
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connection successful!');
    console.log(`   Server time: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL: ${result.rows[0].pg_version.split(' ')[1]}`);
    
    // Test 2: Check if tables exist
    console.log('\n📊 Test 2: Checking database schema...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tables.rows.length === 0) {
      console.log('⚠️  No tables found - you need to run the schema SQL');
      console.log('   Run the contents of neon-schema.sql in your Neon SQL Editor');
    } else {
      console.log(`✅ Found ${tables.rows.length} tables:`);
      tables.rows.forEach(t => console.log(`   - ${t.table_name}`));
      
      // Test 3: Count records in tables
      console.log('\n📊 Test 3: Checking table data...');
      const expectedTables = ['technicians', 'reviews', 'users', 'site_settings'];
      
      for (const tableName of expectedTables) {
        const tableExists = tables.rows.some(t => t.table_name === tableName);
        if (tableExists) {
          const count = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`   - ${tableName}: ${count.rows[0].count} records`);
        }
      }
    }
    
    console.log('\n✅ All tests passed! Your database connection is working perfectly! 🎉\n');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error details:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Tip: Check that your connection string has the correct password');
    } else if (error.message.includes('no such host')) {
      console.log('\n💡 Tip: Check that your connection string has the correct hostname');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Tip: Check your internet connection');
    }
    
    console.log('\n');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
