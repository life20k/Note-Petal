"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";

export default function BulkPurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ingredientId: "",
    quantity: 1,
    totalCost: 0,
  });

  useEffect(() => {
    fetch("/api/calculator/purchases")
      .then((r) => r.json())
      .then(setPurchases);
    fetch("/api/calculator/ingredients")
      .then((r) => r.json())
      .then(setIngredients);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/calculator/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const item = await res.json();
      setPurchases([item, ...purchases]);
      setShowForm(false);
      setForm({ ingredientId: "", quantity: 1, totalCost: 0 });
      toast.success("Purchase logged!");
    }
  };

  const totalSpent = purchases.reduce((sum, p) => sum + p.totalCost, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Bulk Purchases
            </h2>
            <p className="text-sm text-gray-500">
              Total spent: {formatCurrency(totalSpent)}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Log Purchase
          </button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Log Bulk Purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ingredient
                    </label>
                    <select
                      required
                      value={form.ingredientId}
                      onChange={(e) =>
                        setForm({ ...form, ingredientId: e.target.value })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="">Select ingredient</option>
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({formatCurrency(ing.bulkPrice)}/
                          {ing.quantityPerBulk} {ing.unit}s)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity (bulk units)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.quantity || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Cost ($)
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={form.totalCost || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          totalCost: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    Log Purchase
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            {purchases.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">
                  No purchases logged yet.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500">
                    <th className="px-4 py-3">Ingredient</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Total Cost</th>
                    <th className="px-4 py-3">Unit Cost</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {p.ingredient.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.quantity} bulk units
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(p.totalCost)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatCurrency(p.totalCost / p.quantity)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(p.purchaseDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
