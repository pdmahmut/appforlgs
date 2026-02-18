const { prisma } = require("../lib/prisma");

function pick(obj, keys, fallback = null) {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return fallback;
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function round2(value) {
  return Number(value.toFixed(2));
}

function asDateOnly(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function getDelegate(candidates) {
  for (const key of candidates) {
    if (prisma[key] && typeof prisma[key].findMany === "function") return prisma[key];
  }
  throw new Error(`Prisma delegate not found. Tried: ${candidates.join(", ")}`);
}

function normalizeExam(raw) {
  return {
    id: String(pick(raw, ["id"])),
    name: pick(raw, ["name", "examName", "exam_name"], "Sinav"),
    date: pick(raw, ["date", "examDate", "exam_date", "createdAt", "created_at"]),
    isCommonExam: Boolean(pick(raw, ["isCommonExam", "is_common_exam"], false)),
  };
}

function normalizeResult(raw) {
  return {
    id: String(pick(raw, ["id"])),
    studentId: String(pick(raw, ["studentId", "student_id"])),
    examId: String(pick(raw, ["examId", "exam_id"])),
    turkceNet: toNumber(pick(raw, ["turkceNet", "turkce_net"])),
    matematikNet: toNumber(pick(raw, ["matematikNet", "matematik_net"])),
    fenNet: toNumber(pick(raw, ["fenNet", "fen_net"])),
    sosyalNet: toNumber(pick(raw, ["sosyalNet", "sosyal_net"])),
    toplamNet: toNumber(pick(raw, ["toplamNet", "toplam_net"])),
  };
}

function averageResults(results, field) {
  if (!results.length) return 0;
  const total = results.reduce((sum, item) => sum + toNumber(item[field]), 0);
  return round2(total / results.length);
}

function buildRiskDistribution(results) {
  const distribution = {
    "0-20": 0,
    "20-40": 0,
    "40-60": 0,
    "60+": 0,
  };

  for (const result of results) {
    const net = toNumber(result.toplamNet);
    if (net < 20) distribution["0-20"] += 1;
    else if (net < 40) distribution["20-40"] += 1;
    else if (net < 60) distribution["40-60"] += 1;
    else distribution["60+"] += 1;
  }

  return distribution;
}

function emptyPayload() {
  return {
    okulGenelOrtalamaNet: 0,
    sonDenemeOrtalamaNet: 0,
    netTrend: [],
    sonDenemeBransOrtalamalari: {
      turkceNet: 0,
      matematikNet: 0,
      fenNet: 0,
      sosyalNet: 0,
      toplamNet: 0,
    },
    sonDenemeKatilimOrani: {
      katilanOgrenciSayisi: 0,
      toplamOgrenciSayisi: 0,
      oran: 0,
    },
    riskDagilimi: {
      "0-20": 0,
      "20-40": 0,
      "40-60": 0,
      "60+": 0,
    },
  };
}

async function getSchoolAnalytics() {
  const studentDelegate = getDelegate(["student", "students"]);
  const examDelegate = getDelegate(["exam", "exams"]);
  const resultDelegate = getDelegate(["examResult", "examResults", "exam_result", "exam_results"]);

  const [studentsRaw, examsRaw, resultsRaw] = await Promise.all([
    studentDelegate.findMany(),
    examDelegate.findMany(),
    resultDelegate.findMany(),
  ]);

  const exams = examsRaw.map(normalizeExam).filter((item) => item.isCommonExam);
  if (!exams.length) return emptyPayload();

  exams.sort((a, b) => new Date(a.date) - new Date(b.date));
  const examIds = new Set(exams.map((item) => item.id));

  const results = resultsRaw.map(normalizeResult).filter((item) => examIds.has(item.examId));
  const resultsByExam = new Map();

  for (const exam of exams) {
    resultsByExam.set(exam.id, []);
  }

  for (const result of results) {
    if (resultsByExam.has(result.examId)) {
      resultsByExam.get(result.examId).push(result);
    }
  }

  const netTrend = exams.map((exam) => {
    const examResults = resultsByExam.get(exam.id) || [];
    return {
      examId: exam.id,
      examName: exam.name,
      date: asDateOnly(exam.date),
      averageNet: averageResults(examResults, "toplamNet"),
      katilanOgrenciSayisi: examResults.length,
    };
  });

  const allCommonResults = Array.from(resultsByExam.values()).flat();
  const sonDeneme = exams[exams.length - 1];
  const sonDenemeSonuclari = resultsByExam.get(sonDeneme.id) || [];

  const toplamOgrenciSayisi = studentsRaw.length;
  const katilanOgrenciSayisi = sonDenemeSonuclari.length;
  const katilimOrani = toplamOgrenciSayisi
    ? round2((katilanOgrenciSayisi / toplamOgrenciSayisi) * 100)
    : 0;

  return {
    okulGenelOrtalamaNet: averageResults(allCommonResults, "toplamNet"),
    sonDenemeOrtalamaNet: averageResults(sonDenemeSonuclari, "toplamNet"),
    netTrend,
    sonDenemeBransOrtalamalari: {
      turkceNet: averageResults(sonDenemeSonuclari, "turkceNet"),
      matematikNet: averageResults(sonDenemeSonuclari, "matematikNet"),
      fenNet: averageResults(sonDenemeSonuclari, "fenNet"),
      sosyalNet: averageResults(sonDenemeSonuclari, "sosyalNet"),
      toplamNet: averageResults(sonDenemeSonuclari, "toplamNet"),
    },
    sonDenemeKatilimOrani: {
      katilanOgrenciSayisi,
      toplamOgrenciSayisi,
      oran: katilimOrani,
    },
    riskDagilimi: buildRiskDistribution(sonDenemeSonuclari),
  };
}

module.exports = {
  getSchoolAnalytics,
};

