import {
  PersianFontContext,
  type PersianFontContextValue,
} from "@/lib/fonts";
import { useContext } from "react";

/** The Persian typeface in use, plus the controls to change it. */
export function usePersianFont(): PersianFontContextValue {
  const value = useContext(PersianFontContext);
  if (value === null) {
    throw new Error("usePersianFont must be used inside PersianFontProvider");
  }
  return value;
}
