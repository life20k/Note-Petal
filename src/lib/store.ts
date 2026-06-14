import { create } from "zustand";

interface TenantState {
  tenantId: string | null;
  tenantSlug: string | null;
  businessName: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  setTenant: (data: {
    tenantId: string;
    tenantSlug: string;
    businessName: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  }) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenantId: null,
  tenantSlug: null,
  businessName: null,
  logoUrl: null,
  primaryColor: "#7C3AED",
  secondaryColor: "#F3E8FF",
  setTenant: (data) =>
    set({
      tenantId: data.tenantId,
      tenantSlug: data.tenantSlug,
      businessName: data.businessName,
      logoUrl: data.logoUrl || null,
      primaryColor: data.primaryColor || "#7C3AED",
      secondaryColor: data.secondaryColor || "#F3E8FF",
    }),
}));
