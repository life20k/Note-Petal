import { NextResponse } from "next/server";
import { requirePlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requirePlan("business");
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const sales = await prisma.salesRecord.findMany({
    where: { tenantId: authResult.tenant.id },
    include: { arrangement: true },
    orderBy: { saleDate: "desc" },
    take: 100,
  });

  const totalRevenue = sales.reduce(
    (sum: number, s: any) => sum + s.salePrice * s.quantity, 0
  );
  const totalCost = sales.reduce(
    (sum: number, s: any) => sum + s.costPrice * s.quantity, 0
  );
  const totalProfit = totalRevenue - totalCost;
  const avgMargin =
    totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0";

  const monthlyMap: Record<string, { revenue: number; cost: number; profit: number }> = {};
  for (const sale of sales) {
    const month = sale.saleDate.toISOString().slice(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, cost: 0, profit: 0 };
    monthlyMap[month].revenue += sale.salePrice * sale.quantity;
    monthlyMap[month].cost += sale.costPrice * sale.quantity;
    monthlyMap[month].profit += (sale.salePrice - sale.costPrice) * sale.quantity;
  }

  const arrangementsMap: Record<string, { name: string; count: number; revenue: number }> = {};
  for (const sale of sales) {
    const name = sale.arrangement.name;
    if (!arrangementsMap[name]) arrangementsMap[name] = { name, count: 0, revenue: 0 };
    arrangementsMap[name].count += sale.quantity;
    arrangementsMap[name].revenue += sale.salePrice * sale.quantity;
  }

  return NextResponse.json({
    totalRevenue,
    totalCost,
    totalProfit,
    avgMargin: parseFloat(avgMargin),
    monthlyData: Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data })),
    topArrangements: Object.values(arrangementsMap)
      .sort((a: { revenue: number }, b: { revenue: number }) => b.revenue - a.revenue)
      .slice(0, 5),
    totalSales: sales.length,
  });
}
