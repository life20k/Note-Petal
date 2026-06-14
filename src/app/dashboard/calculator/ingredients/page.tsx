"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Plus, Trash2, Flower2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";

const categories = [
  "Flower",
  "Greenery",
  "Ribbon",
  "Vase",
  "Foam",
  "Wire",
  "Other",
];

const units = ["stem", "bunch", "roll", "piece", "bag", "sheet"];

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Flower",
    unit: "stem",
    bulkPrice: 0,
    quantityPerBulk: 1,
    supplier: "",
  });

  useEffect(() => {
    fetch("/api/calculator/ingredients")
      .then((r) => r.json())
      .then(setIngredients);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/calculator/ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const item = await res.json();
      setIngredients([...ingredients, item]);
      setShowForm(false);
      setForm({
        name: "",
        category: "Flower",
        unit: "stem",
        bulkPrice: 0,
        quantityPerBulk: 1,
        supplier: "",
      });
      toast.success("Ingredient added!");
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/calculator/ingredients?id=${id}`, { method: "DELETE" });
    setIngredients(ingredients.filter((i) => i.id !== id));
    toast.success("Ingredient removed");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Ingredients Library
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Add Ingredient
          </button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>New Ingredient</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="e.g., Red Roses"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bulk Price ($)
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={form.bulkPrice || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          bulkPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity per Bulk
                    </label>
                    <input
                      type="number"
                      required
                      value={form.quantityPerBulk || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          quantityPerBulk: parseInt(e.target.value) || 1,
                        })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <select
                      value={form.unit}
                      onChange={(e) =>
                        setForm({ ...form, unit: e.target.value })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {units.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={form.supplier}
                      onChange={(e) =>
                        setForm({ ...form, supplier: e.target.value })
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
                    Add Ingredient
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
            {ingredients.length === 0 ? (
              <div className="py-12 text-center">
                <Flower2 className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">
                  No ingredients yet. Add your first ingredient!
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Unit Cost</th>
                    <th className="px-4 py-3">Bulk Price</th>
                    <th className="px-4 py-3">Qty/Bulk</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ingredients.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatCurrency(item.bulkPrice / item.quantityPerBulk)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatCurrency(item.bulkPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.quantityPerBulk} {item.unit}s
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {item.supplier || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
