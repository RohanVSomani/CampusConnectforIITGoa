/**
 * EmergencyButton – prominent SOS trigger, links to /emergency or triggers callback
 */

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EmergencyButton({
  asLink = true,
  onClick,
  variant = 'destructive',
  size = 'lg',
  className,
  children,
}) {
  const content = (
    <>
      <AlertTriangle className="h-5 w-5 shrink-0" />
      {children ?? 'Emergency SOS'}
    </>
  );

  const base = (
    <Button
      variant={variant}
      size={size}
      className={cn('font-semibold gap-2 shadow-lg', className)}
      onClick={asLink ? undefined : onClick}
    >
      {content}
    </Button>
  );

  if (asLink) {
    return (
      <Link to="/emergency" className={cn('inline-flex', className)}>
        {base}
      </Link>
    );
  }
  return base;
}
