import { Request } from 'express';
import { User } from '@supabase/supabase-js';

// Request yang membawa properti user bertipe SafeUser
export interface RequestWithUser extends Request {
  user?: User;
}
