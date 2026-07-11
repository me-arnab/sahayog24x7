import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ interactive, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-card border border-border rounded-2xl shadow-sm
        ${interactive ? "cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/5 hover:border-primary/30" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
