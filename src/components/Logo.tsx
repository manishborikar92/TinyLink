import Image from 'next/image';

interface LogoProps {
  className?: string;
  color?: string; // Kept for backwards compatibility but not used with PNG
}

export default function Logo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <Image
      src="/TinyLink.png"
      alt="TinyLink Logo"
      width={32}
      height={32}
      className={className}
      priority
    />
  );
}
