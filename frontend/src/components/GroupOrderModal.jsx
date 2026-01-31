import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function GroupOrderModal({
  group,
  isLeader,
  addForm,
  setAddForm,
  onAddItems,
  onFinalize,
  onClose
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl font-bold text-muted-foreground hover:text-red-500"
        >
          ✕
        </button>

        <CardHeader className="flex justify-between">
          <h2 className="font-semibold text-lg">
            Group: {group.vendor}
          </h2>

          {isLeader && (
            <Button variant="destructive" onClick={onFinalize}>
              Finalize
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-6">

          {group.status === 'open' && (
            <form onSubmit={onAddItems} className="space-y-3">
              <h3 className="font-medium">Add Items</h3>

              {addForm.items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Item"
                    value={item.name}
                    onChange={e =>
                      setAddForm(f => ({
                        ...f,
                        items: f.items.map((it, j) =>
                          j === i ? { ...it, name: e.target.value } : it
                        )
                      }))
                    }
                    required
                  />
                  <Input
                    type="number"
                    min={1}
                    className="w-20"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={e =>
                      setAddForm(f => ({
                        ...f,
                        items: f.items.map((it, j) =>
                          j === i ? { ...it, quantity: +e.target.value } : it
                        )
                      }))
                    }
                    required
                  />
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    className="w-24"
                    placeholder="Price"
                    value={item.price}
                    onChange={e =>
                      setAddForm(f => ({
                        ...f,
                        items: f.items.map((it, j) =>
                          j === i ? { ...it, price: +e.target.value } : it
                        )
                      }))
                    }
                    required
                  />
                </div>
              ))}

              <Button type="button" variant="outline"
                onClick={() =>
                  setAddForm(f => ({
                    ...f,
                    items: [...f.items, { name: '', quantity: 1, price: 0 }]
                  }))
                }>
                Add Item
              </Button>

              <Button type="submit">Add Items</Button>
            </form>
          )}
          <div>
            <h3 className="font-medium">Full Group Order</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.items.map((i, idx) => (
                <Card key={idx} className="p-3">
                  <p className="font-semibold">
                    {i.addedBy?.name || 'User'}
                  </p>
                  <p className="text-sm">
                    {i.name} × {i.quantity}
                  </p>
                  <p className="text-sm font-medium">
                    ₹{(i.quantity * i.price).toFixed(2)}
                  </p>
                </Card>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
