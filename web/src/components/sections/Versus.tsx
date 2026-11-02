import { en } from "@/content/en";
import Reveal from "../Reveal";
import SectionHead from "../SectionHead";

const t = en.vs;

function Mark({ ok }: { ok: boolean }) {
  return ok ? (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-1 size-4 shrink-0 text-held">
      <path d="M2.5 8.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-1 size-4 shrink-0 text-ink-2/70">
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

export default function Versus() {
  return (
    <section id="vs" aria-labelledby="vs-title" className="border-b border-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 lg:py-20">
        <SectionHead id="vs-title" eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

        {/* phones: one stacked block per row, so the Canary answer never scrolls off-screen */}
        <ul className="mt-12 border-t border-ink md:hidden">
          {t.rows.map((row) => (
            <li key={row.check} className="border-b border-rule py-5">
              <p className="font-semibold leading-snug">{row.check}</p>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[15px]">
                <dt className="label self-start pt-1 text-ink-2">{t.columns.scanner}</dt>
                <dd className="flex gap-2.5 text-ink-2">
                  <Mark ok={row.scannerOk} />
                  {row.scanner}
                </dd>
                <dt className="label self-start bg-canary px-1 py-0.5 text-ink" translate="no">{t.columns.canary}</dt>
                <dd className="flex gap-2.5">
                  <Mark ok={row.canaryOk} />
                  {row.canary}
                </dd>
              </dl>
            </li>
          ))}
        </ul>

        <Reveal className="mt-12 hidden overflow-x-auto md:block lg:mt-16">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">{t.title}</caption>
            <thead>
              <tr className="border-y border-ink">
                <th scope="col" className="label w-[40%] py-3 pr-4 font-normal text-ink-2">{t.columns.check}</th>
                <th scope="col" className="label w-[25%] px-4 py-3 font-normal text-ink-2">{t.columns.scanner}</th>
                <th scope="col" className="label w-[35%] bg-canary px-4 py-3 font-semibold text-ink" translate="no">
                  {t.columns.canary}
                </th>
              </tr>
            </thead>
            <tbody>
              {t.rows.map((row) => (
                <tr key={row.check} className="border-b border-rule">
                  <th scope="row" className="py-4 pr-4 text-left font-semibold leading-snug">{row.check}</th>
                  <td className="px-4 py-4 align-top text-ink-2">
                    <span className="flex gap-2.5">
                      <Mark ok={row.scannerOk} />
                      {row.scanner}
                    </span>
                  </td>
                  <td className="bg-canary/15 px-4 py-4 align-top">
                    <span className="flex gap-2.5">
                      <Mark ok={row.canaryOk} />
                      {row.canary}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
