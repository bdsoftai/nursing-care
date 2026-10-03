import { IDatabaseAdapter } from './types';
import { SupabaseAdapter } from './supabase';

// 🔑 Environment variable দিয়ে adapter choose হবে
function getAdapter(): IDatabaseAdapter {
    const provider = process.env.DATABASE_PROVIDER ?? 'supabase';

    switch (provider) {
        case 'supabase':
            return new SupabaseAdapter();

        // case 'mongodb':
        //   return new MongoAdapter();

        // case 'laravel':
        //   return new LaravelAdapter();

        default:
            throw new Error(`Unknown database provider: ${provider}`);
    }
}

// Singleton — একবার তৈরি, সব জায়গায় reuse
let adapter: IDatabaseAdapter | null = null;

export function db(): IDatabaseAdapter {
    if (!adapter) adapter = getAdapter();
    return adapter;
}