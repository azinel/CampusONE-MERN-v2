import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn('co-input h-10 file:border-0 file:bg-transparent file:text-sm file:font-medium', className)}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
