import { Fragment } from "react";

type FeaturePlaceholderProps = {
  title: string;
  summary: string;
  /** The file to edit to replace this placeholder with the real feature. */
  entryFile: string;
  /** The feature's README, with its plan and open questions. */
  readme: string;
  scope: string[];
};

// Temporary stand-in for a feature screen that hasn't been built yet. It marks
// out where the feature goes and which file to edit. Delete its use from the
// feature's screen file once real UI is in place.
export function FeaturePlaceholder({ title, summary, entryFile, readme, scope }: FeaturePlaceholderProps) {
  return (
    <section aria-labelledby="feature-title">
      <h1 id="feature-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-prose text-lg text-muted">{summary}</p>

      <div className="mt-8 flex min-h-[55dvh] flex-col rounded-2xl border-2 border-dashed border-line p-6 sm:p-8">
        <p className="text-xl font-bold">This feature goes here</p>
        <p className="mt-1 text-muted">
          To build it, edit <Code>{entryFile}</Code>.
        </p>

        <h2 className="mt-8 font-bold">Starting scope</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {scope.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <p className="mt-auto pt-8 text-sm text-muted">
          Plan and open questions: <Code>{readme}</Code>
        </p>
      </div>
    </section>
  );
}

// A file path, allowed to wrap after each "/" so long paths fit on a phone.
function Code({ children }: { children: string }) {
  const parts = children.split("/");
  return (
    <code className="rounded bg-mint px-1.5 py-0.5 font-mono text-[0.9em] wrap-break-word text-ink">
      {parts.map((part, i) => {
        const isLast = i === parts.length - 1;
        return (
          <Fragment key={i}>
            <span className="whitespace-nowrap">{isLast ? part : `${part}/`}</span>
            {!isLast && <wbr />}
          </Fragment>
        );
      })}
    </code>
  );
}
