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
  if (!group) return null;

  const itemsList = group.items || [];
  const formItems = addForm?.items || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-2xl">✕</span>
        </button>

        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <h2 className="font-bold text-xl text-primary">
              {group.vendor}
            </h2>
            <p className="text-sm text-muted-foreground">
              Delivery to: {group.deliveryLocation}
            </p>
          </div>

          {isLeader && group.status === 'open' && (
            <Button variant="destructive" size="sm" onClick={onFinalize}>
              Finalize Order
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          
          {group.status === 'open' && (
            <form onSubmit={onAddItems} className="space-y-4 p-4 bg-accent/30 rounded-lg">
              <h3 className="font-semibold text-sm uppercase tracking-wider">Add Your Items</h3>

              {formItems.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Item name"
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

              <div className="flex justify-between items-center">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() =>
                    setAddForm(f => ({
                      ...f,
                      items: [...f.items, { name: '', quantity: 1, price: 0 }]
                    }))
                  }
                >
                  + Add Another Row
                </Button>
                <Button type="submit">Submit My Items</Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <h3 className="font-semibold text-sm uppercase tracking-wider">Group Summary</h3>
              <p className="text-sm font-bold">Total: ₹{(group.totalAmount || 0).toFixed(2)}</p>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2">
              {itemsList.length > 0 ? (
                itemsList.map((i, idx) => (
                  <Card key={idx} className="p-3 border-l-4 border-l-primary/50">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-muted-foreground uppercase">
                        {i.addedBy?.name || 'Group Member'}
                      </p>
                    </div>
                    <p className="font-medium">
                      {i.name} <span className="text-muted-foreground text-sm">× {i.quantity}</span>
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      ₹{(i.quantity * i.price).toFixed(2)}
                    </p>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic col-span-2">No items added yet.</p>
              )}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}