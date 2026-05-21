To set up admin credentials for the Control Panel:

Go to Supabase Dashboard → Authentication → Users → Add user (enter email + password)
Then in SQL Editor, run:

UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
Log in at /auth/login — you'll be redirected to /admin. The Control Panel at /control-panel requires the same admin/pastor role and is protected by the same middleware.



