import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import XeroxOrderCard from '@/components/XeroxOrderCard';

export default function Xerox() {
  const [shops, setShops] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [file, setFile] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    shopId: '',
    copies: 1,
    sides: 'single',
    color: 'bw',
  });

  async function fetchData() {
    const [shopsRes, myRes] = await Promise.all([
      api.get('/print/shops'),
      api.get('/print/my'),
    ]);

    setShops(shopsRes.data || []);
    setMyJobs(myRes.data || []);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file || !form.shopId) return alert('Missing fields');

    const fd = new FormData();
    fd.append('file', file);
    fd.append('shopId', form.shopId);
    fd.append('copies', form.copies);
    fd.append('sides', form.sides);
    fd.append('color', form.color);

    await api.post('/print', fd);

    setOpen(false);
    setFile(null);
    fetchData();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Xerox</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New Print Job</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Print Job</DialogTitle>
              <DialogDescription>Upload your file</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Shop</Label>
                <select
                  className="w-full border rounded h-10 px-3"
                  value={form.shopId}
                  onChange={(e) => setForm((f) => ({ ...f, shopId: e.target.value }))}
                  required
                >
                  <option value="">Select shop</option>
                  {shops.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.shopName || s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>File</Label>
                <Input type="file" required onChange={(e) => setFile(e.target.files[0])} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Copies</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.copies}
                    onChange={(e) => setForm((f) => ({ ...f, copies: +e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Sides</Label>
                  <select
                    className="w-full border rounded h-10 px-3"
                    value={form.sides}
                    onChange={(e) => setForm((f) => ({ ...f, sides: e.target.value }))}
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Color</Label>
                <select
                  className="w-full border rounded h-10 px-3"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                >
                  <option value="bw">B&W</option>
                  <option value="color">Color</option>
                </select>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {myJobs.map((j) => (
          <XeroxOrderCard key={j._id} job={j} onUpdate={fetchData} />

        ))}
      </div>
    </div>
  );
}
