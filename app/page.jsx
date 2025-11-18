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
  const [gewichtung, setGewichtung] = useState({ Sprint: 25, Sprung: 25, Reproduzierbarkeit: 25, Treffgenauigkeit: 25 });
  const [showInfo, setShowInfo] = useState(false);

  const handle = (k, v) => setWerte(prev => ({ ...prev, [k]: v }));

  const handleGewichtung = (key, newValue) => {
    const currentTotal = gewichtung.Sprint + gewichtung.Sprung + gewichtung.Reproduzierbarkeit + gewichtung.Treffgenauigkeit;
    const oldValue = gewichtung[key];
    const diff = newValue - oldValue;

    // Berechne die Summe der anderen drei Werte
    const otherKeys = kriterien.filter(k => k !== key);
    const otherSum = otherKeys.reduce((sum, k) => sum + gewichtung[k], 0);

    if (otherSum === 0 && diff > 0) return; // Verhindere Division durch Null

    // Erstelle neue Gewichtung
    const newGewichtung = { ...gewichtung, [key]: newValue };

    // Verteile die Differenz proportional auf die anderen
    const remaining = 100 - newValue;
    if (remaining >= 0 && otherSum > 0) {
      otherKeys.forEach(k => {
        const proportion = gewichtung[k] / otherSum;
        newGewichtung[k] = Math.max(0, Math.round(remaining * proportion));
      });

      // Korrigiere Rundungsfehler
      const actualTotal = newGewichtung.Sprint + newGewichtung.Sprung + newGewichtung.Reproduzierbarkeit + newGewichtung.Treffgenauigkeit;
      if (actualTotal !== 100) {
        const firstOtherKey = otherKeys[0];
        newGewichtung[firstOtherKey] += (100 - actualTotal);
      }
    }

    setGewichtung(newGewichtung);
  };

  const rechne = (d) => {
    const g = ["Sprint", "Sprung", "Reproduzierbarkeit", "Treffgenauigkeit"].map(k => parseInt(d[k]));
    const w = [gewichtung.Sprint, gewichtung.Sprung, gewichtung.Reproduzierbarkeit, gewichtung.Treffgenauigkeit];
    const sum = (g[0] * w[0] + g[1] * w[1] + g[2] * w[2] + g[3] * w[3]) / 100;
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
            Web-App Bewertung Weitsprung (EPh)
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Zur Genauigkeitsmessung im Weitsprung in der Schule
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

        {/* Gewichtungs-Slider */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl card-shadow-lg p-6 sm:p-8 space-y-6 animate-slideIn">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-3xl">⚖️</span>
              Gewichtung anpassen
              <span className="ml-4 text-sm font-normal text-gray-500">
                Summe: {gewichtung.Sprint + gewichtung.Sprung + gewichtung.Reproduzierbarkeit + gewichtung.Treffgenauigkeit}%
              </span>
            </h2>
            <button
              onClick={() => setShowInfo(true)}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold text-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
              title="Hilfe zur Gewichtung"
            >
              ?
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {kriterien.map((k, idx) => (
              <div key={k} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-xl">{['🏃', '🦘', '🔄', '🎯'][idx]}</span>
                    {k}
                  </label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white min-w-[60px] justify-center">
                    {gewichtung[k]}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gewichtung[k]}
                  onChange={(e) => handleGewichtung(k, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-custom"
                  style={{
                    background: `linear-gradient(to right, #0891b2 0%, #0891b2 ${gewichtung[k]}%, #e5e7eb ${gewichtung[k]}%, #e5e7eb 100%)`
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
            <button
              onClick={() => setGewichtung({ Sprint: 25, Sprung: 25, Reproduzierbarkeit: 25, Treffgenauigkeit: 25 })}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-all duration-200"
            >
              🔄 Zurücksetzen (25% je)
            </button>
            <button
              onClick={() => setGewichtung({ Sprint: 50, Sprung: 50, Reproduzierbarkeit: 0, Treffgenauigkeit: 0 })}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-all duration-200"
            >
              Leistung fokussiert
            </button>
            <button
              onClick={() => setGewichtung({ Sprint: 0, Sprung: 0, Reproduzierbarkeit: 50, Treffgenauigkeit: 50 })}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-all duration-200"
            >
              Genauigkeit fokussiert
            </button>
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

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowInfo(false)}>
          <div className="bg-white rounded-2xl card-shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-3xl">💡</span>
                  Gewichtung verstehen
                </h3>
                <button
                  onClick={() => setShowInfo(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Aktuelle Gewichtung */}
              <div className="bg-blue-50 rounded-xl p-5">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Aktuelle Gewichtung
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {kriterien.map((k, idx) => (
                    <div key={k} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <span>{['🏃', '🦘', '🔄', '🎯'][idx]}</span>
                        {k}
                      </span>
                      <span className="font-bold text-blue-600">{gewichtung[k]}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Was ist Gewichtung? */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">⚖️</span>
                  Was ist Gewichtung?
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  Die Gewichtung bestimmt, wie wichtig die einzelnen Parameter bei der Berechnung der Endnote sind.
                  Eine höhere Gewichtung bedeutet, dass dieser Parameter einen größeren Einfluss auf die Gesamtnote hat.
                </p>
              </div>

              {/* Standard-Einstellung */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  Standard-Einstellung (ausgeglichen)
                </h4>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Bei der Standard-Einstellung sind alle vier Parameter gleich wichtig:
                </p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>🏃 Sprint:</span>
                    <span className="font-bold">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🦘 Sprung:</span>
                    <span className="font-bold">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🔄 Reproduzierbarkeit:</span>
                    <span className="font-bold">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🎯 Treffgenauigkeit:</span>
                    <span className="font-bold">25%</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-2 flex justify-between font-bold">
                    <span>Gesamt:</span>
                    <span className="text-blue-600">100%</span>
                  </div>
                </div>
              </div>

              {/* Wie verstelle ich die Gewichtung? */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">🎚️</span>
                  Wie verstelle ich die Gewichtung?
                </h4>
                <ol className="text-gray-600 leading-relaxed space-y-2 list-decimal list-inside">
                  <li>Bewegen Sie einen der vier Slider nach rechts (höhere Gewichtung) oder links (niedrigere Gewichtung)</li>
                  <li>Die anderen drei Slider passen sich automatisch an, damit die Summe immer 100% bleibt</li>
                  <li>Die Anpassung erfolgt proportional zu den aktuellen Werten der anderen Parameter</li>
                </ol>
              </div>

              {/* Auswirkungen */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">📈</span>
                  Wie wirkt sich das aus?
                </h4>
                <div className="space-y-3">
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <p className="font-semibold text-green-800 mb-1">Beispiel 1: Leistung betonen</p>
                    <p className="text-sm text-gray-600">
                      Sprint 40%, Sprung 40%, Rest 20% → Die körperliche Leistung wird stärker bewertet als die technische Genauigkeit
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <p className="font-semibold text-purple-800 mb-1">Beispiel 2: Genauigkeit betonen</p>
                    <p className="text-sm text-gray-600">
                      Reproduzierbarkeit 40%, Treffgenauigkeit 40%, Rest 20% → Die technische Genauigkeit wird höher bewertet
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                    <p className="font-semibold text-orange-800 mb-1">Beispiel 3: Nur Sprint wichtig</p>
                    <p className="text-sm text-gray-600">
                      Sprint 100%, Rest 0% → Die Note basiert ausschließlich auf der Sprint-Leistung
                    </p>
                  </div>
                </div>
              </div>

              {/* Schnelleinstellungen */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  Schnelleinstellungen nutzen
                </h4>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Unterhalb der Slider finden Sie drei Buttons für häufig verwendete Einstellungen:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <span className="bg-gray-200 px-3 py-1 rounded-lg text-sm font-medium">🔄 Zurücksetzen</span>
                    <span className="text-sm text-gray-600">→ Alle auf 25% (ausgeglichen)</span>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <span className="bg-gray-200 px-3 py-1 rounded-lg text-sm font-medium">Leistung fokussiert</span>
                    <span className="text-sm text-gray-600">→ Sprint & Sprung je 50%</span>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <span className="bg-gray-200 px-3 py-1 rounded-lg text-sm font-medium">Genauigkeit fokussiert</span>
                    <span className="text-sm text-gray-600">→ Reproduzierbarkeit & Treffgenauigkeit je 50%</span>
                  </div>
                </div>
              </div>

              {/* Schließen Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowInfo(false)}
                  className="w-full btn-gradient text-white font-semibold px-6 py-3 rounded-xl shadow-lg"
                >
                  Verstanden, schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copyright Footer */}
      <footer className="mt-12 pb-8 text-center">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl card-shadow px-6 py-4 inline-block">
          <p className="text-sm text-gray-600">
            © DwB 2025 • Version 1.1
          </p>
        </div>
      </footer>
    </main>
  );
}
