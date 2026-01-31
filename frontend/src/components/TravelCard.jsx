

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TravelCard({
  travel,
  onMatch,
  onCancel,
  showActions = true,
  compact = false,
  className,
}) {
  
  const { _id, type, from, to, departureAt, seats, status, userId } = travel;
  const isOffer = type === 'offer';
  const isOpen = status === 'open';

  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant={isOffer ? 'secondary' : 'default'}>{type}</Badge>
          <Badge variant="outline">{status}</Badge>
        </div>
        <div className="flex items-start gap-2 mt-1">
          <Car className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">
              {from} → {to}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(departureAt).toLocaleString()} · {seats} seat{seats !== 1 ? 's' : ''}
            </p>
            {userId?.name && (
              <p className="text-xs text-muted-foreground mt-0.5">by {userId.name}</p>
            )}
          </div>
        </div>
      </CardHeader>
      {showActions && isOpen && (onMatch || onCancel) && (
        <CardContent className="pt-0 flex gap-2">
          {onMatch && (
            <Button size="sm" onClick={() => onMatch(travel)}>
              Match
            </Button>
          )}
          {onCancel && (
            <Button size="sm" variant="outline" onClick={() => onCancel(travel)}>
              Cancel
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
