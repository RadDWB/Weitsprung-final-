"use client";
import { useState } from "react";
import { saveAs } from "file-saver";
import Image from "next/image";

// Umbenannte Kriterien
const kriterien = ["Anlaufgestaltung", "Sprungausführung", "Reproduzierbarkeit (3 Versuche)", "Nähe zum Absprungpunkt/-bereich"];
const kriterienKurz = ["Anlauf", "Sprung", "Reproduzierbarkeit", "Absprunggenauigkeit"];

// Standard Weitsprung-Tabellen für EPh
const defaultTabellen = {
  "Jungen EPh": [
    { note: "1+", von: 5.20, bis: 999 },
    { note: "1", von: 5.00, bis: 5.19 },
    { note: "1-", von: 4.80, bis: 4.99 },
    { note: "2+", von: 4.60, bis: 4.79 },
    { note: "2", von: 4.40, bis: 4.59 },
    { note: "2-", von: 4.20, bis: 4.39 },
    { note: "3+", von: 4.00, bis: 4.19 },
    { note: "3", von: 3.80, bis: 3.99 },
    { note: "3-", von: 3.60, bis: 3.79 },
    { note: "4+", von: 3.40, bis: 3.59 },
    { note: "4", von: 3.20, bis: 3.39 },
    { note: "4-", von: 3.00, bis: 3.19 },
    { note: "5+", von: 2.80, bis: 2.99 },
    { note: "5", von: 2.60, bis: 2.79 },
    { note: "5-", von: 2.40, bis: 2.59 },
    { note: "6", von: 0, bis: 2.39 }
  ],
  "Mädchen EPh": [
    { note: "1+", von: 4.20, bis: 999 },
    { note: "1", von: 4.00, bis: 4.19 },
    { note: "1-", von: 3.80, bis: 3.99 },
    { note: "2+", von: 3.60, bis: 3.79 },
    { note: "2", von: 3.40, bis: 3.59 },
    { note: "2-", von: 3.20, bis: 3.39 },
    { note: "3+", von: 3.00, bis: 3.19 },
    { note: "3", von: 2.80, bis: 2.99 },
    { note: "3-", von: 2.60, bis: 2.79 },
    { note: "4+", von: 2.40, bis: 2.59 },
    { note: "4", von: 2.20, bis: 2.39 },
    { note: "4-", von: 2.00, bis: 2.19 },
    { note: "5+", von: 1.80, bis: 1.99 },
    { note: "5", von: 1.60, bis: 1.79 },
    { note: "5-", von: 1.40, bis: 1.59 },
    { note: "6", von: 0, bis: 1.39 }
  ]
};

export default function Page() {
  const [name, setName] = useState("");
  const [geschlecht, setGeschlecht] = useState("Jungen EPh");
  const [meter, setMeter] = useState("");
  const [zentimeter, setZentimeter] = useState("");
  const [werte, setWerte] = useState({
    Anlaufgestaltung: "",
    Sprungausführung: "",
    "Reproduzierbarkeit (3 Versuche)": "",
    "Nähe zum Absprungpunkt/-bereich": ""
  });
  const [liste, setListe] = useState([]);
  const [gewichtung, setGewichtung] = useState({
    qualitativ: 50,
    quantitativ: 50
  });
  const [gewichtungQualitativ, setGewichtungQualitativ] = useState({
    Anlaufgestaltung: 25,
    Sprungausführung: 25,
    "Reproduzierbarkeit (3 Versuche)": 25,
    "Nähe zum Absprungpunkt/-bereich": 25
  });
  const [tabellen, setTabellen] = useState(defaultTabellen);
  const [showInfo, setShowInfo] = useState(false);
  const [showTabellenEditor, setShowTabellenEditor] = useState(false);
  const [editTabelle, setEditTabelle] = useState("Jungen EPh");

  const handle = (k, v) => setWerte(prev => ({ ...prev, [k]: v }));

  const handleGewichtungQualitativ = (key, newValue) => {
    const otherKeys = kriterien.filter(k => k !== key);
    const otherSum = otherKeys.reduce((sum, k) => sum + gewichtungQualitativ[k], 0);
    if (otherSum === 0 && newValue < gewichtungQualitativ[key]) return;

    const newGewichtung = { ...gewichtungQualitativ, [key]: newValue };
    const remaining = 100 - newValue;

    if (remaining >= 0 && otherSum > 0) {
      otherKeys.forEach(k => {
        const proportion = gewichtungQualitativ[k] / otherSum;
        newGewichtung[k] = Math.max(0, Math.round(remaining * proportion));
      });

      const actualTotal = Object.values(newGewichtung).reduce((a, b) => a + b, 0);
      if (actualTotal !== 100) {
        newGewichtung[otherKeys[0]] += (100 - actualTotal);
      }
    }

    setGewichtungQualitativ(newGewichtung);
  };

  const berechneNoteAusWeite = (weite) => {
    const tabelle = tabellen[geschlecht];
    for (const eintrag of tabelle) {
      if (weite >= eintrag.von && weite <= eintrag.bis) {
        return eintrag.note;
      }
    }
    return "6";
  };

  const noteZuPunkten = (note) => {
    const notenMap = {
      '1+': 3, '1': 2.75, '1-': 2.5,
      '2+': 2.25, '2': 2, '2-': 1.75,
      '3+': 1.5, '3': 1.25, '3-': 1,
      '4+': 0.75, '4': 0.5, '4-': 0.25,
      '5+': 0.125, '5': 0.0625, '5-': 0.03125,
      '6': 0
    };
    return notenMap[note] || 0;
  };

  const punkteZuNote = (punkte) => {
    if (punkte >= 3) return '1+';
    if (punkte >= 2.75) return '1';
    if (punkte >= 2.5) return '1-';
    if (punkte >= 2.25) return '2+';
    if (punkte >= 2) return '2';
    if (punkte >= 1.75) return '2-';
    if (punkte >= 1.5) return '3+';
    if (punkte >= 1.25) return '3';
    if (punkte >= 1) return '3-';
    if (punkte >= 0.75) return '4+';
    if (punkte >= 0.5) return '4';
    if (punkte >= 0.25) return '4-';
    if (punkte >= 0.125) return '5+';
    if (punkte >= 0.0625) return '5';
    if (punkte >= 0.03125) return '5-';
    return '6';
  };

  const rechne = (d, weiteInMetern, geschlechtParam) => {
    // Qualitative Bewertung
    const qualitativeNoten = kriterien.map(k => noteZuPunkten(d[k]));
    const qualitativeGewichte = kriterien.map(k => gewichtungQualitativ[k]);
    const qualitativSum = qualitativeNoten.reduce((sum, note, idx) =>
      sum + (note * qualitativeGewichte[idx]), 0) / 100;

    // Quantitative Bewertung (Weite)
    const weiteNote = berechneNoteAusWeite(weiteInMetern);
    const quantitativSum = noteZuPunkten(weiteNote);

    // Gesamtbewertung
    const gesamt = (qualitativSum * gewichtung.qualitativ + quantitativSum * gewichtung.quantitativ) / 100;
    const endnote = punkteZuNote(gesamt);

    return {
      qualitativNote: punkteZuNote(qualitativSum),
      quantitativNote: weiteNote,
      gesamt: gesamt.toFixed(2),
      note: endnote,
      weite: weiteInMetern.toFixed(2)
    };
  };

  const speichern = () => {
    const weiteInMetern = parseFloat(meter || 0) + parseFloat(zentimeter || 0) / 100;
    const res = rechne(werte, weiteInMetern, geschlecht);
    setListe([...liste, { name, geschlecht, ...werte, ...res }]);
    setName("");
    setMeter("");
    setZentimeter("");
    setWerte({
      Anlaufgestaltung: "",
      Sprungausführung: "",
      "Reproduzierbarkeit (3 Versuche)": "",
      "Nähe zum Absprungpunkt/-bereich": ""
    });
  };

  const loeschen = (index) => {
    const neu = [...liste];
    neu.splice(index, 1);
    setListe(neu);
  };

  const exportCSV = () => {
    const header = ["Name", "Geschlecht", "Weite (m)", ...kriterienKurz, "Qualitativ", "Quantitativ", "Gesamt", "Endnote"];
    const rows = liste.map(a => [
      a.name,
      a.geschlecht,
      a.weite,
      ...kriterien.map(k => a[k]),
      a.qualitativNote,
      a.quantitativNote,
      a.gesamt,
      a.note
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    saveAs(new Blob([csv], { type: "text/csv" }), "weitsprung_bewertung.csv");
  };

  const exportTabelleCSV = (tabelleName) => {
    const tabelle = tabellen[tabelleName];
    const header = ["Note", "Von (m)", "Bis (m)"];
    const rows = tabelle.map(e => [e.note, e.von, e.bis === 999 ? "∞" : e.bis]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    saveAs(new Blob([csv], { type: "text/csv" }), `tabelle_${tabelleName.replace(/\s+/g, '_')}.csv`);
  };

  const updateTabellenEintrag = (tabelleName, index, field, value) => {
    const newTabellen = { ...tabellen };
    newTabellen[tabelleName][index][field] = field === 'note' ? value : parseFloat(value);
    setTabellen(newTabellen);
  };

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
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
            Qualitative und quantitative Bewertung im Weitsprung
          </p>
          <div className="flex justify-center gap-2 text-sm text-gray-500 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm card-shadow">
              🏃 Anlaufgestaltung
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm card-shadow">
              🦘 Sprungausführung
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm card-shadow">
              🔄 Reproduzierbarkeit
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm card-shadow">
              🎯 Absprunggenauigkeit
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white card-shadow">
              📏 Weite
            </span>
          </div>
        </div>

        {/* Gewichtung Qualitativ/Quantitativ */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl card-shadow-lg p-6 sm:p-8 space-y-6 animate-slideIn">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">⚖️</span>
            Hauptgewichtung: Qualitativ vs. Quantitativ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">🎨 Qualitativ (Technik)</label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white min-w-[60px] justify-center">
                  {gewichtung.qualitativ}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={gewichtung.qualitativ}
                onChange={(e) => setGewichtung({
                  qualitativ: parseInt(e.target.value),
                  quantitativ: 100 - parseInt(e.target.value)
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-custom"
                style={{
                  background: `linear-gradient(to right, #9333ea 0%, #9333ea ${gewichtung.qualitativ}%, #e5e7eb ${gewichtung.qualitativ}%, #e5e7eb 100%)`
                }}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">📏 Quantitativ (Weite)</label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white min-w-[60px] justify-center">
                  {gewichtung.quantitativ}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={gewichtung.quantitativ}
                onChange={(e) => setGewichtung({
                  quantitativ: parseInt(e.target.value),
                  qualitativ: 100 - parseInt(e.target.value)
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-custom"
                style={{
                  background: `linear-gradient(to right, #0891b2 0%, #0891b2 ${gewichtung.quantitativ}%, #e5e7eb ${gewichtung.quantitativ}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>
        </div>

        {/* Gewichtungs-Slider für qualitative Kriterien */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl card-shadow-lg p-6 sm:p-8 space-y-6 animate-slideIn">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-3xl">🎨</span>
              Qualitative Gewichtung
              <span className="ml-4 text-sm font-normal text-gray-500">
                Summe: {Object.values(gewichtungQualitativ).reduce((a, b) => a + b, 0)}%
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
                    <span className="truncate">{kriterienKurz[idx]}</span>
                  </label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white min-w-[60px] justify-center">
                    {gewichtungQualitativ[k]}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gewichtungQualitativ[k]}
                  onChange={(e) => handleGewichtungQualitativ(k, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-custom"
                  style={{
                    background: `linear-gradient(to right, #9333ea 0%, #9333ea ${gewichtungQualitativ[k]}%, #e5e7eb ${gewichtungQualitativ[k]}%, #e5e7eb 100%)`
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
            <button
              onClick={() => setGewichtungQualitativ({
                Anlaufgestaltung: 25,
                Sprungausführung: 25,
                "Reproduzierbarkeit (3 Versuche)": 25,
                "Nähe zum Absprungpunkt/-bereich": 25
              })}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-all duration-200"
            >
              🔄 Zurücksetzen (25% je)
            </button>
          </div>
        </div>

        {/* Tabellen-Editor Button */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl card-shadow-lg p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-3xl">📊</span>
                Weitsprung-Tabellen verwalten
              </h2>
              <p className="text-sm text-gray-600 mt-1">Passen Sie die Notentabellen an Ihre Bedürfnisse an</p>
            </div>
            <button
              onClick={() => setShowTabellenEditor(true)}
              className="btn-gradient text-white font-semibold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
            >
              <span className="text-xl">✏️</span>
              Tabellen bearbeiten
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Geschlecht / Tabelle
                </label>
                <select
                  value={geschlecht}
                  onChange={e => setGeschlecht(e.target.value)}
                  className="input-modern p-3 w-full text-lg shadow-sm cursor-pointer hover:border-cyan-400 bg-white"
                >
                  {Object.keys(tabellen).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">📏</span>
                Weitsprung-Weite
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meter
                  </label>
                  <select
                    value={meter}
                    onChange={e => setMeter(e.target.value)}
                    className="input-modern p-3 w-full text-lg shadow-sm cursor-pointer bg-white"
                  >
                    <option value="">-</option>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(m => (
                      <option key={m} value={m}>{m} m</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Zentimeter
                  </label>
                  <select
                    value={zentimeter}
                    onChange={e => setZentimeter(e.target.value)}
                    className="input-modern p-3 w-full text-lg shadow-sm cursor-pointer bg-white"
                  >
                    <option value="">-</option>
                    {Array.from({ length: 100 }, (_, i) => i).map(cm => (
                      <option key={cm} value={cm}>{cm} cm</option>
                    ))}
                  </select>
                </div>
              </div>
              {meter && (
                <p className="text-sm text-gray-600 mt-3 font-semibold">
                  Gesamtweite: {parseFloat(meter || 0) + parseFloat(zentimeter || 0) / 100} m
                  → Note: {berechneNoteAusWeite(parseFloat(meter || 0) + parseFloat(zentimeter || 0) / 100)}
                </p>
              )}
            </div>

            <div className="bg-purple-50 rounded-xl p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">🎨</span>
                Qualitative Bewertung
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {kriterien.map((k, idx) => (
                  <div key={k} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span>{['🏃', '🦘', '🔄', '🎯'][idx]}</span>
                      {kriterienKurz[idx]}
                    </label>
                    <select
                      value={werte[k]}
                      onChange={e => handle(k, e.target.value)}
                      className="input-modern p-3 w-full text-lg shadow-sm cursor-pointer hover:border-cyan-400 bg-white"
                    >
                      <option value="">Bitte wählen...</option>
                      {['1+', '1', '1-', '2+', '2', '2-', '3+', '3', '3-', '4+', '4', '4-', '5+', '5', '5-', '6'].map(note => (
                        <option key={note} value={note}>{note}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={speichern}
                disabled={!name || !meter || Object.values(werte).some(v => !v)}
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
                        <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Geschlecht</th>
                        <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Weite</th>
                        {kriterienKurz.map((k, idx) => (
                          <th key={k} className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                            <div className="flex flex-col items-center gap-1">
                              <span>{['🏃', '🦘', '🔄', '🎯'][idx]}</span>
                              <span className="text-xs">{k}</span>
                            </div>
                          </th>
                        ))}
                        <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Qualitativ</th>
                        <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Quantitativ</th>
                        <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Endnote</th>
                        <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Aktion</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {liste.map((a, i) => (
                        <tr key={i} className="hover:bg-blue-50 transition-colors duration-150">
                          <td className="px-4 py-4 whitespace-nowrap font-semibold text-gray-900">{a.name}</td>
                          <td className="px-4 py-4 text-center text-sm text-gray-600">{a.geschlecht}</td>
                          <td className="px-4 py-4 text-center font-semibold text-blue-600">{a.weite} m</td>
                          {kriterien.map(k => (
                            <td key={k} className="px-4 py-4 text-center">
                              <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-bold text-sm">
                                {a[k]}
                              </span>
                            </td>
                          ))}
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                              {a.qualitativNote}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                              {a.quantitativNote}
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

      {/* Tabellen-Editor Modal */}
      {showTabellenEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto" onClick={() => setShowTabellenEditor(false)}>
          <div className="bg-white rounded-2xl card-shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white p-6 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-3xl">📊</span>
                  Weitsprung-Tabellen Editor
                </h3>
                <button
                  onClick={() => setShowTabellenEditor(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <label className="font-semibold text-gray-700">Tabelle auswählen:</label>
                <select
                  value={editTabelle}
                  onChange={(e) => setEditTabelle(e.target.value)}
                  className="input-modern p-2 text-lg cursor-pointer bg-white"
                >
                  {Object.keys(tabellen).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button
                  onClick={() => exportTabelleCSV(editTabelle)}
                  className="ml-auto bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <span>📥</span>
                  Exportieren
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border border-gray-300 text-left font-bold">Note</th>
                      <th className="px-4 py-2 border border-gray-300 text-left font-bold">Von (m)</th>
                      <th className="px-4 py-2 border border-gray-300 text-left font-bold">Bis (m)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabellen[editTabelle].map((eintrag, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border border-gray-300">
                          <input
                            type="text"
                            value={eintrag.note}
                            onChange={(e) => updateTabellenEintrag(editTabelle, idx, 'note', e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          <input
                            type="number"
                            step="0.01"
                            value={eintrag.von}
                            onChange={(e) => updateTabellenEintrag(editTabelle, idx, 'von', e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          <input
                            type="number"
                            step="0.01"
                            value={eintrag.bis === 999 ? '' : eintrag.bis}
                            placeholder="∞"
                            onChange={(e) => updateTabellenEintrag(editTabelle, idx, 'bis', e.target.value || 999)}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setTabellen(defaultTabellen)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl"
                >
                  🔄 Auf Standard zurücksetzen
                </button>
                <button
                  onClick={() => setShowTabellenEditor(false)}
                  className="ml-auto btn-gradient text-white font-semibold px-6 py-3 rounded-xl shadow-lg"
                >
                  Fertig
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal - gekürzte Version */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowInfo(false)}>
          <div className="bg-white rounded-2xl card-shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-3xl">💡</span>
                  Bewertungssystem verstehen
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
              <div>
                <h4 className="font-bold text-gray-800 mb-2">🎯 Wie funktioniert die Bewertung?</h4>
                <p className="text-gray-600 leading-relaxed">
                  Die Gesamtnote setzt sich aus zwei Teilen zusammen:
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                  <li><strong>Qualitativ ({gewichtung.qualitativ}%)</strong>: Technische Bewertung (Anlauf, Sprung, Reproduzierbarkeit, Genauigkeit)</li>
                  <li><strong>Quantitativ ({gewichtung.quantitativ}%)</strong>: Weitsprung-Weite basierend auf Notentabellen</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">⚖️ Gewichtung anpassen</h4>
                <p className="text-gray-600 leading-relaxed">
                  Sie können die Gewichtung zwischen qualitativen und quantitativen Kriterien frei anpassen.
                  Innerhalb der qualitativen Bewertung können Sie zudem die vier Teilkriterien gewichten.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">📊 Tabellen bearbeiten</h4>
                <p className="text-gray-600 leading-relaxed">
                  Im Tabellen-Editor können Sie die Notengrenzen für die Weitsprung-Weite an Ihre Anforderungen anpassen
                  und als CSV exportieren.
                </p>
              </div>

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
