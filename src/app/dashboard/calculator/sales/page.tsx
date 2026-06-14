"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Plus, Trash2, DollarSign, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [arrangements, setArrangements] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    arrangementId: "",
    quantity: 1,
    salePrice: "",
    saleDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetch("/api/calculator/sales").then((r) => r.json()).then(setSales);
    fetch("/api/calculator/arrangements").then((r) => r.json()).then(setArrangements);
  }, []);

  const selectedArrangement = arrangements.find((a) => a.id === form.arrangementId);
  const costPrice = selectedArrangement
    ? selectedArrangement.items.reduce((total: number, item: any) => {
        const unitCost = item.ingredient.bulkPrice / item.ingredient.quantityPerBulk;
        return total + unitCost * item.quantity;
      }, 0)
    : 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/calculator/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const sale = await res.json();
      setSales([sale, ...sales]);
      setShowForm(false);
      setForm({ arrangementId: "", quantity: 1, salePrice: "", saleDate: new Date().toISOString().split("T")[0] });
      toast.success("Sale logged!");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to log sale");
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/calculator/sales?id=${id}`, { method: "DELETE" });
    setSales(sales.filter((s) => s.id !== id));
    toast.success("Sale deleted");
  };

  const totalRevenue = sales.reduce((sum, s) => sum + s.salePrice * s.quantity, 0);
  const totalProfit = sales.reduce((sum, s) => sum + (s.salePrice - s.costPrice) * s.quantity, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Log Sales</h2>
            <p className="mt-1 text-sm text-gray-600">
              Record when you sell an arrangement to track revenue and profit.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Log Sale
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-gray-500">{sales.length} transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Profit</CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(totalProfit)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Profit/Sale</CardTitle>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {sales.length > 0 ? formatCurrency(totalProfit / sales.length) : "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Log Sale Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Log a Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Arrangement</label>
                    <select
                      required
                      value={form.arrangementId}
                      onChange={(e) => setForm({ ...form, arrangementId: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="">Select arrangement</option>
                      {arrangements.map((arr) => (
                        <option key={arr.id} value={arr.id}>{arr.name} ({arr.type})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sale Price ($)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={form.salePrice}
                      onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sale Date</label>
                    <input
                      type="date"
                      required
                      value={form.saleDate}
                      onChange={(e) => setForm({ ...form, saleDate: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {selectedArrangement && (
                  <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cost per unit:</span>
                      <span className="font-medium">{formatCurrency(costPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sale price per unit:</span>
                      <span className="font-medium">{form.salePrice ? formatCurrency(parseFloat(form.salePrice)) : "—"}</span>
                    </div>
                    {form.salePrice && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Profit per unit:</span>
                          <span className={`font-semibold ${(parseFloat(form.salePrice) - costPrice) >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(parseFloat(form.salePrice) - costPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total profit ({form.quantity}x):</span>
                          <span className={`font-semibold ${((parseFloat(form.salePrice) - costPrice) * form.quantity) >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency((parseFloat(form.salePrice) - costPrice) * form.quantity)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="submit" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
                    Log Sale
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Sales History */}
        <Card>
          <CardHeader>
            <CardTitle>Sales History</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No sales logged yet. Click "Log Sale" to record your first sale.
              </p>
            ) : (
              <div className="space-y-2">
                {sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{sale.arrangement.name}</p>
                      <p className="text-xs text-gray-500">
                        {sale.quantity}x sold • {new Date(sale.saleDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right mr-3">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(sale.salePrice * sale.quantity)}</p>
                      <p className={`text-xs ${(sale.salePrice - sale.costPrice) >= 0 ? "text-green-600" : "text-red-600"}`}>
                        profit: {formatCurrency((sale.salePrice - sale.costPrice) * sale.quantity)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(sale.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
