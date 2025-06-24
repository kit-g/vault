import { Share2Icon } from "lucide-react";

interface ShareButtonProps {
  onShare?: () => void;
  size?: number;
}

export default function ShareButton({ onShare, size = 20 }: ShareButtonProps) {
  return (
    <button
      onClick={ onShare }
      className="p-1.5 rounded-full hover:bg-black/10"
      aria-label="Download attachment"
    >
      <Share2Icon size={ size }/>
    </button>
  );
}