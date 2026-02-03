import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OnboardingState {
    step: number;
    hotelData: {
        name: string;
        subdomain: string;
        phone: string;
        email: string;
        address: string;
        taxStrategy: "STANDARD" | "COMPOUND";
        vatRate: number;
        serviceChargeRate: number;
        tinNumber: string;
    };
    setStep: (step: number) => void;
    updateHotelData: (data: Partial<OnboardingState["hotelData"]>) => void;
    nextStep: () => void;
    prevStep: () => void;
    reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            step: 1,
            hotelData: {
                name: "",
                subdomain: "",
                tinNumber: "",
                phone: "",
                email: "",
                address: "",
                taxStrategy: "STANDARD",
                vatRate: 15,
                serviceChargeRate: 10,
            },
            setStep: (step) => set({ step }),
            updateHotelData: (data) =>
                set((state) => ({
                    hotelData: { ...state.hotelData, ...data },
                })),
            nextStep: () => set((state) => ({ step: state.step + 1 })),
            prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
            reset: () =>
                set({
                    step: 1,
                    hotelData: {
                        name: "",
                        subdomain: "",
                        tinNumber: "",
                        phone: "",
                        email: "",
                        address: "",
                        taxStrategy: "STANDARD",
                        vatRate: 15,
                        serviceChargeRate: 10,
                    },
                }),
        }),
        {
            name: "hotel-onboarding-storage",
        }
    )
);
