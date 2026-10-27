"use client";
import { useMemo, useState } from "react";
import { SYMPTOMS, TOX, STATES, GRADES, TREAT, UPDATES, AGENTS, HELP, TABLE1 } from "@/lib/data";

const TABS = ["Assess", "Toxidromes", "Pathophysiology", "Treatment", "Search", "Updates"];
const card = "bg-white rounded-xl border border-slate-200 p-3 mb-3";

export default function Home() {
  const [tab, setTab] = useState("Assess");
  const [sel, setSel] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [state, setState] = useState("All");

  const ranked = useMemo(() => {
    if (!sel.length) return [];
    return TOX.map(t => {
      const hit = t.s.filter(x => sel.includes(x)).length;
      const extra = sel.length - hit;
      return { t, hit, score: hit / t.s.length - 0.05 * extra };
    }).filter(r => r.hit > 0).sort((a, b) => b.score - a.score).slice(0, 4);
  }, [sel]);

  const agents = AGENTS.filter(a =>
    (state === "All" || a[1] === state) && (a.join(" ").toLowerCase().includes(q.toLowerCase())));
  const toggle = (k: string) => setSel(s => s.includes(k) ? s.filter(x => x !== k) : [...s, k]);
  const web = (t: string) => "https://www.google.com/search?q=" + encodeURIComponent(t + " poisoning management guideline 2026");
  const pub = (t: string) => "https://pubmed.ncbi.nlm.nih.gov/?term=" + encodeURIComponent(t + " poisoning guideline") + "&sort=date";

  return (
    <main className="max-w-3xl mx-auto p-3">
      <h1 className="text-xl font-bold text-rose-800">Poisoning &amp; Drug Overdose Assistant</h1>
      <p className="text-xs text-slate-500 mb-2">Based on Harrison&apos;s Ch.459 (Mycyk). Decision support only; not a substitute for clinical judgment or poison center advice.</p>
      <div className="flex gap-1 overflow-x-auto mb-3">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={"px-3 py-1.5 rounded-full text-sm whitespace-nowrap " + (tab === t ? "bg-rose-700 text-white" : "bg-white border")}>{t}</button>
        ))}
      </div>

      {tab === "Assess" && (<>
        <div className={card}>
          <h2 className="font-semibold mb-2">1. Select findings (symptoms, signs, labs)</h2>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(SYMPTOMS).map(([k, v]) => (
              <button key={k} onClick={() => toggle(k)}
                className={"px-2 py-1 rounded-lg text-xs border " + (sel.includes(k) ? "bg-rose-100 border-rose-500" : "bg-slate-50")}>{v}</button>
            ))}
          </div>
          {sel.length > 0 && <button className="mt-2 text-xs text-rose-700 underline" onClick={() => setSel([])}>Clear all</button>}
        </div>
        <div className={card + " bg-amber-50"}>
          <b className="text-sm">History to obtain:</b>
          <p className="text-xs">Time, route, duration, circumstances and intent; name and amount of each drug/chemical; onset and severity of symptoms; first aid given; medical/psychiatric history; occupation. Check all medications in the home, pill imprint codes, SDS for chemicals, prescription monitoring program. Consider body packing or stuffing and extended-release products.</p>
        </div>
        <h2 className="font-semibold mb-2">2. Differential diagnosis (toxidromes), tests and treatment</h2>
        {!ranked.length && <p className="text-sm text-slate-500">Select findings above to see ranked toxidromes.</p>}
        {ranked.map(({ t, hit }) => (
          <div key={t.id} className={card}>
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-semibold">{t.name}</h3>
              <span className="text-xs bg-slate-100 rounded px-2 py-0.5">{t.state} · {hit}/{t.s.length} match</span>
            </div>
            <p className="text-xs text-slate-600 my-1"><b>Typical agents:</b> {t.agents}</p>
            <p className="text-sm font-medium mt-2">Suggested tests</p>
            <ul className="list-disc ml-5 text-sm">{t.tests.map(x => <li key={x}>{x}</li>)}</ul>
            <p className="text-sm font-medium mt-2">Treatment</p>
            <p className="text-sm">{t.tx}</p>
            <div className="mt-2 text-xs flex gap-3">
              <a className="text-blue-700 underline" target="_blank" href={pub(t.name)}>PubMed latest</a>
              <a className="text-blue-700 underline" target="_blank" href={web(t.name)}>Web guidelines</a>
            </div>
          </div>
        ))}
        <p className="text-xs text-slate-500 mt-2">{HELP}</p>
      </>)}

      {tab === "Toxidromes" && (<>
        <p className="text-sm mb-2">Table 459-1: poisoning differential by physiologic state, with example drugs for each class.</p>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filter by drug or class…" className="w-full border rounded-lg p-2 mb-3 text-sm" />
        {TABLE1.map(st => (
          <details key={st.state} open className={card}>
            <summary className="font-semibold cursor-pointer">{st.state}</summary>
            {st.groups.map(g => {
              const items = g.items.filter(i => (g.g + i.join(" ")).toLowerCase().includes(q.toLowerCase()));
              if (!items.length) return null;
              return (<div key={g.g} className="mt-2">
                <p className="text-sm font-medium text-rose-800">{g.g}</p>
                <ul className="ml-4 list-disc text-sm">{items.map(i => (<li key={i[0]}><b>{i[0]}:</b> <span className="text-slate-600">{i[1]}</span></li>))}</ul>
              </div>);
            })}
          </details>))}
      </>)}

      {tab === "Pathophysiology" && (<>
        <h2 className="font-semibold mb-2">Physiologic states</h2>
        {STATES.map(s => (<div key={s.n} className={card}><b>{s.n}</b><p className="text-sm">{s.d}</p><p className="text-xs text-slate-500">{s.ex}</p></div>))}
        <h2 className="font-semibold my-2">Severity grading</h2>
        <div className={card}>{GRADES.map(g => (<p key={g[0]} className="text-sm mb-1"><b>{g[0]}:</b> {g[1]}</p>))}</div>
        <h2 className="font-semibold my-2">Mechanisms by toxidrome</h2>
        {TOX.map(t => (<div key={t.id} className={card}><b>{t.name}</b><p className="text-sm">{t.mech}</p></div>))}
      </>)}

      {tab === "Treatment" && TREAT.map(([h, b]) => (
        <div key={h} className={card}><b>{h}</b><p className="text-sm">{b}</p></div>))}

      {tab === "Search" && (<>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search poison, drug, antidote, symptom…"
          className="w-full border rounded-lg p-2 mb-2 text-sm" />
        <div className="flex gap-1 mb-3 overflow-x-auto">
          {["All", "Stimulated", "Depressed", "Discordant", "Normal"].map(s => (
            <button key={s} onClick={() => setState(s)} className={"px-2 py-1 rounded text-xs " + (state === s ? "bg-slate-800 text-white" : "bg-white border")}>{s}</button>))}
        </div>
        <p className="text-xs text-slate-500 mb-2">{agents.length} results</p>
        {agents.map(a => (
          <div key={a[0]} className={card}>
            <div className="flex justify-between gap-2"><b className="text-sm">{a[0]}</b><span className="text-xs bg-slate-100 rounded px-2 h-fit">{a[1]}</span></div>
            <p className="text-xs text-slate-600 mt-1"><b>Mechanism:</b> {a[2]}</p>
            <p className="text-sm mt-1"><b>Treatment:</b> {a[3]}</p>
            <div className="mt-1 text-xs flex gap-3">
              <a className="text-blue-700 underline" target="_blank" href={pub(a[0])}>PubMed latest</a>
              <a className="text-blue-700 underline" target="_blank" href={web(a[0])}>Web guidelines</a>
            </div>
          </div>))}
      </>)}

      {tab === "Updates" && (<>
        <p className="text-sm mb-2">Guideline updates found after the textbook edition (web search, Oct 2026). Use the PubMed and Web buttons on any result for the newest evidence.</p>
        {UPDATES.map(u => (
          <div key={u.t} className={card}><b className="text-sm">{u.t}</b><p className="text-sm">{u.n}</p>
            <a className="text-xs text-blue-700 underline" target="_blank" href={u.u}>Source</a></div>))}
      </>)}
    </main>
  );
}
