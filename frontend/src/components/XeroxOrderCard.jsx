import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function XeroxOrderCard({ job, onUpdate }) {
  const { user } = useAuth();

  async function markCollected() {
    await api.patch(`/print/${job._id}/collect`);
    onUpdate?.();
  }

  return (
    <div className="border rounded-lg p-4 space-y-2 bg-card">
      <h3 className="font-semibold">{job.fileName}</h3>

      <p className="text-sm text-muted-foreground">
        Copies: {job.copies} · {job.sides} · {job.color}
      </p>

      <p className="text-sm">
        Status: <span className="font-medium">{job.status}</span>
      </p>

      {job.totalCost > 0 && (
        <p className="text-sm font-medium">Amount: ₹{job.totalCost}</p>
      )}

      {user?.role === 'student' && job.status === 'ready' && (
        <Button size="sm" onClick={markCollected}>
          Mark as Collected
        </Button>
      )}
    </div>
  );
}
