import { createClient } from '@supabase/supabase-js';
import { Client } from '../types';

const supabaseUrl = 'https://mpaelpzhxyuxowlphrbb.supabase.co';
const supabaseAnonKey = 'sb_publishable_mnQBizZcqfJpJ0wluNNp1Q_2_GmfXEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const STORE_ID = 'pressure-cooker-crm-data';

export async function fetchClientsFromCloud(): Promise<Client[] | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', STORE_ID)
      .single();

    if (error || !data || !data.keywords || !data.keywords[0]) {
      return null;
    }

    const clients: Client[] = JSON.parse(data.keywords[0]);
    return Array.isArray(clients) ? clients : null;
  } catch (err) {
    console.error('Error fetching clients from cloud:', err);
    return null;
  }
}

export async function saveClientsToCloud(clients: Client[]): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(clients);
    const { error } = await supabase.from('products').upsert({
      id: STORE_ID,
      name: '__PRESSURE_COOKER_CRM_STORE__',
      keywords: [jsonString],
    });

    if (error) {
      console.error('Error saving clients to cloud:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving clients to cloud:', err);
    return false;
  }
}
