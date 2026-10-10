import { FadeIn } from "@/component/motion/FadeIn";

export interface Step {
  title: string;
  description: string;
}

/** Numbered "how it works" steps, laid out as a row of cards. */
export function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid list-none grid-cols-1 gap-4 ps-0 sm:grid-cols-2 lg:grid-cols-4 [&>li]:m-0">
      {steps.map((step, i) => (
        <li key={step.title}>
          <FadeIn
            delay={Math.min(i, 4) * 0.05}
            className="h-full rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) p-6"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-primary) text-sm font-bold text-white">
              {i + 1}
            </span>
            <h3 className="mt-4 text-base">{step.title}</h3>
            <p className="mt-1.5 text-sm text-(--color-text-muted)">
              {step.description}
            </p>
          </FadeIn>
        </li>
      ))}
    </ol>
  );
}

export default StepList;
