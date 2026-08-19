import { create } from "zustand";
import type { BookingFormValues } from "@/lib/validations/booking";

interface BookingFormState {
  step: number;
  data: Partial<BookingFormValues>;
  submittedBookingCode: string | null;
  isSubmitting: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (values: Partial<BookingFormValues>) => void;
  setSubmitting: (val: boolean) => void;
  setSubmittedBookingCode: (code: string | null) => void;
  reset: () => void;
}

const initialState = {
  step: 1,
  data: {
    preferred_contact: "phone" as const,
  },
  submittedBookingCode: null,
  isSubmitting: false,
};

export const useBookingFormStore = create<BookingFormState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 4) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
  updateData: (values) => set((s) => ({ data: { ...s.data, ...values } })),
  setSubmitting: (val) => set({ isSubmitting: val }),
  setSubmittedBookingCode: (code) => set({ submittedBookingCode: code }),
  reset: () => set(initialState),
}));
