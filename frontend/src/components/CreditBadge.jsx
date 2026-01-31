

import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CreditBadge({ credits = 0, linkTo = true, className }) {
  const content = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary',
        linkTo && 'hover:bg-primary/20 transition-colors',
        className
      )}
    >
      <Coins className="h-4 w-4" />
      {credits}
    </span>
  );

  if (linkTo) {
    return (
      <Link to="/credits" className="inline-flex">
        {content}
      </Link>
    );
  }
  return content;
}
