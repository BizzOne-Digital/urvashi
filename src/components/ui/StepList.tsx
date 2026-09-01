import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description: string;
}

interface StepListProps {
  steps: Step[];
  className?: string;
}

export function StepList({ steps, className }: StepListProps) {
  return (
    <ol className={cn("space-y-4", className)} data-reveal-stagger>
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="card-vibrant group flex gap-4 p-4 sm:p-5"
          data-reveal-item
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-magenta text-sm font-bold text-pure-paper shadow-[0_0_16px_rgba(13,151,252,0.4)] transition-transform group-hover:scale-110"
          >
            {index + 1}
          </span>
          <div>
            <h3 className="font-display font-semibold text-pure-paper">{step.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-chrome-light">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
