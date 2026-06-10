const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
let url = '';
let key = '';

try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  url = (envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/) || [])[1] || '';
  key = (envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*["']?([^"'\r\n]+)["']?/) || [])[1] || '';
} catch (e) {
  console.error("Could not read .env file:", e);
}

const supabase = createClient(url, key);

async function testInsert() {
  const testId = '00000000-0000-0000-0000-' + Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
  const record = {
    id: testId,
    user_id: 'd9b736b0-745a-4934-8c8f-e9d6ef6ba67e', // dummy or valid user id format
    original_file_url: 'https://example.com/test.jpg',
    original_file_name: 'test.jpg',
    status: 'pending_review',
    invoice_date: { value: '10/06/2026', confidence: 'high' },
    invoice_number: { value: 'TEST-INV-999', confidence: 'high' },
    vendor_name: { value: 'Test Vendor LLC', confidence: 'high' },
    vendor_tax_code: { value: '1234567890', confidence: 'high' },
    vat_rate: { value: 10, confidence: 'high' },
    subtotal: { value: 100000, confidence: 'high' },
    vat_amount: { value: 10000, confidence: 'high' },
    total: { value: 110000, confidence: 'high' },
    notes: { value: 'Test notes', confidence: 'high' },
    needs_review: false,
    is_demo: true
  };

  try {
    console.log("Attempting insert with JSON objects...");
    const { data: insertData, error: insertError } = await supabase
      .from('invoices')
      .insert([record])
      .select();

    if (insertError) {
      console.log("Insert failed with JSON objects:", insertError.message || insertError);
      
      // Try with flat fields
      console.log("\nAttempting insert with flat primitive values...");
      const flatRecord = {
        id: testId,
        user_id: 'd9b736b0-745a-4934-8c8f-e9d6ef6ba67e',
        original_file_url: 'https://example.com/test.jpg',
        original_file_name: 'test.jpg',
        status: 'pending_review',
        invoice_date: '10/06/2026',
        invoice_number: 'TEST-INV-999',
        vendor_name: 'Test Vendor LLC',
        vendor_tax_code: '1234567890',
        vat_rate: 10,
        subtotal: 100000,
        vat_amount: 10000,
        total: 110000,
        notes: 'Test notes',
        needs_review: false,
        is_demo: true
      };
      const { data: flatInsertData, error: flatInsertError } = await supabase
        .from('invoices')
        .insert([flatRecord])
        .select();

      if (flatInsertError) {
        console.error("Insert failed with flat fields as well:", flatInsertError.message || flatInsertError);
      } else {
        console.log("Insert Success with flat fields:", JSON.stringify(flatInsertData, null, 2));
      }
    } else {
      console.log("Insert Success with JSON objects:", JSON.stringify(insertData, null, 2));
    }
  } catch (error) {
    console.error("Unexpected Error:", error);
  }
}

testInsert();
