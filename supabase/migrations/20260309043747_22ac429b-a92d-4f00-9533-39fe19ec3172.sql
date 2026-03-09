-- Add foreign key from posts.user_id to profiles.user_id for joins
ALTER TABLE public.posts 
ADD CONSTRAINT posts_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- Add foreign key from comments.user_id to profiles.user_id for joins
ALTER TABLE public.comments 
ADD CONSTRAINT comments_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;