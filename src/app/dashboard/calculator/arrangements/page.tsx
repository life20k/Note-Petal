"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Plus, Trash2, LayoutGrid } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency, calculateSuggestedPrice } from "@/lib/utils";

const arrangementTypes = [
  "Bouquet",
  "Basket",
  "Centerpiece",
  "Wreath",
  "Spray",
  "Vase Arrangement",
  "Custom",
];

export default function ArrangementsPage() {
  const [arrangements, setArrangements] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "Bouquet",
    description: "",
    desiredMargin: 50,
    items: [] as { ingredientId: string; quantity: number; unit: string }[],
  });

  useEffect(() => {
    fetch("/api/calculator/arrangements")
      .then((r) => r.json())
      .then(setArrangements);
    fetch("/api/calculator/ingredients")
      .then((r) => r.json())
      .then(setIngredients);
  }, []);

  const addItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        { ingredientId: "", quantity: 1, unit: "stem" },
      ],
    });
  };

  const removeItem = (index: number) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...form.items];
    (newItems[index] as any)[field] = value;
    setForm({ ...form, items: newItems });
  };

  const calculateCost = () => {
    return form.items.reduce((total, item) => {
      const ingredient = ingredients.find((i) => i.id === item.ingredientId);
      if (!ingredient) return total;
      const unitCost = ingredient.bulkPrice / ingredient.quantityPerBulk;
      return total + unitCost * item.quantity;
    }, 0);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/calculator/arrangements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const item = await res.json();
      setArrangements([item, ...arrangements]);
      setShowForm(false);
      setForm({
        name: "",
        type: "Bouquet",
        description: "",
        desiredMargin: 50,
        items: [],
      });
      toast.success("Arrangement created!");
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/calculator/arrangements?id=${id}`, {
      method: "DELETE",
    });
    setArrangements(arrangements.filter((a) => a.id !== id));
    toast.success("Arrangement deleted");
  };

  const totalCost = calculateCost();
  const suggestedPrice = calculateSuggestedPrice(totalCost, form.desiredMargin);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Arrangements</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Create Arrangement
          </button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>New Arrangement</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                      placeholder="e.g., Romantic Red Roses"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {arrangementTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Desired Margin %
                    </label>
                    <input
                      type="number"
                      value={form.desiredMargin}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          desiredMargin: parseInt(e.target.value) || 50,
                        })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    rows={2}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Ingredients
                    </label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-sm text-purple-600 hover:text-purple-500"
                    >
                      + Add ingredient
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {form.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2"
                      >
                        <select
                          value={item.ingredientId}
                          onChange={(e) =>
                            updateItem(index, "ingredientId", e.target.value)
                          }
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="">Select ingredient</option>
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} ({formatCurrency(
                                ing.bulkPrice / ing.quantityPerBulk
                              )}/{ing.unit})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          min="1"
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {form.items.length > 0 && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(totalCost)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span className="text-gray-600">Suggested Price:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(suggestedPrice)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span className="text-gray-600">Profit per unit:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(suggestedPrice - totalCost)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    Create Arrangement
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {arrangements.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <LayoutGrid className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">
                  No arrangements yet. Create your first one!
                </p>
              </CardContent>
            </Card>
          ) : (
            arrangements.map((arr) => {
              const cost = arr.items.reduce((total: number, item: any) => {
                const unitCost =
                  item.ingredient.bulkPrice / item.ingredient.quantityPerBulk;
                return total + unitCost * item.quantity;
              }, 0);
              const price = calculateSuggestedPrice(cost, arr.desiredMargin);

              return (
                <Card key={arr.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {arr.name}
                        </h3>
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                          {arr.type}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(arr.id)}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {arr.description && (
                      <p className="mt-2 text-xs text-gray-500">
                        {arr.description}
                      </p>
                    )}
                    <div className="mt-3 space-y-1">
                      {arr.items.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-xs text-gray-600"
                        >
                          <span>
                            {item.ingredient.name} × {item.quantity}
                          </span>
                          <span>
                            {formatCurrency(
                              (item.ingredient.bulkPrice /
                                item.ingredient.quantityPerBulk) *
                                item.quantity
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Cost</span>
                        <span className="font-medium">{formatCurrency(cost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Suggested ({arr.desiredMargin}% margin)
                        </span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(price)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
