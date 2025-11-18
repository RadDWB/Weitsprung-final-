"use client";
import { useState } from "react";
import { saveAs } from "file-saver";
import Image from "next/image";

// Umbenannte Kriterien
const kriterien = ["Anlaufgestaltung", "Sprungausführung", "Reproduzierbarkeit (3x)", "Genauigkeit zum Absprungpunkt/Zone"];
const kriterienKurz = ["Anlauf", "Sprung", "Reproduzierbarkeit", "Genauigkeit"];

// Offizielle NRW-Weitsprung-Tabellen
// Klassen 1-10: basierend auf RNG Wangen, Reismann-Gymnasium, DSA (1-5 Notensystem)
// GOSt: Offizielle Abitur-Tabellen NRW Heft 4734/2 (1-15 Notenpunkte nach APO-GOSt)
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
      LK: {
        boys: { 1: 3.47, 2: 3.47, 3: 3.47, 4: 3.66, 5: 3.85, 6: 4.04, 7: 4.21, 8: 4.38, 9: 4.54, 10: 4.70, 11: 4.86, 12: 5.02, 13: 5.17, 14: 5.32, 15: 5.44 },
        girls: { 1: 2.81, 2: 2.81, 3: 2.81, 4: 2.94, 5: 3.07, 6: 3.20, 7: 3.32, 8: 3.44, 9: 3.56, 10: 3.68, 11: 3.80, 12: 3.92, 13: 4.03, 14: 4.14, 15: 4.25 }
      },
      GK: {
        boys: { 1: 3.47, 2: 3.47, 3: 3.47, 4: 3.47, 5: 3.66, 6: 3.85, 7: 4.04, 8: 4.21, 9: 4.38, 10: 4.54, 11: 4.70, 12: 4.86, 13: 5.02, 14: 5.17, 15: 5.32 },
        girls: { 1: 2.81, 2: 2.81, 3: 2.81, 4: 2.81, 5: 2.94, 6: 3.07, 7: 3.20, 8: 3.32, 9: 3.44, 10: 3.56, 11: 3.68, 12: 3.80, 13: 3.92, 14: 4.03, 15: 4.14 }
      }
    },
    "Q1": {
      age: 17,
      LK: {
        boys: { 1: 3.47, 2: 3.47, 3: 3.66, 4: 3.85, 5: 4.04, 6: 4.21, 7: 4.38, 8: 4.54, 9: 4.70, 10: 4.86, 11: 5.02, 12: 5.17, 13: 5.32, 14: 5.44, 15: 5.58 },
        girls: { 1: 2.81, 2: 2.81, 3: 2.94, 4: 3.07, 5: 3.20, 6: 3.32, 7: 3.44, 8: 3.56, 9: 3.68, 10: 3.80, 11: 3.92, 12: 4.03, 13: 4.14, 14: 4.25, 15: 4.35 }
      },
      GK: {
        boys: { 1: 3.47, 2: 3.47, 3: 3.47, 4: 3.66, 5: 3.85, 6: 4.04, 7: 4.21, 8: 4.38, 9: 4.54, 10: 4.70, 11: 4.86, 12: 5.02, 13: 5.17, 14: 5.32, 15: 5.44 },
        girls: { 1: 2.81, 2: 2.81, 3: 2.81, 4: 2.94, 5: 3.07, 6: 3.20, 7: 3.32, 8: 3.44, 9: 3.56, 10: 3.68, 11: 3.80, 12: 3.92, 13: 4.03, 14: 4.14, 15: 4.25 }
      }
    },
    "Q2": {
      age: 18,
      LK: {
        boys: { 1: 3.47, 2: 3.66, 3: 3.85, 4: 4.04, 5: 4.21, 6: 4.38, 7: 4.54, 8: 4.70, 9: 4.86, 10: 5.02, 11: 5.17, 12: 5.32, 13: 5.44, 14: 5.58, 15: 5.70 },
        girls: { 1: 2.81, 2: 2.94, 3: 3.07, 4: 3.20, 5: 3.32, 6: 3.44, 7: 3.56, 8: 3.68, 9: 3.80, 10: 3.92, 11: 4.03, 12: 4.14, 13: 4.25, 14: 4.35, 15: 4.45 }
      },
      GK: {
        boys: { 1: 3.47, 2: 3.47, 3: 3.66, 4: 3.85, 5: 4.04, 6: 4.21, 7: 4.38, 8: 4.54, 9: 4.70, 10: 4.86, 11: 5.02, 12: 5.17, 13: 5.32, 14: 5.44, 15: 5.58 },
        girls: { 1: 2.81, 2: 2.81, 3: 2.94, 4: 3.07, 5: 3.20, 6: 3.32, 7: 3.44, 8: 3.56, 9: 3.68, 10: 3.80, 11: 3.92, 12: 4.03, 13: 4.14, 14: 4.25, 15: 4.35 }
      }
    }
  }
};

// Generiere Tabellen-Optionen (ohne Geschlecht)
const generateClassOptions = () => {
  const options = [];

  // Klassen 1-10
  for (let i = 1; i <= 10; i++) {
    options.push({
      value: `K${i}`,
      label: `Klasse ${i} (${officialTables.grades_1_10[i].age} Jahre)`,
      type: 'grades',
      grade: i
    });
  }

  // GOSt
  ['EF', 'Q1', 'Q2'].forEach(stufe => {
    ['GK', 'LK'].forEach(kurs => {
      const age = officialTables.gost[stufe].age;
      options.push({
        value: `${stufe}-${kurs}`,
        label: `${stufe} ${kurs} (${age} Jahre)`,
        type: 'gost',
        grade: stufe,
        kurs
      });
    });
  });

  return options;
};

const classOptions = generateClassOptions();

export default function Page() {
  const [name, setName] = useState("");
  const [selectedClass, setSelectedClass] = useState("EF-GK");
  const [selectedGender, setSelectedGender] = useState("boys");
  const [meter, setMeter] = useState("");
  const [zentimeter, setZentimeter] = useState("");
  const [werte, setWerte] = useState({
    Anlaufgestaltung: "",
    Sprungausführung: "",
    "Reproduzierbarkeit (3x)": "",
    "Genauigkeit zum Absprungpunkt/Zone": ""
  });
  const [liste, setListe] = useState([]);
  const [gewichtung, setGewichtung] = useState({
    qualitativ: 50,
    quantitativ: 50
  });
  const [gewichtungQualitativ, setGewichtungQualitativ] = useState({
    Anlaufgestaltung: 25,
    Sprungausführung: 25,
    "Reproduzierbarkeit (3x)": 25,
    "Genauigkeit zum Absprungpunkt/Zone": 25
  });
  const [showInfo, setShowInfo] = useState(false);
  const [showTabellenInfo, setShowTabellenInfo] = useState(false);
  const [showHauptgewichtungInfo, setShowHauptgewichtungInfo] = useState(false);
  const [tabellenAnhebung, setTabellenAnhebung] = useState(0);
  const [showAnhebungInfo, setShowAnhebungInfo] = useState(false);

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
    const option = classOptions.find(opt => opt.value === selectedClass);
    if (!option) return null;

    if (option.type === 'grades') {
      return officialTables.grades_1_10[option.grade][selectedGender];
    } else {
      return officialTables.gost[option.grade][option.kurs][selectedGender];
    }
  };

  const isGOSt = () => {
    const option = classOptions.find(opt => opt.value === selectedClass);
    return option && option.type === 'gost';
  };

  const berechneNoteAusWeite = (weite) => {
    const tableData = getCurrentTableData();
    if (!tableData) return isGOSt() ? "0" : "6";

    // Für GOSt: 15-Punkte-System (höher = besser)
    if (isGOSt()) {
      // Suche nach höchstem Notenpunkt, der erreicht wird
      let erreichtePunkte = 0;
      for (let np = 15; np >= 1; np--) {
        if (tableData[np] && weite >= tableData[np]) {
          erreichtePunkte = np;
          break;
        }
      }
      // Anhebung in Notenpunkten hinzufügen (maximal 15 Punkte)
      const mitAnhebung = Math.min(15, erreichtePunkte + tabellenAnhebung);
      return mitAnhebung.toString();
    }

    // Für Klassen 1-10: 1-6 Notensystem → Notenpunkte → Anhebung
    let basisNote = 6;
    if (weite >= tableData[1]) basisNote = 1;
    else if (weite >= tableData[2]) basisNote = 2;
    else if (weite >= tableData[3]) basisNote = 3;
    else if (weite >= tableData[4]) basisNote = 4;
    else if (weite >= tableData[5]) basisNote = 5;

    // Konvertiere Note zu Notenpunkten (1=15, 2=12, 3=9, 4=6, 5=3, 6=0)
    const notePunkteMap = { 1: 15, 2: 12, 3: 9, 4: 6, 5: 3, 6: 0 };
    const basisPunkte = notePunkteMap[basisNote];

    // Anhebung in Notenpunkten hinzufügen (maximal 15 Punkte)
    const mitAnhebung = Math.min(15, basisPunkte + tabellenAnhebung);

    // Gib Notenpunkte als String zurück (nicht die Anzeige-Note)
    return mitAnhebung.toString();
  };

  const noteZuPunkten = (note, isQualitative = false) => {
    const np = parseInt(note);
    if (isNaN(np)) return 0;

    // Qualitative 4-Stufen-Bewertung zu 15-Punkte-Skala
    if (isQualitative) {
      const qualitativeMap = {
        1: 15,  // Sehr gut (Maximum)
        2: 10,  // Gut
        3: 5,   // Mit Fehlern
        4: 1    // Falsch
      };
      return qualitativeMap[np] || 0;
    }

    // Quantitative Bewertung: Für GOSt (0-15) direkt verwenden, für Klassen (1-6) konvertieren
    if (np >= 0 && np <= 15) {
      return np;  // GOSt Notenpunkte direkt
    }

    // Fallback für Klassen-Noten (1-6) zu Punkten
    const klassenMap = { 1: 15, 2: 12, 3: 9, 4: 6, 5: 3, 6: 0 };
    return klassenMap[np] || 0;
  };

  const punkteZuNote = (punkte) => {
    // Konvertiere zurück zu Notensystem
    if (punkte >= 15) return '1+';
    if (punkte >= 14) return '1';
    if (punkte >= 13) return '1-';
    if (punkte >= 12) return '2+';
    if (punkte >= 11) return '2';
    if (punkte >= 10) return '2-';
    if (punkte >= 9) return '3+';
    if (punkte >= 8) return '3';
    if (punkte >= 7) return '3-';
    if (punkte >= 6) return '4+';
    if (punkte >= 5) return '4';
    if (punkte >= 4) return '4-';
    if (punkte >= 3) return '5+';
    if (punkte >= 2) return '5';
    if (punkte >= 1) return '5-';
    return '6';
  };

  const rechne = (d, weiteInMetern) => {
    // Qualitative Bewertung (4-Stufen-System)
    let qualitativSum = 0;
    let qualitativNote = "-";

    if (gewichtung.qualitativ > 0) {
      const qualitativeNoten = kriterien.map(k => noteZuPunkten(d[k], true));
      const qualitativeGewichte = kriterien.map(k => gewichtungQualitativ[k]);
      qualitativSum = qualitativeNoten.reduce((sum, note, idx) =>
        sum + (note * qualitativeGewichte[idx]), 0) / 100;
      qualitativNote = punkteZuNote(qualitativSum);
    }

    // Quantitative Bewertung (Weite) - offizielle Tabellen
    let quantitativSum = 0;
    let quantitativNote = "-";

    if (gewichtung.quantitativ > 0) {
      const weitePunkte = berechneNoteAusWeite(weiteInMetern); // Gibt Notenpunkte zurück (0-15)
      quantitativSum = parseInt(weitePunkte);
      // Konvertiere Notenpunkte zu Anzeige-Note (mit Plus/Minus)
      quantitativNote = isGOSt() ? weitePunkte : punkteZuNote(quantitativSum);
    }

    // Gesamtbewertung
    const gesamt = (qualitativSum * gewichtung.qualitativ + quantitativSum * gewichtung.quantitativ) / 100;
    const endnote = punkteZuNote(gesamt);

    return {
      qualitativNote: qualitativNote,
      quantitativNote: quantitativNote,
      gesamt: gesamt.toFixed(2),
      note: endnote,
      weite: weiteInMetern.toFixed(2)
    };
  };

  const speichern = () => {
    const weiteInMetern = parseFloat(meter || 0) + parseFloat(zentimeter || 0) / 100;
    const res = rechne(werte, weiteInMetern);
    const classOption = classOptions.find(opt => opt.value === selectedClass);
    const genderLabel = selectedGender === 'boys' ? 'Jungen' : 'Mädchen';
    const tableLabel = classOption ? `${classOption.label} - ${genderLabel}` : `${selectedClass} - ${genderLabel}`;
    const isGOStEntry = isGOSt();
    setListe([...liste, {
      name,
      tabelle: tableLabel,
      isGOSt: isGOStEntry,
      gewichtung: { ...gewichtung },
      gewichtungQualitativ: { ...gewichtungQualitativ },
      ...werte,
      ...res
    }]);
    setName("");
    setMeter("");
    setZentimeter("");
    setWerte({
      Anlaufgestaltung: "",
      Sprungausführung: "",
      "Reproduzierbarkeit (3x)": "",
      "Genauigkeit zum Absprungpunkt/Zone": ""
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

    if (isGOSt()) {
      // Für GOSt: Zeige ausgewählte Notenpunkte (15, 12, 9, 6, 3, 1)
      return {
        boundaries: [
          { label: '15', value: tableData[15] },
          { label: '12', value: tableData[12] },
          { label: '9', value: tableData[9] },
          { label: '6', value: tableData[6] },
          { label: '3', value: tableData[3] },
          { label: '1', value: tableData[1] }
        ],
        isGOSt: true
      };
    } else {
      // Für Klassen 1-10: Zeige Noten 1-5
      return {
        boundaries: [
          { label: '1', value: tableData[1] },
          { label: '2', value: tableData[2] },
          { label: '3', value: tableData[3] },
          { label: '4', value: tableData[4] },
          { label: '5', value: tableData[5] }
        ],
        isGOSt: false
      };
    }
  };

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6 animate-slideIn">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <Image src="/Sprungapp_logo.jpg" alt="Sprungapp Logo" width={140} height={140} className="relative rounded-full shadow-2xl" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold gradient-text leading-tight">
            Web-App Bewertung Weitsprung
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Qualitative und quantitative Bewertung im Weitsprung
          </p>
          <p className="text-sm text-gray-500">
            Offizielle NRW-Tabellen • Klassen 1-10 (1-5 Noten) & GOSt (15-Punkte-System nach Heft 4734/2)
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
            <button
              onClick={() => setShowHauptgewichtungInfo(true)}
              className="ml-auto text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-full"
              title="Hilfe zur Hauptgewichtung"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
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
                "Reproduzierbarkeit (3x)": 25,
                "Genauigkeit zum Absprungpunkt/Zone": 25
              })}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-all duration-200"
            >
              🔄 Zurücksetzen (25% je)
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
                  Klassenstufe / Kurs
                </label>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="input-modern p-3 w-full text-lg shadow-sm cursor-pointer hover:border-cyan-400 bg-white"
                >
                  <optgroup label="Klasse 1-4 (Grundschule)">
                    {classOptions.filter(opt => ['K1', 'K2', 'K3', 'K4'].some(k => opt.value.startsWith(k))).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Klasse 5-10 (Sekundarstufe I)">
                    {classOptions.filter(opt => ['K5', 'K6', 'K7', 'K8', 'K9', 'K10'].some(k => opt.value.startsWith(k))).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="GOSt: EF (Einführungsphase)">
                    {classOptions.filter(opt => opt.value.startsWith('EF')).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="GOSt: Q1 (Qualifikationsphase 1)">
                    {classOptions.filter(opt => opt.value.startsWith('Q1')).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="GOSt: Q2 (Qualifikationsphase 2)">
                    {classOptions.filter(opt => opt.value.startsWith('Q2')).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Geschlechtsauswahl */}
            <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl p-4 border-2 border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Geschlecht
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="gender"
                    value="boys"
                    checked={selectedGender === 'boys'}
                    onChange={e => setSelectedGender(e.target.value)}
                    className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-3 text-lg font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    👦 Jungen
                  </span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="gender"
                    value="girls"
                    checked={selectedGender === 'girls'}
                    onChange={e => setSelectedGender(e.target.value)}
                    className="w-5 h-5 text-pink-600 focus:ring-2 focus:ring-pink-500 cursor-pointer"
                  />
                  <span className="ml-3 text-lg font-medium text-gray-700 group-hover:text-pink-600 transition-colors">
                    👧 Mädchen
                  </span>
                </label>
              </div>
            </div>

            {/* Tabellen-Anhebung */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  ⚙️ Tabellen-Anpassung (Optional)
                </label>
                <button
                  onClick={() => setShowAnhebungInfo(true)}
                  className="text-orange-600 hover:text-orange-800 transition-colors p-1 hover:bg-orange-100 rounded-full"
                  title="Hilfe zur Tabellen-Anpassung"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              <select
                value={tabellenAnhebung}
                onChange={e => setTabellenAnhebung(parseInt(e.target.value))}
                className="input-modern p-3 w-full text-base shadow-sm cursor-pointer hover:border-orange-400 bg-white"
              >
                <option value={0}>Standard (keine Anpassung)</option>
                <option value={1}>+1 Notenpunkt (leichte Anhebung)</option>
                <option value={2}>+2 Notenpunkte (mittlere Anhebung)</option>
                <option value={3}>+3 Notenpunkte (starke Anhebung)</option>
              </select>
              {tabellenAnhebung > 0 && (
                <div className="mt-2 text-xs text-orange-700 bg-orange-100 p-2 rounded">
                  ⚠️ Anpassung aktiv: Alle Noten werden um {tabellenAnhebung} {tabellenAnhebung === 1 ? 'Notenpunkt' : 'Notenpunkte'} angehoben
                </div>
              )}
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
                    → {isGOSt() ? 'Notenpunkte:' : 'Note:'} <span className="text-blue-600 text-lg">{berechneNoteAusWeite(parseFloat(meter || 0) + parseFloat(zentimeter || 0) / 100)}{isGOSt() ? ' NP' : ''}</span>
                  </p>
                  {getCurrentTableSummary() && (
                    <div className="text-xs text-gray-500 mt-2">
                      {isGOSt() ? 'Notenpunkt-Grenzen' : 'Notengrenzen'}: {getCurrentTableSummary().boundaries.map(b => `${b.label}${isGOSt() ? 'NP' : ''}=${b.value}m`).join(' | ')}
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
                      <option value="1">1 - Sehr gut (Maximum)</option>
                      <option value="2">2 - Gut</option>
                      <option value="3">3 - Mit Fehlern</option>
                      <option value="4">4 - Falsch</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={speichern}
                disabled={(() => {
                  if (!name) return true;
                  const hasQualitativeData = !Object.values(werte).some(v => !v);
                  const hasQuantitativeData = meter && meter !== "";
                  const needsQualitative = gewichtung.qualitativ > 0;
                  const needsQuantitative = gewichtung.quantitativ > 0;

                  // Wenn beide Gewichtungen > 0, dann beide Datentypen erforderlich
                  if (needsQualitative && needsQuantitative) {
                    return !hasQualitativeData || !hasQuantitativeData;
                  }
                  // Wenn nur qualitativ > 0, nur qualitative Daten erforderlich
                  if (needsQualitative && !needsQuantitative) {
                    return !hasQualitativeData;
                  }
                  // Wenn nur quantitativ > 0, nur quantitative Daten erforderlich
                  if (!needsQualitative && needsQuantitative) {
                    return !hasQuantitativeData;
                  }
                  // Wenn beide 0 (sollte nicht vorkommen), keine Daten erforderlich
                  return false;
                })()}
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
                        <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                          <div className="flex flex-col items-center gap-1">
                            <span>Qualitativ</span>
                            <span className="text-xs normal-case">(Note)</span>
                          </div>
                        </th>
                        <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                          <div className="flex flex-col items-center gap-1">
                            <span>Quantitativ</span>
                            <span className="text-xs normal-case">(Weite)</span>
                          </div>
                        </th>
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
                              {a.quantitativNote}{a.isGOSt ? ' NP' : ''}
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

              {/* Tabellen anzeigen */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-gray-800 mb-3">GOSt: 15-Punkte-System (NRW Heft 4734/2)</h4>
                  <p className="text-sm text-gray-600 mb-3">Für EF, Q1 und Q2 wird das offizielle 15-Notenpunkte-System verwendet.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <p className="font-semibold mb-2">Q2 LK - Jungen (Abitur)</p>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr><th className="p-2">NP</th><th className="p-2">Weite</th></tr>
                        </thead>
                        <tbody>
                          {[15, 12, 9, 6, 3, 1].map(np => (
                            <tr key={np} className="border-t">
                              <td className="p-2 text-center font-bold">{np}</td>
                              <td className="p-2 text-center">{officialTables.gost.Q2.LK.boys[np]} m</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="border rounded-lg p-4 bg-pink-50">
                      <p className="font-semibold mb-2">Q2 LK - Mädchen (Abitur)</p>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr><th className="p-2">NP</th><th className="p-2">Weite</th></tr>
                        </thead>
                        <tbody>
                          {[15, 12, 9, 6, 3, 1].map(np => (
                            <tr key={np} className="border-t">
                              <td className="p-2 text-center font-bold">{np}</td>
                              <td className="p-2 text-center">{officialTables.gost.Q2.LK.girls[np]} m</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Hinweis: GK ist jeweils 1 Notenpunkt leichter als LK. EF/Q1 sind jeweils 1 Notenpunkt leichter als die Folgestufe.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-gray-800 mb-3">Klassen 1-10: 1-5 Notensystem</h4>
                  <p className="text-sm text-gray-600 mb-3">Für Klassen 1-10 wird das klassische 1-5 Notensystem verwendet.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <p className="font-semibold mb-2">Klasse 10 - Jungen</p>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr><th className="p-2">Note</th><th className="p-2">Weite</th></tr>
                        </thead>
                        <tbody>
                          {[1,2,3,4,5].map(note => (
                            <tr key={note} className="border-t">
                              <td className="p-2 text-center font-bold">{note}</td>
                              <td className="p-2 text-center">{officialTables.grades_1_10["10"].boys[note]} m</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="font-semibold mb-2">Klasse 10 - Mädchen</p>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr><th className="p-2">Note</th><th className="p-2">Weite</th></tr>
                        </thead>
                        <tbody>
                          {[1,2,3,4,5].map(note => (
                            <tr key={note} className="border-t">
                              <td className="p-2 text-center font-bold">{note}</td>
                              <td className="p-2 text-center">{officialTables.grades_1_10["10"].girls[note]} m</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

      {/* Hauptgewichtung Info Modal */}
      {showHauptgewichtungInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowHauptgewichtungInfo(false)}>
          <div className="bg-white rounded-2xl card-shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-3xl">⚖️</span>
                  Hauptgewichtung verstehen
                </h3>
                <button
                  onClick={() => setShowHauptgewichtungInfo(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">🎯 Was ist die Hauptgewichtung?</h4>
                <p className="text-gray-600 leading-relaxed">
                  Die Hauptgewichtung bestimmt, wie stark die <strong>Technik</strong> (qualitative Kriterien)
                  im Vergleich zur <strong>Weite</strong> (quantitative Messung) in die Gesamtnote einfließt.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">🎨 Qualitativ (Technik) - {gewichtung.qualitativ}%</h4>
                <p className="text-gray-600 leading-relaxed mb-2">
                  Bewertet die technische Ausführung des Weitsprungs in vier Teilbereichen:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                  <li><strong>Anlaufgestaltung:</strong> Rhythmus, Geschwindigkeitsaufbau, Anlaufgenauigkeit</li>
                  <li><strong>Sprungausführung:</strong> Absprungtechnik, Flugphase, Landung</li>
                  <li><strong>Reproduzierbarkeit (3x):</strong> Konstanz über drei Versuche</li>
                  <li><strong>Genauigkeit zum Absprungpunkt/Zone:</strong> Präzision beim Absprung</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">📏 Quantitativ (Weite) - {gewichtung.quantitativ}%</h4>
                <p className="text-gray-600 leading-relaxed">
                  Bewertet die gemessene Sprungweite anhand offizieller NRW-Tabellen.
                  Die Tabellen sind alters- und geschlechtsspezifisch und berücksichtigen
                  für die GOSt auch die Unterscheidung zwischen Grund- und Leistungskurs.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">⚙️ Wie stelle ich die Gewichtung ein?</h4>
                <p className="text-gray-600 leading-relaxed mb-2">
                  Verwenden Sie die beiden Schieberegler, um die Gewichtung anzupassen:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                  <li><strong>Mehr Technik:</strong> Schieben Sie den linken Regler nach rechts (z.B. 70% qualitativ, 30% quantitativ)</li>
                  <li><strong>Mehr Weite:</strong> Schieben Sie den rechten Regler nach rechts (z.B. 30% qualitativ, 70% quantitativ)</li>
                  <li><strong>Ausgewogen:</strong> Standard ist 50/50 - beide Aspekte gleich wichtig</li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tipp:</strong> Die Gewichtung können Sie für jeden Schüler individuell anpassen.
                  Bei Anfängern empfiehlt sich oft eine höhere Technik-Gewichtung (z.B. 70/30),
                  bei fortgeschrittenen Schülern eine ausgewogenere Verteilung (50/50).
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowHauptgewichtungInfo(false)}
                  className="w-full btn-gradient text-white font-semibold px-6 py-3 rounded-xl"
                >
                  Verstanden
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anhebung Info Modal */}
      {showAnhebungInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowAnhebungInfo(false)}>
          <div className="bg-white rounded-2xl card-shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 via-yellow-600 to-amber-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-3xl">⚙️</span>
                  Tabellen-Anpassung verstehen
                </h3>
                <button
                  onClick={() => setShowAnhebungInfo(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <p className="text-sm text-orange-900 font-medium">
                  Diese Funktion ermöglicht es Ihnen, die Bewertungstabellen um 1, 2 oder 3 Notenpunkte anzuheben,
                  um besonderen Bedingungen Ihrer Lerngruppe gerecht zu werden.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Was bedeutet die Anhebung?
                </h4>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Eine Anhebung verbessert die Bewertung aller Schüler*innen um 1, 2 oder 3 Notenpunkte:
                </p>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="font-semibold text-gray-800 mb-2">Für Klassen 1-10:</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm ml-2">
                      <li><strong>+1 Notenpunkt:</strong> Note 3 (9 NP) → Note 2- (10 NP)</li>
                      <li><strong>+2 Notenpunkte:</strong> Note 3 (9 NP) → Note 2 (11 NP)</li>
                      <li><strong>+3 Notenpunkte:</strong> Note 3 (9 NP) → Note 2+ (12 NP)</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <p className="font-semibold text-gray-800 mb-2">Für GOSt (15-Punkte-System):</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm ml-2">
                      <li><strong>+1 Notenpunkt:</strong> 10 NP → 11 NP</li>
                      <li><strong>+2 Notenpunkte:</strong> 10 NP → 12 NP</li>
                      <li><strong>+3 Notenpunkte:</strong> 10 NP → 13 NP</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  Wichtige Hinweise zur Verwendung
                </h4>
                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Fachkonferenz einbeziehen:</strong> Es wird dringend empfohlen, eine Tabellen-Anpassung
                      nur in Absprache mit der Fachkonferenz Sport vorzunehmen. Dies gewährleistet eine einheitliche
                      Handhabung und Transparenz im gesamten Fachbereich.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Jahrgangsstufenweite Entscheidung:</strong> Wenn eine Anpassung vorgenommen wird,
                      sollte diese für die gesamte Jahrgangsstufe gelten. Nur so ist die Vergleichbarkeit der
                      Anforderungen und Leistungsbewertung zwischen verschiedenen Klassen gewährleistet.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">🎓</span>
                  Wann kann eine Anpassung sinnvoll sein?
                </h4>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Aus pädagogischer Sicht kann eine Tabellen-Anpassung unter folgenden Umständen erwogen werden:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                  <li><strong>Unzureichende Vorbereitung:</strong> Wenn die Vorbereitungsbedingungen nicht adäquat waren
                  (z.B. Hallensperrung, Wetterbedingungen, fehlende Unterrichtsstunden)</li>
                  <li><strong>Standortfaktoren:</strong> Besondere räumliche oder materielle Gegebenheiten der Schule,
                  die die Trainingsmöglichkeiten einschränken</li>
                  <li><strong>Leistungsstand der Lerngruppe:</strong> Wenn der allgemeine Leistungsstand der Schüler*innen
                  deutlich unter dem Erwartungswert liegt</li>
                  <li><strong>Soziale Faktoren:</strong> Besondere sozioökonomische oder gesundheitliche Rahmenbedingungen
                  der Lerngruppe</li>
                  <li><strong>Inklusive Lerngruppen:</strong> Anpassung bei heterogenen Gruppen mit besonderen Förderbedarfen</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  Professionelle Eigenverantwortung
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  Als Lehrkraft haben Sie die professionelle Kompetenz und Eigenverantwortung, solche Anpassungen
                  im Rahmen Ihrer pädagogischen Freiheit vorzunehmen. Die Entscheidung sollte jedoch stets
                  pädagogisch begründbar und im Sinne einer fairen, transparenten Leistungsbewertung sein.
                </p>
              </div>

              <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded">
                <h4 className="font-bold text-gray-800 mb-2">📋 Zur Erinnerung:</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Die hinterlegten Tabellen basieren auf offiziellen NRW-Standards und wissenschaftlich fundierten
                  Leistungserwartungen. Sie bilden <strong>ohne Anpassung</strong> ab, was im Land Nordrhein-Westfalen
                  regulär als Weitsprung-Leistung für die entsprechende Notenstufe oder Punktzahl erwartet wird.
                  Eine Anpassung sollte daher nur nach sorgfältiger Abwägung erfolgen.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 p-4 rounded">
                <h4 className="font-bold text-green-800 mb-2">💡 Empfehlung für die Praxis:</h4>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  <strong>Dokumentation:</strong> Halten Sie die Gründe für eine Tabellen-Anpassung schriftlich fest
                  und informieren Sie die Schüler*innen transparent über die angewendeten Bewertungsmaßstäbe.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>Transparenz:</strong> Kommunizieren Sie die Anpassung offen gegenüber Schüler*innen, Eltern
                  und Kolleg*innen, um Nachvollziehbarkeit und Akzeptanz zu gewährleisten.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAnhebungInfo(false)}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all duration-200"
                >
                  Verstanden
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
                <p className="text-gray-600 leading-relaxed mb-2">
                  Die quantitative Bewertung nutzt offizielle Weitsprung-Tabellen aus NRW:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li><strong>Klassen 1-10:</strong> 1-5 Notensystem (RNG Wangen, Reismann-Gymnasium, DSA)</li>
                  <li><strong>GOSt (EF/Q1/Q2):</strong> 15-Notenpunkte-System nach NRW Heft 4734/2 (Abitur-Tabellen), getrennt nach GK und LK</li>
                </ul>
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
