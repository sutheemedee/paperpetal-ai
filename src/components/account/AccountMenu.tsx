import { Link } from 'react-router-dom';
import { CreditCard, FolderOpen, LogOut, Shield, Sparkles, User } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/auth/AuthProvider';

const AccountMenu = () => {
  const { user, profile, account, isAdmin, signOut } = useAuth();

  if (!user) {
    return (
      <Link to="/auth/sign-in" className="flex min-h-11 items-center rounded-full border border-border px-4 text-xs font-ui font-bold">
        เข้าสู่ระบบ
      </Link>
    );
  }

  const initial = (profile?.display_name || user.email || 'U').charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-11 items-center gap-2 rounded-full border border-border bg-card px-2 pr-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-ai text-xs font-ui font-bold text-primary-foreground">
          {initial}
        </span>
        <span className="hidden max-w-[100px] truncate text-xs font-ui font-bold sm:block">
          {profile?.display_name || user.email}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-ui text-xs">
          <span className="block truncate">{user.email}</span>
          <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
            แผน {account?.planName ?? 'Free Trial'}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/projects" className="flex items-center gap-2 text-xs font-ui"><FolderOpen className="h-4 w-4" /> โปรเจกต์ของฉัน</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/billing" className="flex items-center gap-2 text-xs font-ui"><CreditCard className="h-4 w-4" /> บัญชี & การชำระเงิน</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/pricing" className="flex items-center gap-2 text-xs font-ui"><Sparkles className="h-4 w-4" /> อัปเกรดแผน</Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="flex items-center gap-2 text-xs font-ui"><Shield className="h-4 w-4" /> Admin Console</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-xs font-ui text-destructive">
          <LogOut className="h-4 w-4" /> ออกจากระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountMenu;
