"use client";

import { DropdownMenu, Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const panel =
  "z-[80] min-w-48 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-lg outline-none data-[state=open]:animate-[menu-in_160ms_cubic-bezier(0.16,1,0.3,1)]";

export const Menu = DropdownMenu.Root;
export const MenuTrigger = DropdownMenu.Trigger;

export function MenuContent({ className, align = "end", sideOffset = 8, ...props }: React.ComponentProps<typeof DropdownMenu.Content>) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content align={align} sideOffset={sideOffset} className={cn(panel, className)} {...props} />
    </DropdownMenu.Portal>
  );
}

export function MenuItem({ className, inset, ...props }: React.ComponentProps<typeof DropdownMenu.Item> & { inset?: boolean }) {
  return (
    <DropdownMenu.Item
      className={cn(
        "flex h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-fg-2 outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-surface-2 data-[highlighted]:text-fg [&_svg]:size-4 [&_svg]:text-muted",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  );
}

export function MenuLabel({ className, ...props }: React.ComponentProps<typeof DropdownMenu.Label>) {
  return <DropdownMenu.Label className={cn("px-2.5 pt-2 pb-1 text-[11px] font-medium tracking-wide text-subtle uppercase", className)} {...props} />;
}

export function MenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenu.Separator>) {
  return <DropdownMenu.Separator className={cn("my-1 h-px bg-line", className)} {...props} />;
}

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverClose = PopoverPrimitive.Close;

export function PopoverContent({ className, align = "end", sideOffset = 8, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content align={align} sideOffset={sideOffset} collisionPadding={12} className={cn(panel, "p-0", className)} {...props} />
    </PopoverPrimitive.Portal>
  );
}
