import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "emerald"
  | "link";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const sizes: Record<ButtonSize, string> = {
  xs: "min-h-7 rounded-lg px-2.5 text-xs",
  sm: "min-h-8 rounded-lg px-3 text-xs",
  md: "min-h-10 rounded-xl px-4 text-sm",
  lg: "min-h-12 rounded-2xl px-6 text-sm",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 hover:shadow-md hover:-translate-y-px dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
  secondary:
    "border border-zinc-300/90 bg-white text-zinc-800 shadow-sm hover:border-zinc-400 hover:bg-zinc-50 hover:shadow-md hover:-translate-y-px dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-800",
  ghost:
    "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/90 dark:hover:text-zinc-50",
  danger:
    "text-red-700 ring-1 ring-inset ring-transparent hover:bg-red-50 hover:ring-red-200/80 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:ring-red-900/50",
  success:
    "bg-emerald-600 text-white shadow-sm shadow-emerald-600/15 hover:bg-emerald-500 hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-px",
  emerald:
    "rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 hover:shadow-emerald-500/30 hover:-translate-y-px",
  link: "text-sky-700 underline-offset-4 hover:text-sky-800 hover:underline dark:text-sky-400 dark:hover:text-sky-300",
};

export function joinClasses(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  const rounded = variant === "emerald" ? "" : variant === "link" ? "rounded-lg px-1" : "";
  return joinClasses(base, sizes[size], variants[variant], rounded, className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

type LinkButtonProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: LinkButtonProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

/** Compact actions in tables and toolbars */
export type ActionVariant = "neutral" | "primary" | "danger" | "link";

const actionBase =
  "inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]";

const actionVariants: Record<ActionVariant, string> = {
  neutral:
    "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 hover:shadow-sm dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
  primary:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 hover:shadow-md hover:-translate-y-px",
  danger:
    "text-red-700 hover:bg-red-50 hover:ring-1 hover:ring-red-200/80 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:ring-red-900/40",
  link: "text-sky-700 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/40",
};

export function actionButtonClass(variant: ActionVariant = "neutral", className?: string): string {
  return joinClasses(actionBase, actionVariants[variant], className);
}

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  actionVariant?: ActionVariant;
};

export function ActionButton({
  actionVariant = "neutral",
  className,
  type = "button",
  ...props
}: ActionButtonProps) {
  return <button type={type} className={actionButtonClass(actionVariant, className)} {...props} />;
}

type ActionLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  actionVariant?: ActionVariant;
};

export function ActionLink({ actionVariant = "link", className, ...props }: ActionLinkProps) {
  return <Link className={actionButtonClass(actionVariant, className)} {...props} />;
}
