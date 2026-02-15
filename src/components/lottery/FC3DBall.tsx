import { cn } from '@/lib/utils';

interface FC3DBallProps {
  digit: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'red' | 'orange' | 'purple';
  className?: string;
}

export default function FC3DBall({ digit, size = 'md', variant = 'purple', className }: FC3DBallProps) {
  return (
    <div
      className={cn(
        'ball',
        size === 'sm' && 'ball-sm',
        size === 'lg' && 'ball-lg',
        variant === 'purple' && 'ball-purple',
        variant === 'red' && 'ball-red',
        variant === 'orange' && 'ball-orange',
        className
      )}
    >
      {digit}
    </div>
  );
}
