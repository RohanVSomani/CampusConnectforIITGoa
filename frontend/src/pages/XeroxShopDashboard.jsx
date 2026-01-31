import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import XeroxOrderCard from '@/components/XeroxOrderCard';
import { Eye } from 'lucide-react';

export default function XeroxShopDashboard() {
  const [jobs, setJobs] = useState([]);
  const [amount, setAmount] = useState({});

  async function fetchQueue() {
    const res = await api.get('/print/shop');
    setJobs(res.data || []);
  }

  useEffect(() => {
    fetchQueue();
  }, []);

  async function updateStatus(id, status) {
    await api.patch(`/print/${id}`, {
      status,
      totalCost: amount[id],
    });
    fetchQueue();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Print Orders</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((j) => (
          <div key={j._id} className="border rounded-xl p-3 space-y-2">
            <XeroxOrderCard job={j} />

            <Button
              size="sm"
              variant="secondary"
              className="gap-1"
              onClick={() => window.open(`http://localhost:5000/api/print/${j._id}/file`, '_blank')}
            >
              <Eye className="h-4 w-4" /> View PDF
            </Button>

            <div className="flex gap-2 flex-wrap">
              {j.status === 'pending' && (
                <Button onClick={() => updateStatus(j._id, 'accepted')}>
                  Accept
                </Button>
              )}

              {j.status === 'accepted' && (
                <Button
                  onClick={() => updateStatus(j._id, 'printing')}
                  variant="secondary"
                >
                  Start Printing
                </Button>
              )}

              {j.status === 'printing' && (
                <>
                  <Input
                    type="number"
                    placeholder="₹ Amount"
                    className="w-32"
                    onChange={(e) =>
                      setAmount((a) => ({
                        ...a,
                        [j._id]: +e.target.value,
                      }))
                    }
                  />
                  <Button
                    onClick={() => updateStatus(j._id, 'ready')}
                    variant="success"
                  >
                    Mark Ready
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
