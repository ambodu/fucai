import { cn } from '@/lib/utils';

interface FC3DBallProps {
  digit: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'red' | 'blue' | 'purple';
  className?: string;
}

export default function FC3DBall({ digit, size = 'md', variant = 'red', className }: FC3DBallProps) {
  return (
    <div
      className={cn(
        'ball',
        size === 'sm' && 'ball-sm',
        size === 'lg' && 'ball-lg',
        variant === 'red' && 'ball-red',
        variant === 'blue' && 'ball-blue',
        variant === 'purple' && 'ball-purple',
        className
      )}
    >
      {digit}
    </div>
  );
}
