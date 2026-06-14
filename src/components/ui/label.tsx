"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none text-gray-700",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };
