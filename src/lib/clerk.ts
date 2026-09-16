import type { Appearance } from "@clerk/clerk-react";

/**
 * Maps the app's design tokens onto Clerk components so the sign-in card does
 * not look bolted on. shadcn tokens are HSL triplets in `h s l` form; Clerk
 * renders its own CSS custom properties as `hsl(<value>)` from these strings,
 * which is why the triplets are passed through bare.
 */
export function clerkAppearance(dir: "ltr" | "rtl"): Appearance {
  return {
    variables: {
      colorBackground: "var(--card)",
      colorText: "var(--foreground)",
      colorPrimary: "var(--primary)",
      colorPrimaryText: "var(--primary-foreground)",
      colorInputBackground: "var(--background)",
      colorInputText: "var(--foreground)",
      colorBorder: "var(--border)",
      borderRadius: "var(--radius)",
      fontFamily:
        '"Inter", var(--font-persian), ui-sans-serif, system-ui, sans-serif',
      fontFamilyButtons:
        '"Inter", var(--font-persian), ui-sans-serif, system-ui, sans-serif',
      fontWeightBold: 600,
      colorSuccess: "var(--chart-2)",
      colorDanger: "var(--destructive)",
      colorDangerText: "var(--destructive)",
      colorWarning: "var(--chart-4)",
      colorWarningText: "var(--chart-4)",
    },
    elements: {
      rootBox: "w-full",
      cardBox: "w-full",
      card: "border-border/80 shadow-md",
      socialButtonsBlockButton:
        "border-border/80 bg-background text-foreground hover:bg-foreground/[0.04]",
      formFieldInput: "border-input bg-background text-foreground",
      formButtonPrimary:
        "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
      footerActionLink: "text-primary hover:underline",
    },
    ...(dir === "rtl" ? { rtl: true } : {}),
  };
}
