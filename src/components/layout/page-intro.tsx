import { cn } from "@/lib/utils";

/**
 * The opening of every inner page: a large regular-weight title and a light
 * lead paragraph at 60% bone. Sits inside a `.shell` container.
 */
export function PageIntro({
  title,
  children,
  className,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("max-w-5xl", className)}>
      <h1 className="text-display-lg text-balance">{title}</h1>
      {children ? <div className="mt-8 max-w-2xl text-lead font-light text-bone/60 text-pretty">{children}</div> : null}
    </header>
  );
}

/** Section opener used down the home page and inside longer pages. */
export function SectionHeading({
  title,
  action,
  className,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between", className)}>
      <h2 className="max-w-4xl text-display-md text-balance">{title}</h2>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
