import { auth } from "./auth";
import { prisma } from "./prisma";
import { PLANS, type PlanType } from "./stripe";

const PLAN_HIERARCHY: Record<string, number> = {
  starter: 0,
  business: 1,
  enterprise: 2,
};

export async function requirePlan(requiredPlan: PlanType = "business") {
  const session = await auth();

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 } as const;
  }

  const tenantId = (session.user as any).tenantId;
  if (!tenantId) {
    return { error: "No tenant", status: 400 } as const;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { plan: true, id: true },
  });

  if (!tenant) {
    return { error: "Tenant not found", status: 404 } as const;
  }

  const userLevel = PLAN_HIERARCHY[tenant.plan] ?? 0;
  const requiredLevel = PLAN_HIERARCHY[requiredPlan] ?? 0;

  if (userLevel < requiredLevel) {
    return {
      error: `This feature requires the ${requiredPlan} plan or higher`,
      status: 403,
      tenant,
      plan: tenant.plan,
    } as const;
  }

  return { tenant, plan: tenant.plan } as const;
}


