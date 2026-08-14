import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';

const GoogleButton = ({ next = '/dashboard' }: { next?: string }) => {
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    try {
      // Remember the intended destination; the OAuth redirect must be a public origin URL.
      if (next.startsWith('/')) sessionStorage.setItem('paperpetal.next', next);
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error('เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      window.location.href = next;
    } catch {
      toast.error('เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={signIn}
      disabled={busy}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-elevated text-sm font-ui font-bold transition-colors hover:bg-accent disabled:opacity-60"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.2h6.6c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.7-5 3.7-8.7z" />
          <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.8-2.9l-3.7-2.9c-1 .7-2.3 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5l-.1.1-3.6 2.8-.1.1C3.4 21.3 7.4 24 12 24z" />
          <path fill="#FBBC05" d="M5.3 14.4A7.4 7.4 0 0 1 4.9 12c0-.8.2-1.7.4-2.4l-.1-.2L1.5 6.6l-.1.1A12 12 0 0 0 0 12c0 1.9.5 3.8 1.4 5.4l3.9-3z" />
          <path fill="#EA4335" d="M12 4.7c2.2 0 3.7.9 4.6 1.7l3.3-3.2C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.6l3.9 3c.9-2.8 3.6-4.9 6.7-4.9z" />
        </svg>
      )}
      Continue with Google
    </button>
  );
};

export default GoogleButton;
