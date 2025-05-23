# Not a Label - Supabase Integration Guide

This guide will help you complete the Supabase integration for the Not a Label platform.

## 1. Environment Setup

### Update your .env.local file

Your `.env.local` file should contain the following variables:

```
# Supabase Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://qdyzrstyewetngfcftlf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# API URL (legacy - will be deprecated once fully migrated to Supabase)
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Replace `your-anon-key-here` with the "anon" key from your Supabase project's API settings page.

## 2. Database Schema Setup

1. Go to your [Supabase SQL Editor](https://qdyzrstyewetngfcftlf.supabase.co/project/sql)
2. Copy the entire contents of `supabase-schema.sql`
3. Paste it into the SQL editor and execute it to create:
   - `profiles` table - User profile information
   - `artist_profiles` table - Artist-specific profile data
   - `streams` table - Music streaming analytics
   - `analytics_data` table - Platform analytics
   - `ai_history` table - AI assistant conversation history
4. Verify the tables were created by checking the "Table Editor" section

## 3. Row Level Security (RLS) Policies

RLS policies protect your data by ensuring users can only access what they're allowed to.

1. Go to your [Supabase SQL Editor](https://qdyzrstyewetngfcftlf.supabase.co/project/sql)
2. Copy the contents of `supabase-rls-policies.sql`
3. Execute the SQL to apply security policies

## 4. Storage Setup

1. Go to the [Supabase Storage](https://qdyzrstyewetngfcftlf.supabase.co/project/storage/buckets) section
2. Create two buckets:
   - `avatars` (for profile pictures)
   - `banners` (for artist banner images)
3. Set both buckets to "private" access

4. Add RLS policies for storage by running this SQL:

```sql
-- Avatar policies
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'avatars'
);

-- Banner policies
CREATE POLICY "Artists can upload their own banners"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'banners' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view banners"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'banners'
);
```

## 5. Email Template Setup

1. Go to [Authentication > Email Templates](https://qdyzrstyewetngfcftlf.supabase.co/project/auth/templates)
2. Edit the "Confirm signup" template
3. Change `{{ .ConfirmationURL }}` to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

## 6. Testing the Integration

1. Start the Next.js development server:
   ```
   npm run dev
   ```

2. Visit `http://localhost:3000/supabase-test` to test your integration

3. Test the authentication flow:
   - Register a new user
   - Confirm your email (if required)
   - Log in with the new account
   - View your profile information

4. Check the Supabase dashboard to verify:
   - User appears in Authentication > Users
   - Records are created in the database tables
   - Files are uploaded to storage buckets (if testing profile uploads)

## 7. Troubleshooting

### Redis Connection Errors
If you see Redis connection errors in the console, don't worry. These are from the legacy system and don't affect the Supabase integration.

### Auth Issues
- Verify your Supabase URL and anon key are correct in `.env.local`
- Make sure you've updated the email templates in Supabase
- Check that the auth confirmation route is properly set up

### Database Issues
- Verify the SQL schema was executed correctly
- Check RLS policies if you're getting permission errors
- Use the Supabase dashboard to inspect the database structure

### Storage Issues
- Verify both buckets exist and have the correct RLS policies
- Check that file uploads use the correct user ID as the folder structure

## 8. Next Steps

After completing the Supabase integration:

1. Test all features that use Supabase (auth, profiles, file uploads)
2. Remove any legacy code that's no longer needed
3. Update documentation to reflect the new Supabase integration
4. Consider deploying to Vercel with Supabase environment variables

## Resources

- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage) 