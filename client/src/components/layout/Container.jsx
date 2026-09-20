import { cn } from '@/lib/utils';
import { containerClass, gridPage, sectionSpacing } from '@/lib/design-system';

export function Container({ size = 'default', className, children, as: Comp = 'div', ...props }) {
  return (
    <Comp className={cn(containerClass(size, className))} {...props}>
      {children}
    </Comp>
  );
}

export function PageStack({ className, children }) {
  return <div className={cn(sectionSpacing, className)}>{children}</div>;
}

export function PageGrid({ className, children }) {
  return <div className={cn(gridPage, className)}>{children}</div>;
}
