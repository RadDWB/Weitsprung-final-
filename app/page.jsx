"use client";
import { useState } from "react";
import { saveAs } from "file-saver";
import Image from "next/image";

const bewertungMap = { Sprint: 0.25, Sprung: 0.25, Reproduzierbarkeit: 0.25, Treffgenauigkeit: 0.25 };

export default function Page() {
  const [name, setName] = useState("");
  const [werte, setWerte] = useState({ Sprint: "", Sprung: "", Reproduzierbarkeit: "", Treffgenauigkeit: "" });
  const [liste, setListe] = useState([]);

  const handle = (k, v) => setWerte(prev => ({ ...prev, [k]: v }));
  const rechne = (d) => {
    const g = ["Sprint", "Sprung", "Reproduzierbarkeit", "Treffgenauigkeit"].map(k => parseInt(d[k]));
    const sum = g[0]*0.25 + g[1]*0.25 + ((g[2]+g[3])/2)*0.5;
    const punkte = Math.round(sum * 5);
    const notenMap = {15:'1+',14:'1',13:'1-',12:'2+',11:'2',10:'2-',9:'3+',8:'3',7:'3-',6:'4+',5:'4',4:'4-',3:'5+',2:'5',1:'5-',0:'6'};
    return { gesamt: sum.toFixed(2), punkte15: punkte, note: notenMap[punkte] || "-" };
  };

  const speichern = () => {
    const res = rechne(werte);
    setListe([...liste, { name, ...werte, ...res }]);
    setName(""); setWerte({ Sprint: "", Sprung: "", Reproduzierbarkeit: "", Treffgenauigkeit: "" });
  };

  const loeschen = (index) => {
    const neu = [...liste];
    neu.splice(index, 1);
    setListe(neu);
  };

  const exportCSV = () => {
    const header = ["Name", ...kriterien, "Gesamt", "15-Punkte", "Note"];
    const rows = liste.map(a => [a.name, ...kriterien.map(k => a[k]), a.gesamt, a.punkte15, a.note]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    saveAs(new Blob([csv], { type: "text/csv" }), "weitsprung.csv");
  };

  return (
    <main className="p-6 max-w-2xl mx-auto text-lg space-y-6">
      <h1 className="text-2xl font-bold text-center">RadDWB Web-App zur Genauigkeitsmessung im Weitsprung</h1>
      <p className="text-center text-gray-600">in der Schule EF zur Berechnung von 4 Einzelparametern</p>
      <div className="flex justify-center">
        <Image src="/logo.png" alt="Weitsprung Logo" width={120} height={120} />
      </div>

      <div className="space-y-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="border p-2 w-full rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {kriterien.map(k => (
            <div key={k} className="space-y-1">
              <label className="block">{k}</label>
              <select value={werte[k]} onChange={e => handle(k, e.target.value)} className="border p-2 w-full rounded">
                <option value="">-</option>
                {[1, 2, 3].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={speichern} className="bg-blue-600 text-white px-4 py-2 rounded">Speichern</button>
          <button onClick={exportCSV} className="border px-4 py-2 rounded">CSV exportieren</button>
        </div>
      </div>

      {liste.length > 0 && (
        <div className="overflow-x-auto">
          <table className="mt-6 w-full border text-sm sm:text-base">
            <thead>
              <tr>
                <th className="border px-2 py-1">Name</th>
                {kriterien.map(k => <th key={k} className="border px-2 py-1">{k}</th>)}
                <th className="border px-2 py-1">Gesamt</th>
                <th className="border px-2 py-1">15-Punkte</th>
                <th className="border px-2 py-1">Note</th>
                <th className="border px-2 py-1">🗑</th>
              </tr>
            </thead>
            <tbody>
              {liste.map((a, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{a.name}</td>
                  {kriterien.map(k => <td key={k} className="border px-2 py-1">{a[k]}</td>)}
                  <td className="border px-2 py-1">{a.gesamt}</td>
                  <td className="border px-2 py-1">{a.punkte15}</td>
                  <td className="border px-2 py-1">{a.note}</td>
                  <td className="border px-2 py-1 text-center">
                    <button onClick={() => loeschen(i)} className="text-red-600 font-bold">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
