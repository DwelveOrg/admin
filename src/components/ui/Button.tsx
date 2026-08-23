import * as React from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "glass" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

/**
 * Violet is the operator's pen: the primary action and the current selection,
 * and nothing else on the screen. Everything else is glass.
 *
 * `primary` carries a real glow rather than a drop shadow, because in this room
 * depth is light — a raised control is brighter and throws a pool, it does not
 * darken the surface under it.
 */
const VARIANTS: Record<Variant, string> = {
  primary: cn(
    "bg-pen text-pen-ink shadow-lift-pen",
    "hover:bg-pen-hover hover:shadow-lift-pen-hover",
  ),
  glass: cn(
    "border border-edge bg-panel text-t1 backdrop-blur-xl",
    "hover:border-edge-lit hover:bg-panel-raised",
  ),
  ghost: "text-t2 hover:bg-panel-sunk hover:text-t1",
  danger: cn(
    "border border-edge bg-panel text-danger backdrop-blur-xl",
    "hover:border-danger/40 hover:bg-danger-wash",
  ),
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3 text-13",
  md: "h-9.5 gap-2 px-4 text-13",
  lg: "h-11 gap-2 px-5 text-15",
  icon: "size-9 justify-center",
};

/**
 * The button's classes, without the element.
 *
 * A button-shaped link is a link, and swapping the element under it (Radix's
 * `asChild`) would cost a dependency this app otherwise does not need. Callers
 * that want a link spread these onto `<Link>` directly.
 */
export function buttonClasses({
  variant = "glass",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    "inline-flex cursor-pointer items-center justify-center rounded-md font-medium whitespace-nowrap",
    // 160ms with a spring-ish curve: fast enough that an operator in flow never
    // waits for choreography, shaped enough that the control feels like an
    // object rather than a state swap.
    "transition-all duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
    // A control is a physical thing. It goes down when pressed.
    "active:translate-y-px active:shadow-none",
    "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  ...props
}: React.ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClasses({ variant, size, className })} {...props} />;
}
