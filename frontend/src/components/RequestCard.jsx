import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import {Input} from '@/components/ui/input'
const STATUS_VARIANTS = {
  open: 'default',
  claimed: 'secondary',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'outline',
};

export default function RequestCard({
  request,
  onClaim,
  onComplete,
  onCancel,
  showActions = true,
  compact = false,
  className,
}) {
  
  
  const {
    title,
    description,
    type,
    status,
    rewardCredits,
    userId,
    claimedBy,
    fromLocation,
    toLocation,
  } = request;
  const { user: currentUser } = useAuth()||"me";
  const isOpen = status === 'open';
  const isOwner = userId?._id === currentUser?._id;
const isClaimant = claimedBy?._id === currentUser?._id;
const [bonus, setBonus] = useState(0);

const canClaim =
  status === 'open' && !isOwner && onClaim;

const canComplete =
  (isClaimant || isOwner) &&
  ['claimed', 'in_progress'].includes(status) &&
  onComplete;

const canCancel =
  isOwner && status === 'open' && onCancel;

const canReopen =
  isOwner &&
  ['claimed', 'in_progress'].includes(status) &&
  onCancel;

  console.log({
    currentUser,
    owner: userId?._id,
    claimer: claimedBy?._id,
    status
  });
  

  

  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline">{type || 'errand'}</Badge>
          <Badge variant={STATUS_VARIANTS[status] || 'outline'}>
            {status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="flex items-start gap-2 mt-1">
          <Package className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">{title}</p>

            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}

            {(fromLocation || toLocation) && (
              <p className="text-xs text-muted-foreground mt-1">
                {[fromLocation, toLocation].filter(Boolean).join(' → ')}
              </p>
            )}

            {rewardCredits > 0 && (
              <p className="text-xs text-primary font-medium mt-1">
                {rewardCredits} credits
              </p>
            )}

            {userId?.name && (
              <p className="text-xs text-muted-foreground">
                by {userId.name}
              </p>
            )}

            {claimedBy?.name && status !== 'open' && (
              <p className="text-xs text-muted-foreground">
                claimed by {claimedBy.name}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      {showActions &&
        (canClaim || canComplete || canCancel || canReopen) && (
          <CardContent className="pt-0 flex flex-wrap gap-2">
            {canClaim && (
              <Button size="sm" onClick={() => onClaim(request)}>
                Claim
              </Button>
            )}

{canComplete && (
  <div className="flex items-center gap-2">
    <Button
      size="sm"
      onClick={() => onComplete(request, bonus)}
    >
      Complete
    </Button>
  </div>
)}


            {canCancel && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onCancel(request)}
              >
                Cancel
              </Button>
            )}

            {canReopen && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCancel(request)}
              >
                Reopen
              </Button>
            )}
          </CardContent>
        )}
    </Card>
  );
}
