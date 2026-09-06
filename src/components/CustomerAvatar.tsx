import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * Every customer shows the same default avatar — the app doesn't collect
 * a customer photo, so this is a fixed image rather than a per-customer
 * upload (unlike store logos/product images/QR codes).
 */
export function CustomerAvatar({ size, className }: { size?: "default" | "sm" | "lg"; className?: string }) {
  return (
    <Avatar size={size} className={cn(className)}>
      <AvatarImage src="/images/default-customer-avatar.svg" alt="" />
      <AvatarFallback>K</AvatarFallback>
    </Avatar>
  );
}
