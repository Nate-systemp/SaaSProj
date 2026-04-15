-- ══════════════════════════════════════════════
-- ACTIVITY LOG TABLE
-- Tracks task events for the sidebar feed
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID REFERENCES public.boards ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'moved', 'updated', 'deleted')),
  task_title TEXT NOT NULL,
  from_status TEXT DEFAULT NULL,
  to_status TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_activity_board_id ON public.activity_log(board_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.activity_log(created_at DESC);

-- Row Level Security
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON public.activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own activity"
  ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
