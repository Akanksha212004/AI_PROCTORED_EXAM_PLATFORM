// import { HTMLAttributes, SelectHTMLAttributes, useId } from "react";

// import { cn } from "@/lib/utils";

// export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
//   return (
//     <div
//       className={cn(
//         "rounded-2xl border border-border bg-surface p-8 shadow-card",
//         className
//       )}
//       {...props}
//     />
//   );
// }

// interface SelectProps
//   extends SelectHTMLAttributes<HTMLSelectElement> {
//   label: string;
//   error?: string;
// }

// export function Select({
//   label,
//   error,
//   className,
//   children,
//   id,
//   ...props
// }: SelectProps) {
//   const generatedId = useId();
//   const selectId = id ?? generatedId;

//   return (
//     <div className="flex flex-col gap-1.5">
//       <label
//         htmlFor={selectId}
//         className="text-sm font-medium text-paper/80"
//       >
//         {label}
//       </label>

//       <select
//         id={selectId}
//         className={cn(
//           "h-11 w-full appearance-none rounded-lg border bg-surface-muted px-3.5 text-sm text-paper",
//           "border-border",
//           "transition-colors duration-150 focus:border-accent-sky focus:outline-none",
//           error && "border-accent-rose focus:border-accent-rose",
//           className
//         )}
//         {...props}
//       >
//         {children}
//       </select>

//       {error && (
//         <p className="text-xs font-medium text-accent-rose">
//           {error}
//         </p>
//       )}
//     </div>
//   );
// }



// import { HTMLAttributes, SelectHTMLAttributes, useId } from "react";

// import { cn } from "@/lib/utils";

// interface CardProps extends HTMLAttributes<HTMLDivElement> {
//   interactive?: boolean;
// }

// export function Card({
//   className,
//   interactive = false,
//   ...props
// }: CardProps) {
//   return (
//     <div
//       className={cn(
//         "rounded-2xl border border-border bg-surface p-8 shadow-card",
//         interactive &&
//           "transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-sky hover:shadow-xl",
//         className
//       )}
//       {...props}
//     />
//   );
// }

// interface SelectProps
//   extends SelectHTMLAttributes<HTMLSelectElement> {
//   label: string;
//   error?: string;
// }

// export function Select({
//   label,
//   error,
//   className,
//   children,
//   id,
//   ...props
// }: SelectProps) {
//   const generatedId = useId();
//   const selectId = id ?? generatedId;

//   return (
//     <div className="flex flex-col gap-1.5">
//       <label
//         htmlFor={selectId}
//         className="text-sm font-medium text-paper/80"
//       >
//         {label}
//       </label>

//       <select
//         id={selectId}
//         className={cn(
//           "h-11 w-full appearance-none rounded-lg border bg-surface-muted px-3.5 text-sm text-paper",
//           "border-border",
//           "transition-colors duration-150 focus:border-accent-sky focus:outline-none",
//           error && "border-accent-rose focus:border-accent-rose",
//           className
//         )}
//         {...props}
//       >
//         {children}
//       </select>

//       {error && (
//         <p className="text-xs font-medium text-accent-rose">
//           {error}
//         </p>
//       )}
//     </div>
//   );
// }




import { HTMLAttributes, SelectHTMLAttributes, useId } from "react";

import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds a lift + accent glow on hover/focus — for cards that act as nav targets. Off by default. */
  interactive?: boolean;
}

export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-8 shadow-card transition-all duration-200",
        interactive &&
          "hover:-translate-y-0.5 hover:border-accent-sky/50 hover:shadow-glow-sky focus-within:-translate-y-0.5 focus-within:shadow-glow-sky",
        className
      )}
      {...props}
    />
  );
}

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export function Select({
  label,
  error,
  className,
  children,
  id,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-paper/80"
      >
        {label}
      </label>

      <select
        id={selectId}
        className={cn(
          "h-11 w-full appearance-none rounded-lg border bg-surface-muted px-3.5 text-sm text-paper",
          "border-border",
          "transition-colors duration-150 focus:border-accent-sky focus:outline-none",
          error && "border-accent-rose focus:border-accent-rose",
          className
        )}
        {...props}
      >
        {children}
      </select>

      {error && (
        <p className="text-xs font-medium text-accent-rose">
          {error}
        </p>
      )}
    </div>
  );
}
