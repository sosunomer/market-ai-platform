import { createClient } from "@supabase/supabase-js";

// Database tipi src/types/database.ts'de tanımlıdır.
// Supabase projesine bağlandıktan sonra `supabase gen types typescript` ile
// otomatik oluşturulan tipleri kullanabilirsiniz:
//   import type { Database } from "@/types/database";
//   createClient<Database>(...)

/**
 * Supabase istemci tarafı istemcisi.
 * Tarayıcıda çalışan bileşenlerden güvenli okuma işlemleri için kullanılır.
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL ve Anon Key tanımlanmalıdır.");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Supabase sunucu tarafı istemcisi.
 * API route'ları ve Server Component'lerde tam yetki ile kullanılır.
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase URL ve Service Role Key tanımlanmalıdır.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
