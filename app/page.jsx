"use client";
import { useState } from "react";
import { saveAs } from "file-saver";
import Image from "next/image";

// Umbenannte Kriterien
const kriterien = ["Anlaufgestaltung", "Sprungausführung", "Reproduzierbarkeit (3 Versuche)", "Nähe zum Absprungpunkt/-bereich"];
const kriterienKurz = ["Anlauf", "Sprung", "Reproduzierbarkeit", "Absprunggenauigkeit"];

// Offizielle NRW-Weitsprung-Tabellen (basierend auf RNG Wangen, Reismann-Gymnasium, DSA)
const officialTables = {
  "grades_1_10": {
    "1": { age: 6, boys: { 1: 2.95, 2: 2.54, 3: 2.08, 4: 1.63, 5: 1.01 }, girls: { 1: 2.60, 2: 2.22, 3: 1.92, 4: 1.40, 5: 1.10 } },
    "2": { age: 7, boys: { 1: 3.20, 2: 2.79, 3: 2.33, 4: 1.88, 5: 1.26 }, girls: { 1: 2.85, 2: 2.47, 3: 2.17, 4: 1.65, 5: 1.35 } },
    "3": { age: 8, boys: { 1: 3.45, 2: 3.04, 3: 2.58, 4: 2.13, 5: 1.51 }, girls: { 1: 3.10, 2: 2.72, 3: 2.42, 4: 1.90, 5: 1.60 } },
    "4": { age: 9, boys: { 1: 3.70, 2: 3.29, 3: 2.83, 4: 2.38, 5: 1.76 }, girls: { 1: 3.35, 2: 2.97, 3: 2.67, 4: 2.15, 5: 1.85 } },
    "5": { age: 10, boys: { 1: 3.95, 2: 3.54, 3: 3.08, 4: 2.63, 5: 2.01 }, girls: { 1: 3.60, 2: 3.22, 3: 2.92, 4: 2.40, 5: 2.10 } },
    "6": { age: 11, boys: { 1: 4.10, 2: 3.70, 3: 3.26, 4: 2.78, 5: 2.26 }, girls: { 1: 3.70, 2: 3.32, 3: 3.01, 4: 2.51, 5: 2.19 } },
    "7": { age: 12, boys: { 1: 4.25, 2: 3.84, 3: 3.40, 4: 2.91, 5: 2.38 }, girls: { 1: 3.80, 2: 3.42, 3: 3.10, 4: 2.62, 5: 2.28 } },
    "8": { age: 13, boys: { 1: 4.45, 2: 4.07, 3: 3.60, 4: 3.26, 5: 2.71 }, girls: { 1: 3.90, 2: 3.52, 3: 3.19, 4: 2.73, 5: 2.37 } },
    "9": { age: 14, boys: { 1: 4.80, 2: 4.45, 3: 4.06, 4: 3.71, 5: 3.22 }, girls: { 1: 4.00, 2: 3.62, 3: 3.28, 4: 2.84, 5: 2.46 } },
    "10": { age: 15, boys: { 1: 5.10, 2: 4.72, 3: 4.32, 4: 3.93, 5: 3.42 }, girls: { 1: 4.10, 2: 3.72, 3: 3.37, 4: 2.95, 5: 2.55 } }
  },
  "gost": {
    "EF": {
      age: 16,
      LK: { boys: { 1: 5.41, 2: 4.98, 3: 4.50, 4: 4.02, 5: 3.48 }, girls: { 1: 4.16, 2: 3.82, 3: 3.46, 4: 3.10, 5: 2.69 } },
      GK: { boys: { 1: 5.26, 2: 4.83, 3: 4.35, 4: 3.87, 5: 3.33 }, girls: { 1: 4.01, 2: 3.67, 3: 3.31, 4: 2.95, 5: 2.54 } }
    },
    "Q1": {
      age: 17,
      LK: { boys: { 1: 5.56, 2: 5.13, 3: 4.65, 4: 4.17, 5: 3.63 }, girls: { 1: 4.31, 2: 3.97, 3: 3.61, 4: 3.25, 5: 2.84 } },
      GK: { boys: { 1: 5.41, 2: 4.98, 3: 4.50, 4: 4.02, 5: 3.48 }, girls: { 1: 4.16, 2: 3.82, 3: 3.46, 4: 3.10, 5: 2.69 } }
    },
    "Q2": {
      age: 18,
      LK: { boys: { 1: 5.71, 2: 5.28, 3: 4.80, 4: 4.32, 5: 3.78 }, girls: { 1: 4.46, 2: 4.12, 3: 3.76, 4: 3.40, 5: 2.99 } },
      GK: { boys: { 1: 5.56, 2: 5.13, 3: 4.65, 4: 4.17, 5: 3.63 }, girls: { 1: 4.31, 2: 3.97, 3: 3.61, 4: 3.25, 5: 2.84 } }
    }
  }
};

// Generiere Tabellen-Optionen
const generateTableOptions = () => {
  const options = [];

  // Klassen 1-10
  for (let i = 1; i <= 10; i++) {
    options.push({ value: `K${i}-J`, label: `Klasse ${i} - Jungen (${officialTables.grades_1_10[i].age} Jahre)`, type: 'grades', grade: i, gender: 'boys' });
    options.push({ value: `K${i}-M`, label: `Klasse ${i} - Mädchen (${officialTables.grades_1_10[i].age} Jahre)`, type: 'grades', grade: i, gender: 'girls' });
  }

  // GOSt
  ['EF', 'Q1', 'Q2'].forEach(stufe => {
    ['GK', 'LK'].forEach(kurs => {
      const age = officialTables.gost[stufe].age;
      options.push({ value: `${stufe}-${kurs}-J`, label: `${stufe} ${kurs} - Jungen (${age} Jahre)`, type: 'gost', grade: stufe, kurs, gender: 'boys' });
      options.push({ value: `${stufe}-${kurs}-M`, label: `${stufe} ${kurs} - Mädchen (${age} Jahre)`, type: 'gost', grade: stufe, kurs, gender: 'girls' });
    });
  });

  return options;
};

const tableOptions = generateTableOptions();

export default function Page() {
  const [name, setName] = useState("");
  const [selectedTable, setSelectedTable] = useState("EF-GK-J");
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
  const [showInfo, setShowInfo] = useState(false);
  const [showTabellenInfo, setShowTabellenInfo] = useState(false);

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

  const getCurrentTableData = () => {
    const option = tableOptions.find(opt => opt.value === selectedTable);
    if (!option) return null;

    if (option.type === 'grades') {
      return officialTables.grades_1_10[option.grade][option.gender];
    } else {
      return officialTables.gost[option.grade][option.kurs][option.gender];
    }
  };

  const berechneNoteAusWeite = (weite) => {
    const tableData = getCurrentTableData();
    if (!tableData) return "6";

    // Finde passende Note basierend auf den Schwellenwerten
    if (weite >= tableData[1]) return "1";
    if (weite >= tableData[2]) return "2";
    if (weite >= tableData[3]) return "3";
    if (weite >= tableData[4]) return "4";
    if (weite >= tableData[5]) return "5";
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

  const rechne = (d, weiteInMetern) => {
    // Qualitative Bewertung
    const qualitativeNoten = kriterien.map(k => noteZuPunkten(d[k]));
    const qualitativeGewichte = kriterien.map(k => gewichtungQualitativ[k]);
    const qualitativSum = qualitativeNoten.reduce((sum, note, idx) =>
      sum + (note * qualitativeGewichte[idx]), 0) / 100;

    // Quantitative Bewertung (Weite) - offizielle Tabellen
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
    const res = rechne(werte, weiteInMetern);
    const tableLabel = tableOptions.find(opt => opt.value === selectedTable)?.label || selectedTable;
    setListe([...liste, { name, tabelle: tableLabel, ...werte, ...res }]);
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
    const header = ["Name", "Tabelle", "Weite (m)", ...kriterienKurz, "Qualitativ", "Quantitativ", "Gesamt", "Endnote"];
    const rows = liste.map(a => [
      a.name,
      a.tabelle,
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

  const getCurrentTableSummary = () => {
    const tableData = getCurrentTableData();
    if (!tableData) return null;

    return {
      note1: tableData[1],
      note2: tableData[2],
      note3: tableData[3],
      note4: tableData[4],
      note5: tableData[5]
    };
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
            Web-App Bewertung Weitsprung
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Qualitative und quantitative Bewertung im Weitsprung
          </p>
          <p className="text-sm text-gray-500">
            Offizielle NRW-Tabellen • Klassen 1-10 & GOSt (EF/Q1/Q2, GK/LK)
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

        {/* Tabellen-Info */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl card-shadow-lg p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-3xl">📊</span>
                Offizielle NRW-Weitsprung-Tabellen
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Quellen: RNG Wangen, Reismann-Gymnasium Bielefeld, DSA Quick-Check 2025
              </p>
            </div>
            <button
              onClick={() => setShowTabellenInfo(true)}
              className="btn-gradient text-white font-semibold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
            >
              <span className="text-xl">ℹ️</span>
              Tabellen ansehen
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
                  Klassenstufe / Geschlecht / Kurs
                </label>
                <select
                  value={selectedTable}
                  onChange={e => setSelectedTable(e.target.value)}
                  className="input-modern p-3 w-full text-lg shadow-sm cursor-pointer hover:border-cyan-400 bg-white"
                >
                  <optgroup label="Klasse 1-4 (Grundschule)">
                    {tableOptions.filter(opt => ['K1', 'K2', 'K3', 'K4'].some(k => opt.value.startsWith(k))).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Klasse 5-10 (Sekundarstufe I)">
                    {tableOptions.filter(opt => ['K5', 'K6', 'K7', 'K8', 'K9', 'K10'].some(k => opt.value.startsWith(k))).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="GOSt: EF (Einführungsphase)">
                    {tableOptions.filter(opt => opt.value.startsWith('EF')).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="GOSt: Q1 (Qualifikationsphase 1)">
                    {tableOptions.filter(opt => opt.value.startsWith('Q1')).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="GOSt: Q2 (Qualifikationsphase 2)">
                    {tableOptions.filter(opt => opt.value.startsWith('Q2')).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
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
                <div className="mt-3 p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold">
                    Gesamtweite: {parseFloat(meter || 0) + parseFloat(zentimeter || 0) / 100} m
                    → Note: <span className="text-blue-600 text-lg">{berechneNoteAusWeite(parseFloat(meter || 0) + parseFloat(zentimeter || 0) / 100)}</span>
                  </p>
                  {getCurrentTableSummary() && (
                    <div className="text-xs text-gray-500 mt-2">
                      Notengrenzen: 1={getCurrentTableSummary().note1}m | 2={getCurrentTableSummary().note2}m | 3={getCurrentTableSummary().note3}m | 4={getCurrentTableSummary().note4}m | 5={getCurrentTableSummary().note5}m
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-purple-50 rounded-xl p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">🎨</span>
                Qualitative Bewertung (Technik)
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
                        <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Tabelle</th>
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
                          <td className="px-4 py-4 text-center text-xs text-gray-600">{a.tabelle}</td>
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

      {/* Tabellen-Info Modal */}
      {showTabellenInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto" onClick={() => setShowTabellenInfo(false)}>
          <div className="bg-white rounded-2xl card-shadow-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto my-8" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white p-6 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-3xl">📊</span>
                  Offizielle NRW-Weitsprung-Tabellen
                </h3>
                <button
                  onClick={() => setShowTabellenInfo(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-700"><strong>Quellen:</strong></p>
                <ul className="text-xs text-gray-600 list-disc list-inside mt-2">
                  <li>RNG Wangen - Leichtathletik Notentabellen 2014</li>
                  <li>Reismann-Gymnasium Bielefeld - Sek II GK Tabellen</li>
                  <li>NRW Abitur Prüfungsanforderungen (Heft 4734/2)</li>
                  <li>Deutsches Sportabzeichen Quick-Check 2025 (LSB Sachsen-Anhalt)</li>
                </ul>
              </div>

              {/* Tabellen anzeigen - vereinfacht */}
              <div className="space-y-4">
                <h4 className="font-bold text-lg text-gray-800">Beispiel: EF (16 Jahre)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="font-semibold mb-2">Jungen - Grundkurs</p>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr><th className="p-2">Note</th><th className="p-2">Weite</th></tr>
                      </thead>
                      <tbody>
                        {[1,2,3,4,5].map(note => (
                          <tr key={note} className="border-t">
                            <td className="p-2 text-center font-bold">{note}</td>
                            <td className="p-2 text-center">{officialTables.gost.EF.GK.boys[note]} m</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="font-semibold mb-2">Mädchen - Grundkurs</p>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr><th className="p-2">Note</th><th className="p-2">Weite</th></tr>
                      </thead>
                      <tbody>
                        {[1,2,3,4,5].map(note => (
                          <tr key={note} className="border-t">
                            <td className="p-2 text-center font-bold">{note}</td>
                            <td className="p-2 text-center">{officialTables.gost.EF.GK.girls[note]} m</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowTabellenInfo(false)}
                  className="w-full btn-gradient text-white font-semibold px-6 py-3 rounded-xl shadow-lg"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
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
                  <li><strong>Qualitativ ({gewichtung.qualitativ}%)</strong>: Technische Bewertung mit 1+/1/1-/... System</li>
                  <li><strong>Quantitativ ({gewichtung.quantitativ}%)</strong>: Weitsprung-Weite basierend auf offiziellen NRW-Tabellen (1-5)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">📊 Offizielle Tabellen</h4>
                <p className="text-gray-600 leading-relaxed">
                  Die quantitative Bewertung nutzt offizielle Weitsprung-Tabellen aus NRW für Klassen 1-10 und GOSt (EF/Q1/Q2, jeweils GK und LK).
                  Diese basieren auf anerkannten Schulstandards und dem Deutschen Sportabzeichen.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">⚖️ Gewichtung anpassen</h4>
                <p className="text-gray-600 leading-relaxed">
                  Sie können die Gewichtung zwischen qualitativen und quantitativen Kriterien frei anpassen.
                  Innerhalb der qualitativen Bewertung können Sie zudem die vier Teilkriterien gewichten.
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
            © DwB 2025 • Version 2.0
          </p>
        </div>
      </footer>
    </main>
  );
}
