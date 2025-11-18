"use client";
import { useState } from "react";
import { saveAs } from "file-saver";
import Image from "next/image";

const kriterien = ["Sprint", "Sprung", "Reproduzierbarkeit", "Treffgenauigkeit"];
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
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6 animate-slideIn">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <Image src="/logo.png" alt="Weitsprung Logo" width={140} height={140} className="relative rounded-full shadow-2xl" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold gradient-text leading-tight">
            Weitsprung Bewertung
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            RadDWB Web-App zur Genauigkeitsmessung im Weitsprung in der Schule EF
          </p>
          <div className="flex justify-center gap-2 text-sm text-gray-500">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm card-shadow">
              🏃 Sprint
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm card-shadow">
              🦘 Sprung
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm card-shadow">
              🔄 Reproduzierbarkeit
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm card-shadow">
              🎯 Treffgenauigkeit
            </span>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl card-shadow-lg p-6 sm:p-8 space-y-6 animate-slideIn">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">📝</span>
            Neue Bewertung erfassen
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Schüler/in Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Namen eingeben..."
                className="input-modern p-3 w-full text-lg shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {kriterien.map((k, idx) => (
                <div key={k} className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>{['🏃', '🦘', '🔄', '🎯'][idx]}</span>
                    {k}
                  </label>
                  <select
                    value={werte[k]}
                    onChange={e => handle(k, e.target.value)}
                    className="input-modern p-3 w-full text-lg shadow-sm cursor-pointer hover:border-cyan-400 bg-white"
                  >
                    <option value="">Bitte wählen...</option>
                    {[1, 2, 3].map(v => <option key={v} value={v}>Stufe {v}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={speichern}
                disabled={!name || Object.values(werte).some(v => !v)}
                className="btn-gradient text-white font-semibold px-8 py-3 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                <span className="text-xl">💾</span>
                Bewertung speichern
              </button>
              <button
                onClick={exportCSV}
                disabled={liste.length === 0}
                className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span className="text-xl">📊</span>
                CSV exportieren
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
        {liste.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl card-shadow-lg p-6 sm:p-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">📋</span>
              Bewertungsübersicht
              <span className="ml-auto text-sm font-normal bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-1 rounded-full">
                {liste.length} {liste.length === 1 ? 'Eintrag' : 'Einträge'}
              </span>
            </h2>

            <div className="overflow-x-auto -mx-6 sm:-mx-8 px-6 sm:px-8">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden rounded-xl border-2 border-gray-200">
                  <table className="min-w-full divide-y-2 divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600">
                      <tr>
                        <th className="px-4 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Name</th>
                        {kriterien.map((k, idx) => (
                          <th key={k} className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                            <div className="flex flex-col items-center gap-1">
                              <span>{['🏃', '🦘', '🔄', '🎯'][idx]}</span>
                              <span>{k}</span>
                            </div>
                          </th>
                        ))}
                        <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Gesamt</th>
                        <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">15-Punkte</th>
                        <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Note</th>
                        <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Aktion</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {liste.map((a, i) => (
                        <tr key={i} className="hover:bg-blue-50 transition-colors duration-150">
                          <td className="px-4 py-4 whitespace-nowrap font-semibold text-gray-900">{a.name}</td>
                          {kriterien.map(k => (
                            <td key={k} className="px-4 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700 font-bold">
                                {a[k]}
                              </span>
                            </td>
                          ))}
                          <td className="px-4 py-4 text-center font-semibold text-gray-900">{a.gesamt}</td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                              {a.punkte15}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                              {a.note}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => loeschen(i)}
                              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 font-bold transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                              title="Eintrag löschen"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
