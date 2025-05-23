import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test Supabase connection by getting a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        message: 'Supabase query failed', 
        error: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection successful', 
      data 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing Supabase', 
      error: error.message 
    }, { status: 500 });
  }
} 