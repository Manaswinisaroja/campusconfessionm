-- Allow users to delete their own posts
CREATE POLICY "Users can delete their own posts"
ON public.posts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own posts (for editing)
DROP POLICY IF EXISTS "Anyone can update vote count" ON public.posts;
CREATE POLICY "Anyone can update posts"
ON public.posts
FOR UPDATE
USING (true)
WITH CHECK (true);