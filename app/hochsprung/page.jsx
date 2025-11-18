"use client";
import { useState } from "react";
import { saveAs } from "file-saver";
import Image from "next/image";
import Link from "next/link";

// Kriterien für Hochsprung
const kriterien = ["Anlauf", "Absprung", "Flugphase", "Landung"];
const kriterienKurz = ["Anlauf", "Absprung", "Flugphase", "Landung"];

// Offizielle NRW-Hochsprung-Tabellen - Korrigierte Version V3
// Quelle: Master-Bewertungstabelle Sport NRW (Final V3)
// Klassen 1-10: note_1 bis note_5 (Schulnoten-System)
// GOSt: Notenpunkte 15 bis 1 (Abitur-System mit Offset-Regel)
const officialTables = {
  "grades_1_10": {
    "1": { age: 6, boys: { 1: 0.90, 2: 0.80, 3: 0.70, 4: 0.60, 5: 0.50 }, girls: { 1: 0.85, 2: 0.75, 3: 0.65, 4: 0.55, 5: 0.45 } },
    "2": { age: 7, boys: { 1: 0.95, 2: 0.85, 3: 0.75, 4: 0.65, 5: 0.55 }, girls: { 1: 0.90, 2: 0.80, 3: 0.70, 4: 0.60, 5: 0.50 } },
    "3": { age: 8, boys: { 1: 1.00, 2: 0.90, 3: 0.80, 4: 0.70, 5: 0.60 }, girls: { 1: 0.95, 2: 0.85, 3: 0.75, 4: 0.65, 5: 0.55 } },
    "4": { age: 9, boys: { 1: 1.05, 2: 0.95, 3: 0.85, 4: 0.75, 5: 0.65 }, girls: { 1: 1.00, 2: 0.90, 3: 0.80, 4: 0.70, 5: 0.60 } },
    "5": { age: 10, boys: { 1: 1.15, 2: 1.05, 3: 0.95, 4: 0.85, 5: 0.75 }, girls: { 1: 1.10, 2: 1.00, 3: 0.90, 4: 0.80, 5: 0.70 } },
    "6": { age: 11, boys: { 1: 1.25, 2: 1.15, 3: 1.00, 4: 0.90, 5: 0.80 }, girls: { 1: 1.15, 2: 1.05, 3: 0.95, 4: 0.85, 5: 0.75 } },
    "7": { age: 12, boys: { 1: 1.35, 2: 1.20, 3: 1.10, 4: 0.95, 5: 0.85 }, girls: { 1: 1.22, 2: 1.12, 3: 1.00, 4: 0.90, 5: 0.80 } },
    "8": { age: 13, boys: { 1: 1.42, 2: 1.27, 3: 1.15, 4: 1.00, 5: 0.90 }, girls: { 1: 1.30, 2: 1.18, 3: 1.05, 4: 0.95, 5: 0.85 } },
    "9": { age: 14, boys: { 1: 1.46, 2: 1.31, 3: 1.18, 4: 1.05, 5: 0.95 }, girls: { 1: 1.35, 2: 1.22, 3: 1.10, 4: 1.00, 5: 0.90 } },
    "10": { age: 15, boys: { 1: 1.51, 2: 1.35, 3: 1.20, 4: 1.10, 5: 1.00 }, girls: { 1: 1.38, 2: 1.26, 3: 1.12, 4: 1.02, 5: 0.92 } }
  },
  "gost": {
    "EF": {
      age: 16,
      LK: {
        boys: { 15: 1.60, 14: 1.58, 13: 1.55, 12: 1.52, 11: 1.49, 10: 1.46, 9: 1.43, 8: 1.39, 7: 1.35, 6: 1.31, 5: 1.26, 4: 1.21, 3: 1.16, 2: 1.12, 1: 1.08 },
        girls: { 15: 1.36, 14: 1.34, 13: 1.32, 12: 1.30, 11: 1.28, 10: 1.26, 9: 1.24, 8: 1.21, 7: 1.18, 6: 1.15, 5: 1.11, 4: 1.07, 3: 1.03, 2: 0.99, 1: 0.95 }
      },
      GK: {
        boys: { 15: 1.58, 14: 1.55, 13: 1.52, 12: 1.49, 11: 1.46, 10: 1.43, 9: 1.39, 8: 1.35, 7: 1.31, 6: 1.26, 5: 1.21, 4: 1.16, 3: 1.12, 2: 1.08, 1: 1.04 },
        girls: { 15: 1.34, 14: 1.32, 13: 1.30, 12: 1.28, 11: 1.26, 10: 1.24, 9: 1.21, 8: 1.18, 7: 1.15, 6: 1.11, 5: 1.07, 4: 1.03, 3: 0.99, 2: 0.95, 1: 0.90 }
      }
    },
    "Q1": {
      age: 17,
      LK: {
        boys: { 15: 1.62, 14: 1.60, 13: 1.58, 12: 1.55, 11: 1.52, 10: 1.49, 9: 1.46, 8: 1.43, 7: 1.39, 6: 1.35, 5: 1.31, 4: 1.26, 3: 1.21, 2: 1.16, 1: 1.12 },
        girls: { 15: 1.38, 14: 1.36, 13: 1.34, 12: 1.32, 11: 1.30, 10: 1.28, 9: 1.26, 8: 1.24, 7: 1.21, 6: 1.18, 5: 1.15, 4: 1.11, 3: 1.07, 2: 1.03, 1: 0.99 }
      },
      GK: {
        boys: { 15: 1.60, 14: 1.58, 13: 1.55, 12: 1.52, 11: 1.49, 10: 1.46, 9: 1.43, 8: 1.39, 7: 1.35, 6: 1.31, 5: 1.26, 4: 1.21, 3: 1.16, 2: 1.12, 1: 1.08 },
        girls: { 15: 1.36, 14: 1.34, 13: 1.32, 12: 1.30, 11: 1.28, 10: 1.26, 9: 1.24, 8: 1.21, 7: 1.18, 6: 1.15, 5: 1.11, 4: 1.07, 3: 1.03, 2: 0.99, 1: 0.95 }
      }
    },
    "Q2": {
      age: 18,
      LK: {
        boys: { 15: 1.64, 14: 1.62, 13: 1.60, 12: 1.58, 11: 1.55, 10: 1.52, 9: 1.49, 8: 1.46, 7: 1.43, 6: 1.39, 5: 1.35, 4: 1.31, 3: 1.26, 2: 1.21, 1: 1.16 },
        girls: { 15: 1.40, 14: 1.38, 13: 1.36, 12: 1.34, 11: 1.32, 10: 1.30, 9: 1.28, 8: 1.26, 7: 1.24, 6: 1.21, 5: 1.18, 4: 1.15, 3: 1.11, 2: 1.07, 1: 1.03 }
      },
      GK: {
        boys: { 15: 1.62, 14: 1.60, 13: 1.58, 12: 1.55, 11: 1.52, 10: 1.49, 9: 1.46, 8: 1.43, 7: 1.39, 6: 1.35, 5: 1.31, 4: 1.26, 3: 1.21, 2: 1.16, 1: 1.12 },
        girls: { 15: 1.38, 14: 1.36, 13: 1.34, 12: 1.32, 11: 1.30, 10: 1.28, 9: 1.26, 8: 1.24, 7: 1.21, 6: 1.18, 5: 1.15, 4: 1.11, 3: 1.07, 2: 1.03, 1: 0.99 }
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
  const [hoehe, setHoehe] = useState(1.00);
  const [werte, setWerte] = useState({
    Anlauf: "",
    Absprung: "",
    Flugphase: "",
    Landung: ""
  });
  const [liste, setListe] = useState([]);
  const [gewichtung, setGewichtung] = useState({
    qualitativ: 50,
    quantitativ: 50
  });
  const [gewichtungQualitativ, setGewichtungQualitativ] = useState({
    Anlauf: 25,
    Absprung: 25,
    Flugphase: 25,
    Landung: 25
  });
  const [showInfo, setShowInfo] = useState(false);
  const [showTabellenInfo, setShowTabellenInfo] = useState(false);
  const [showHauptgewichtungInfo, setShowHauptgewichtungInfo] = useState(false);
  const [tabellenAnhebung, setTabellenAnhebung] = useState(0);
  const [showAnhebungInfo, setShowAnhebungInfo] = useState(false);
  const [showGrenzwerte, setShowGrenzwerte] = useState(false);

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

  const getGrenzwerteWithAnhebung = () => {
    const boysData = officialTables.grades_1_10[classOptions.find(opt => opt.value === selectedClass)?.grade]?.boys ||
                     officialTables.gost[classOptions.find(opt => opt.value === selectedClass)?.grade]?.[classOptions.find(opt => opt.value === selectedClass)?.kurs]?.boys;
    const girlsData = officialTables.grades_1_10[classOptions.find(opt => opt.value === selectedClass)?.grade]?.girls ||
                      officialTables.gost[classOptions.find(opt => opt.value === selectedClass)?.grade]?.[classOptions.find(opt => opt.value === selectedClass)?.kurs]?.girls;

    if (!boysData || !girlsData) return null;

    // Einfach die originalen Tabellenwerte zurückgeben
    // Die Anhebung wird separat in der Anzeige erklärt
    return { boys: boysData, girls: girlsData };
  };

  const berechneNoteAusHöhe = (weite) => {
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

    // Gib Notenpunkte als String zurück
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

    // Quantitative Bewertung (Höhe) - offizielle Tabellen
    let quantitativSum = 0;
    let quantitativNote = "-";

    if (gewichtung.quantitativ > 0) {
      const weitePunkte = berechneNoteAusHöhe(weiteInMetern); // Gibt Notenpunkte zurück (0-15)
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
    const weiteInMetern = hoehe;
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
    setHoehe(1.00);
    setWerte({
      Anlauf: "",
      Absprung: "",
      Flugphase: "",
      Landung: ""
    });
  };

  const loeschen = (index) => {
    const neu = [...liste];
    neu.splice(index, 1);
    setListe(neu);
  };

  const exportCSV = () => {
    const header = ["Name", "Tabelle", "Höhe (m)", ...kriterienKurz, "Qualitativ", "Quantitativ", "Gesamt", "Endnote"];
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
    saveAs(new Blob([csv], { type: "text/csv" }), "hochsprung_bewertung.csv");
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
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl blur-2xl opacity-30 animate-pulse"></div>
              <Image src="/Sprungapp_logo.jpg" alt="Sprungapp Logo" width={280} height={140} className="relative rounded-xl shadow-2xl" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold gradient-text-orange leading-tight">
            Web-App Bewertung Hochsprung
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Qualitative und quantitative Bewertung im Hochsprung
          </p>
          <p className="text-sm text-gray-500">
            Offizielle NRW-Tabellen • Klassen 1-10 (1-5 Noten) & GOSt (15-Punkte-System nach Heft 4734/2)
          </p>

          {/* Wechsel-Button zu Weitsprung */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-emerald-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
            <Link href="/" className="inline-block relative">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 hover:from-blue-600 hover:via-cyan-600 hover:to-emerald-600 text-white font-bold text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-blue-500/50 hover:scale-110 flex items-center gap-3 mx-auto border-2 border-white/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                <span>Zur Weitsprung-Bewertung</span>
                <span className="text-2xl animate-bounce">➡️</span>
              </button>
            </Link>
          </div>

          <div className="flex justify-center gap-2 text-sm text-gray-500 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm card-shadow">
              🏃 Anlauf
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm card-shadow">
              ⬆️ Absprung
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm card-shadow">
              ✈️ Flugphase
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm card-shadow">
              🛬 Landung
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white card-shadow">
              📏 Höhe
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
                <label className="text-sm font-semibold text-gray-700">📏 Quantitativ (Höhe)</label>
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
                    <span className="text-xl">{['🏃', '⬆️', '✈️', '🛬'][idx]}</span>
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
                Anlauf: 25,
                Absprung: 25,
                Flugphase: 25,
                Landung: 25
              })}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-all duration-200"
            >
              🔄 Zurücksetzen (25% je)
            </button>
          </div>
        </div>

        {/* Konfiguration (wird selten geändert) */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl card-shadow-lg p-6 sm:p-8 space-y-5 animate-slideIn">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">⚙️</span>
            Konfiguration
          </h2>

          <div className="space-y-4">
            {/* Klassenstufe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Klassenstufe / Kurs
              </label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="input-modern p-3 w-full text-lg shadow-sm cursor-pointer hover:border-orange-400 bg-white"
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

            {/* Grenzwerte anzeigen Button */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200">
              <button
                onClick={() => setShowGrenzwerte(true)}
                className="w-full btn-gradient from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl flex items-center justify-center gap-2"
              >
                <span className="text-xl">📊</span>
                Notengrenzwerte anzeigen
                <span className="text-sm font-normal opacity-90">(Mindestleistungen)</span>
              </button>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Zeigt ab welcher Höhe welche Note erreicht wird
              </p>
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
          </div>
        </div>

        {/* Schnelle Dateneingabe */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl card-shadow-lg p-6 sm:p-8 space-y-6 animate-slideIn">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">📝</span>
            Bewertung erfassen
          </h2>

          <div className="space-y-5">
            {/* Name & Geschlecht zusammen */}
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

              {/* Geschlechtsauswahl kompakt */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Geschlecht
                </label>
                <div className="flex gap-3 h-[52px] items-center">
                  <label className="flex-1 flex items-center justify-center cursor-pointer group bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl p-3 border-2 border-blue-200 transition-all">
                    <input
                      type="radio"
                      name="gender"
                      value="boys"
                      checked={selectedGender === 'boys'}
                      onChange={e => setSelectedGender(e.target.value)}
                      className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-2 text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                      👦 Jungen
                    </span>
                  </label>
                  <label className="flex-1 flex items-center justify-center cursor-pointer group bg-gradient-to-r from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 rounded-xl p-3 border-2 border-pink-200 transition-all">
                    <input
                      type="radio"
                      name="gender"
                      value="girls"
                      checked={selectedGender === 'girls'}
                      onChange={e => setSelectedGender(e.target.value)}
                      className="w-5 h-5 text-pink-600 focus:ring-2 focus:ring-pink-500 cursor-pointer"
                    />
                    <span className="ml-2 text-base font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">
                      👧 Mädchen
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-xl p-5 border-2 border-orange-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">📏</span>
                Hochsprung-Höhe
              </h3>

              {/* Großer Höhen-Display */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-xl">
                  <span className="text-4xl font-bold tabular-nums">{hoehe.toFixed(2)}</span>
                  <span className="text-2xl ml-2 font-semibold">m</span>
                </div>
                <div className="mt-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {isGOSt() ? 'Notenpunkte:' : 'Note:'}
                  </span>
                  <span className="text-2xl font-bold ml-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {berechneNoteAusHöhe(hoehe)}{isGOSt() ? ' NP' : ''}
                  </span>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-gray-600 font-semibold px-1">
                  <span>0.10 m</span>
                  <span>2.30 m</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="2.30"
                  step="0.01"
                  value={hoehe}
                  onChange={(e) => setHoehe(parseFloat(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-custom"
                  style={{
                    background: `linear-gradient(to right,
                      #f97316 0%,
                      #ef4444 ${((hoehe - 0.10) / (2.30 - 0.10)) * 100}%,
                      #e5e7eb ${((hoehe - 0.10) / (2.30 - 0.10)) * 100}%,
                      #e5e7eb 100%)`
                  }}
                />

                {/* Schnellauswahl Buttons */}
                <div className="flex flex-wrap gap-2 justify-center mt-3">
                  {[0.80, 1.00, 1.20, 1.40, 1.60, 1.80, 2.00].map(h => (
                    <button
                      key={h}
                      onClick={() => setHoehe(h)}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                        hoehe === h
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md scale-105'
                          : 'bg-white text-gray-700 hover:bg-orange-100 border border-gray-300'
                      }`}
                    >
                      {h.toFixed(2)}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Grenzwerte Info */}
              {getCurrentTableSummary() && (
                <div className="mt-4 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-orange-200">
                  <div className="text-xs text-gray-600 font-semibold">
                    {isGOSt() ? 'Notenpunkt-Grenzen' : 'Notengrenzen'}: {getCurrentTableSummary().boundaries.map(b => `${b.label}${isGOSt() ? 'NP' : ''}=${b.value}m`).join(' | ')}
                  </div>
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
                      <span>{['🏃', '⬆️', '✈️', '🛬'][idx]}</span>
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
                  const hasQuantitativeData = hoehe >= 0.10;
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
                        <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Höhe</th>
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
                            <span className="text-xs normal-case">(Höhe)</span>
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
                  Offizielle NRW-Hochsprung-Tabellen
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
                          <tr><th className="p-2">NP</th><th className="p-2">Höhe</th></tr>
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
                          <tr><th className="p-2">NP</th><th className="p-2">Höhe</th></tr>
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
                          <tr><th className="p-2">Note</th><th className="p-2">Höhe</th></tr>
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
                          <tr><th className="p-2">Note</th><th className="p-2">Höhe</th></tr>
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
                  im Vergleich zur <strong>Höhe</strong> (quantitative Messung) in die Gesamtnote einfließt.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">🎨 Qualitativ (Technik) - {gewichtung.qualitativ}%</h4>
                <p className="text-gray-600 leading-relaxed mb-2">
                  Bewertet die technische Ausführung des Hochsprungs in vier Teilbereichen:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                  <li><strong>Anlauf:</strong> Rhythmus, Geschwindigkeitsaufbau, Anlaufkurve, Timing</li>
                  <li><strong>Absprung:</strong> Kraftentfaltung, Körperspannung, Absprungwinkel</li>
                  <li><strong>Flugphase:</strong> Körperdrehung, Lattenüberquerung, Technik (Schere/Flop)</li>
                  <li><strong>Landung:</strong> Kontrolle, Sicherheit, Körperhaltung auf der Matte</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">📏 Quantitativ (Höhe) - {gewichtung.quantitativ}%</h4>
                <p className="text-gray-600 leading-relaxed">
                  Bewertet die gemessene Sprunghöhe anhand offizieller NRW-Tabellen.
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
                  <li><strong>Mehr Höhe:</strong> Schieben Sie den rechten Regler nach rechts (z.B. 30% qualitativ, 70% quantitativ)</li>
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

      {/* Grenzwerte Modal */}
      {showGrenzwerte && (() => {
        const grenzwerte = getGrenzwerteWithAnhebung();
        const classOption = classOptions.find(opt => opt.value === selectedClass);
        const classLabel = classOption?.label || selectedClass;
        const isGOStTable = isGOSt();

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowGrenzwerte(false)}>
            <div className="bg-white rounded-2xl card-shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <span className="text-3xl">📊</span>
                    Notengrenzwerte
                  </h3>
                  <button
                    onClick={() => setShowGrenzwerte(false)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center text-2xl"
                  >
                    ×
                  </button>
                </div>
                <p className="text-white/90 text-sm mt-2">
                  {classLabel} • Mindestleistungen für jede Note
                </p>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-900">
                    <strong>Lesehinweis:</strong> Die Tabelle zeigt die originalen Mindestleistungen (in Metern) aus der offiziellen NRW-Tabelle für die jeweilige Note.
                  </p>
                </div>

                {tabellenAnhebung > 0 && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                    <p className="text-sm text-orange-900 font-medium">
                      ⚠️ Achtung: Tabellen-Anpassung aktiv (+{tabellenAnhebung} {tabellenAnhebung === 1 ? 'Notenpunkt' : 'Notenpunkte'})
                      <br />
                      Bei der Bewertung werden auf die erreichten Notenpunkte zusätzlich {tabellenAnhebung} {tabellenAnhebung === 1 ? 'Notenpunkt' : 'Notenpunkte'} addiert.
                      Die unten angezeigten Grenzwerte sind die <strong>ursprünglichen Tabellenwerte ohne Anhebung</strong>.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Jungen */}
                  <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                    <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                      👦 Jungen
                    </h4>
                    <div className="space-y-2">
                      {grenzwerte && Object.keys(grenzwerte.boys).sort((a, b) => {
                        if (isGOStTable) return b - a; // 15 bis 1
                        return a - b; // 1 bis 5
                      }).map(key => (
                        <div key={key} className="flex justify-between items-center bg-white p-3 rounded-lg border border-blue-200">
                          <span className="font-semibold text-gray-800">
                            {isGOStTable ? `${key} NP` : `Note ${key}`}
                          </span>
                          <span className="text-lg font-bold text-blue-700">
                            ≥ {grenzwerte.boys[key]?.toFixed(2)} m
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mädchen */}
                  <div className="bg-pink-50 rounded-xl p-5 border-2 border-pink-200">
                    <h4 className="text-xl font-bold text-pink-900 mb-4 flex items-center gap-2">
                      👧 Mädchen
                    </h4>
                    <div className="space-y-2">
                      {grenzwerte && Object.keys(grenzwerte.girls).sort((a, b) => {
                        if (isGOStTable) return b - a; // 15 bis 1
                        return a - b; // 1 bis 5
                      }).map(key => (
                        <div key={key} className="flex justify-between items-center bg-white p-3 rounded-lg border border-pink-200">
                          <span className="font-semibold text-gray-800">
                            {isGOStTable ? `${key} NP` : `Note ${key}`}
                          </span>
                          <span className="text-lg font-bold text-pink-700">
                            ≥ {grenzwerte.girls[key]?.toFixed(2)} m
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowGrenzwerte(false)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200"
                  >
                    Schließen
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
                  regulär als Hochsprung-Leistung für die entsprechende Notenstufe oder Punktzahl erwartet wird.
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
                  <li><strong>Quantitativ ({gewichtung.quantitativ}%)</strong>: Hochsprung-Höhe basierend auf offiziellen NRW-Tabellen (1-5)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">📊 Offizielle Tabellen</h4>
                <p className="text-gray-600 leading-relaxed mb-2">
                  Die quantitative Bewertung nutzt offizielle Hochsprung-Tabellen aus NRW:
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
