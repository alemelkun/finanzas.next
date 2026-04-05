import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://aumtwkclvqauivqvcnmk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1bXR3a2NsdnFhdWl2cXZjbm1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzg0OTgsImV4cCI6MjA5MDkxNDQ5OH0.MQN-2IKMLYLy-3Fj5foowNDPe_xpQjzMmtUFKJ-0vcc'
)