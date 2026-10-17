"use client";

import { DropdownMenu } from "radix-ui";
import { Keyboard, LifeBuoy, LogOut, Monitor, Moon, Settings, Sun, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme, type ThemePreference } from "@/components/providers/theme-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Avatar } from "@/components/ui/avatar";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { currentUser } from "@/data/user";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

const themes: { value: ThemePreference; label: string; icon: React.ElementType }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function UserMenu({ onShowShortcuts }: { onShowShortcuts: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const { preference, setTheme } = useTheme();

  const logout = () => {
    signOut();
    toast({ title: "Signed out", description: "See you soon, Deep.", tone: "info" });
    router.replace("/");
    router.refresh();
  };

  return (
    <Menu>
      <MenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="flex items-center gap-2 rounded-full p-0.5 transition-shadow hover:ring-4 hover:ring-accent-soft data-[state=open]:ring-4 data-[state=open]:ring-accent-soft"
        >
          <Avatar initials={currentUser.initials} hue={348} size="sm" />
        </button>
      </MenuTrigger>
      <MenuContent className="w-64">
        <div className="flex items-center gap-3 px-2.5 py-2.5">
          <Avatar initials={currentUser.initials} hue={348} size="md" />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold text-fg">{currentUser.name}</p>
            <p className="truncate text-[12px] text-muted">{currentUser.email}</p>
          </div>
        </div>
        <MenuSeparator />
        <MenuItem asChild>
          <Link href="/settings">
            <UserRound /> Profile
          </Link>
        </MenuItem>
        <MenuItem asChild>
          <Link href="/settings">
            <Settings /> Workspace settings
          </Link>
        </MenuItem>
        <MenuItem onSelect={onShowShortcuts}>
          <Keyboard /> Keyboard shortcuts
        </MenuItem>
        <MenuItem asChild>
          <Link href="/support">
            <LifeBuoy /> Help & support
          </Link>
        </MenuItem>
        <MenuSeparator />
        <MenuLabel>Appearance</MenuLabel>
        <DropdownMenu.RadioGroup value={preference} onValueChange={(v) => setTheme(v as ThemePreference)} className="grid grid-cols-3 gap-1 px-1 pb-1">
          {themes.map((t) => (
            <DropdownMenu.RadioItem
              key={t.value}
              value={t.value}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-transparent py-2 text-[11.5px] font-medium text-muted outline-none data-[highlighted]:bg-surface-2 data-[state=checked]:border-line data-[state=checked]:bg-surface-2 data-[state=checked]:text-fg",
              )}
            >
              <t.icon className="size-4" aria-hidden />
              {t.label}
            </DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
        <MenuSeparator />
        <MenuItem onSelect={logout} className="text-danger data-[highlighted]:text-danger [&_svg]:text-danger">
          <LogOut /> Sign out
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
