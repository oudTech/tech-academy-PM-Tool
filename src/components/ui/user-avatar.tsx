import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  className?: string;
}

export function UserAvatar({ src, className }: UserAvatarProps) {
  const validSrc = src && !src.includes("dicebear") ? src : undefined;
  return (
    <Avatar className={className}>
      {validSrc && <AvatarImage src={validSrc} />}
      <AvatarFallback className="bg-white/[0.06] border border-white/[0.08]">
        <User className="h-[45%] w-[45%] text-white/30" />
      </AvatarFallback>
    </Avatar>
  );
}
