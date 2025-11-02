# 🚀 Supabase Setup Guide for Easy Go

This guide will help you set up Supabase authentication for the Easy Go project.

## 📋 Prerequisites

- A Supabase account (free tier is fine)
- Your Easy Go project running locally

---

## 🔧 Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign In"
3. Create a new account or sign in with GitHub
4. Click "New Project"
5. Fill in the project details:
   - **Project Name**: `easy-go` (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users (Spain for IONOS)
   - **Pricing Plan**: Free tier is sufficient to start

6. Click "Create new project"
7. Wait 2-3 minutes for the project to be ready

---

## 🔑 Step 2: Get Your API Credentials

1. Once your project is ready, go to **Settings** (⚙️ icon in sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:

### Project URL
```
https://your-project-id.supabase.co
```

### Anon (public) Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```

**⚠️ Important**: Keep these credentials safe!

---

## 📝 Step 3: Configure Environment Variables

1. Open your Easy Go project
2. Find the `.env.local` file in the root directory
3. Replace the placeholder values with your actual credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Save the file
5. Restart your development server:
```bash
npm run dev
```

---

## 📧 Step 4: Configure Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Email** provider (should be enabled by default)
3. Configure the following settings:

### Email Templates
Go to **Authentication** → **Email Templates**

#### Confirm Signup Template
- **Subject**: `Confirm Your Email - Easy Go`
- You can customize the email body if desired

#### Reset Password Template  
- **Subject**: `Reset Your Password - Easy Go`
- You can customize the email body if desired

### Site URL Configuration
1. Go to **Authentication** → **URL Configuration**
2. Add your site URLs:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: 
     - `http://localhost:5173/**`
     - `http://localhost:5173/dashboard`

**For Production**: Update these URLs to your actual domain (e.g., `https://easygo.com`)

---

## 🔒 Step 5: Configure Row Level Security (RLS)

Supabase automatically creates an `auth.users` table that's secure by default.

If you plan to add custom user data tables, here's an example:

### Create a Profiles Table

1. Go to **Table Editor** in Supabase dashboard
2. Click "Create a new table"
3. Name it `profiles`
4. Add columns:
   - `id` (uuid, primary key) - references auth.users
   - `email` (text)
   - `full_name` (text)
   - `avatar_url` (text)
   - `created_at` (timestamp)

5. Enable RLS by running this SQL in **SQL Editor**:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);
```

---

## ✅ Step 6: Test Your Setup

1. Make sure your dev server is running:
```bash
npm run dev
```

2. Open `http://localhost:5173`

3. Try to **Sign Up**:
   - Click "Sign In" in the navbar
   - Click "Sign Up"
   - Enter an email and password
   - Click "Create Account"
   - Check your email for verification link

4. Try to **Sign In**:
   - Enter your credentials
   - Click "Sign In"
   - You should be redirected to `/dashboard`

5. Try **Sign Out**:
   - Click "Sign Out" button
   - You should be redirected to home

---

## 🔍 Troubleshooting

### Issue: "Invalid API credentials"
**Solution**: Double-check your `.env.local` file. Make sure:
- No extra spaces
- Correct URL format
- Complete anon key (it's very long!)

### Issue: "Email not sent"
**Solution**: 
- Check Supabase email settings
- For development, Supabase has rate limits
- Check your spam folder
- View emails in Supabase Dashboard → Authentication → Users → Email

### Issue: Can't see environment variables
**Solution**:
- Restart your dev server after changing `.env.local`
- Make sure file is named exactly `.env.local`
- Variables must start with `VITE_`

### Issue: "User already registered"
**Solution**:
- Go to Supabase Dashboard → Authentication → Users
- Delete the test user
- Try again

---

## 🚀 Production Deployment

When deploying to production:

1. **Update Site URLs** in Supabase:
   - Go to Authentication → URL Configuration
   - Add your production domain
   - Example: `https://easygo.com`

2. **Add Environment Variables** to your hosting provider:
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`

3. **Enable Email Provider Settings**:
   - Configure custom SMTP (optional)
   - Set up custom email domain (optional)

---

## 📊 Database Structure

### Default Tables (Managed by Supabase)

#### `auth.users`
- Managed automatically by Supabase
- Contains: id, email, encrypted_password, email_confirmed_at, etc.
- **Do NOT modify this table directly**

### Custom Tables (Optional)

You can create additional tables for:
- User profiles
- User-generated websites
- Templates
- Projects
- etc.

**Remember**: Always enable RLS on custom tables!

---

## 🔐 Security Best Practices

1. ✅ **Never commit `.env.local`** to git
2. ✅ Use Row Level Security (RLS) on all tables
3. ✅ Keep your anon key public-safe (it's meant to be public)
4. ✅ Never expose your `service_role` key in frontend
5. ✅ Enable email verification for production
6. ✅ Set up proper CORS in production
7. ✅ Use HTTPS in production

---

## 📚 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [React Integration Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🆘 Need Help?

- Check [Supabase Discord](https://discord.supabase.com)
- Check [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)
- Review the console logs in your browser

---

**✅ You're all set!** Your Easy Go app now has full authentication powered by Supabase.
