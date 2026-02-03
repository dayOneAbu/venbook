import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CustomerOnboardingState {
  step: number;
  customerData: {
    name: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    companyName: string;
    contactName: string;
    tinNumber: string;
    type: "INDIVIDUAL" | "COMPANY";
    image: string;
  };
  setStep: (step: number) => void;
  updateCustomerData: (data: Partial<CustomerOnboardingState["customerData"]>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useCustomerOnboardingStore = create<CustomerOnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      customerData: {
        name: "",
        email: "",
        phone: "",
        city: "",
        country: "Ethiopia",
        companyName: "",
        contactName: "",
        tinNumber: "",
        type: "INDIVIDUAL",
        image: "",
      },
      setStep: (step) => set({ step }),
      updateCustomerData: (data) =>
        set((state) => ({
          customerData: { ...state.customerData, ...data },
        })),
      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
      reset: () =>
        set({
          step: 1,
          customerData: {
            name: "",
            email: "",
            phone: "",
            city: "",
            country: "Ethiopia",
            companyName: "",
            contactName: "",
            tinNumber: "",
            type: "INDIVIDUAL",
            image: "",
          },
        }),
    }),
    {
      name: "customer-onboarding-storage",
    }
  )
);
