import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

export function buttonVariants(variant: ButtonVariant = "primary", className?: string) {
  return cn(variantClasses[variant], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonVariants(variant, className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
