import { addDays, clamp, daysBetween, parseISODate, startOfDay, toISODate } from "./date.js?v=ciclica-one-1";
import { moodLabels, bleedingLabels, skinLabels } from "../data/labels.js?v=ciclica-one-1";

export function getEntries(state) {
  return Object.values(state.entries).sort((a, b) => a.date.localeCompare(b.date));
}

export function getCycleEstimate(state, date = new Date()) {
  if (!state.profile?.lastPeriod) {
    return {
      phase: "unknown",
      day: null,
      nextPeriodInDays: null,
      headline: "Configura tu primer ciclo",
      summary: "Registra lo minimo y Ciclica empezara a detectar patrones sin sacar datos de tu computadora.",
      confidence: "Sin datos",
    };
  }

  const lastPeriod = parseISODate(state.profile.lastPeriod);
  const cycleLength = state.profile.cycleLength || 28;
  const diff = daysBetween(lastPeriod, date);
  const cycleDay = ((diff % cycleLength) + cycleLength) % cycleLength + 1;
  const nextPeriodInDays = cycleLength - cycleDay + 1;
  const irregular = state.profile.regularity !== "regular";
  const contexts = state.profile.contexts || [];
  const confidence = irregular || contexts.includes("somp") ? "Media-baja" : "Media";

  if (cycleDay <= 5) {
    return {
      phase: "menstrual",
      day: cycleDay,
      nextPeriodInDays,
      headline: `Dia ${cycleDay}: fase menstrual probable`,
      summary: "Ventana de sangrado o recuperacion. Prioriza descanso real, calor local si ayuda y movimiento suave si se siente bien.",
      confidence,
    };
  }

  if (cycleDay <= Math.max(10, Math.floor(cycleLength * 0.45))) {
    return {
      phase: "follicular",
      day: cycleDay,
      nextPeriodInDays,
      headline: `Dia ${cycleDay}: fase folicular probable`,
      summary: "Puede ser una ventana de energia mas estable. Buen momento para planear, retomar fuerza y observar claridad mental.",
      confidence,
    };
  }

  if (cycleDay <= Math.max(14, Math.floor(cycleLength * 0.58))) {
    return {
      phase: "ovulatory",
      day: cycleDay,
      nextPeriodInDays,
      headline: `Dia ${cycleDay}: ventana ovulatoria posible`,
      summary: "Estimacion corporal, no anticoncepcion. Si no quieres foco en fertilidad, esta ventana queda solo como referencia privada.",
      confidence: contexts.includes("noFertility") ? "Oculta" : confidence,
    };
  }

  return {
    phase: "luteal",
    day: cycleDay,
    nextPeriodInDays,
    headline: `Dia ${cycleDay}: fase lutea probable`,
    summary: "Algunas personas notan mas sensibilidad, hambre, sueno ligero o menor paciencia. Ciclica observa si esto tambien es cierto para ti.",
    confidence,
  };
}

export function getInsight(state, dateISO = toISODate(new Date())) {
  const entries = getEntries(state);
  const entry = state.entries[dateISO];
  const estimate = getCycleEstimate(state, parseISODate(dateISO));
  const cluster = getSymptomCluster(entry);

  if (!state.profile) {
    const actions = getPhaseActions("unknown", entry, []);
    if (entry) {
      const lines = [cluster, describeEntry(entry), "Configura tu ultimo periodo cuando quieras para que Ciclica empiece a estimar fases."].filter(Boolean);
      return {
        title: cluster ? "Un patron que vale la pena notar" : "Registro de hoy guardado",
        lines,
        actions,
      };
    }
    return {
      title: "Empieza con tu ultimo periodo",
      lines: ["Con dos datos basicos, Ciclica puede estimar una fase probable sin asumir que tu cuerpo es un calendario perfecto."],
      actions,
    };
  }

  const actions = getPhaseActions(estimate.phase, entry, state.profile.contexts || []);

  if (entries.length < 3) {
    const lines = [cluster, estimate.summary, `Con ${3 - entries.length} registro(s) mas podre darte patrones menos genericos.`].filter(Boolean);
    return {
      title: cluster ? "Un patron que vale la pena notar" : "Linea base en construccion",
      lines,
      actions,
    };
  }

  const repeatedMood = getMostCommon(entries.map((item) => item.mood).filter(Boolean));
  const personalSignal = repeatedMood
    ? `Tu animo mas repetido ultimamente ha sido ${moodLabels[repeatedMood]}.`
    : "Aun no hay un patron emocional dominante.";

  const lines = [cluster, estimate.summary, personalSignal, "Esta lectura es una hipotesis local, no un diagnostico."].filter(Boolean);

  return {
    title: estimate.headline,
    lines,
    actions,
  };
}

export function getFindings(state) {
  const entries = getEntries(state);
  const contexts = state.profile?.contexts || [];
  const findings = [];

  if (!state.profile) {
    findings.push(["Falta perfil inicial", "Ciclica necesita fecha de ultima menstruacion y longitud aproximada para estimar fases con transparencia."]);
  }

  const heavyPain = entries.filter((entry) => entry.pain >= 7);
  if (heavyPain.length) {
    findings.push(["Dolor alto registrado", `${heavyPain.length} dia(s) con dolor 7/10 o mas. Si limita tu vida, no deberia normalizarse: conviene llevarlo a consulta.`]);
  }

  if (contexts.includes("somp")) {
    findings.push(["Modo SOMP/SOP", "Las predicciones evitan asumir ovulacion fija. SOMP/SOP se entiende como condicion metabolica, endocrina y ovarica."]);
  }

  if (entries.length < 7) {
    findings.push(["Datos suficientes pronto", "Con una semana de registros, los patrones empiezan a ser utiles. Con tres ciclos, el reporte se vuelve mucho mas fuerte."]);
  }

  return findings;
}

export function getIntensity(entry) {
  const bleedingScore = { none: 0, light: 1, medium: 2, heavy: 3 }[entry.bleeding] || 0;
  const symptomScore = Math.max(entry.pain, 10 - entry.energy, 10 - entry.sleep);
  return clamp(bleedingScore + Math.ceil(symptomScore / 4), 1, 4);
}

export function getCalendarDays(state, days = 28) {
  const today = startOfDay(new Date());
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(today, index - (days - 1));
    const iso = toISODate(date);
    return { date, iso, entry: state.entries[iso] };
  });
}

function getPhaseActions(phase, entry, contexts) {
  const actionMap = {
    unknown: ["Configura tu ultima menstruacion.", "Empieza con dolor, energia y animo.", "Marca SOMP/SOP o anticonceptivos si aplica."],
    menstrual: ["Baja la exigencia si dolor o cansancio estan altos.", "Prioriza comidas completas y liquidos.", "Registra sangrado abundante o dolor incapacitante para consulta."],
    follicular: ["Usa la energia disponible para tareas que pidan claridad.", "Si entrenas, prueba fuerza progresiva.", "Observa piel, digestion y libido sin exigir que se repita cada ciclo."],
    ovulatory: ["Toma esta ventana como estimacion, no anticoncepcion.", "Registra flujo, dolor unilateral o cambios de energia.", "Con SOMP/SOP o ciclos irregulares, interpreta con cautela."],
    luteal: ["Protege sueno y comidas estables.", "Reduce friccion si puedes: exceso de cafeina, multitarea o conversaciones dificiles.", "Si tristeza o irritabilidad interfieren cada ciclo, registralo para hablar de TDPM/PMDD."],
  };
  const actions = [...actionMap[phase]];
  const urgentActions = [];
  if (entry?.pain >= 7) urgentActions.push("Dolor alto hoy: si se repite o limita tu dia, merece consulta.");
  if (entry?.sleep <= 4) urgentActions.push("Sueno bajo hoy: ajusta expectativas antes de culparte por energia o animo.");
  actions.unshift(...urgentActions);
  if (contexts.includes("noFertility")) actions.push("El foco de fertilidad esta minimizado por tu preferencia.");
  return actions.slice(0, 4);
}

function describeEntry(entry) {
  const bits = [];
  if (entry.pain >= 7) bits.push(`dolor alto (${entry.pain}/10)`);
  else if (entry.pain > 0) bits.push(`dolor ${entry.pain}/10`);
  if (entry.mood) bits.push(`animo ${moodLabels[entry.mood]}`);
  if (entry.skin && entry.skin !== "none") bits.push(`piel ${skinLabels[entry.skin]}`);
  if (entry.bleeding && entry.bleeding !== "none") bits.push(`sangrado ${bleedingLabels[entry.bleeding]}`);
  if (entry.note) bits.push("una nota guardada");
  if (!bits.length) return "Ya registraste hoy.";
  return `Hoy registraste ${bits.join(", ")}.`;
}

const HARD_MOODS = ["irritable", "sensitive", "sad", "anxious"];

function getSymptomCluster(entry) {
  if (!entry) return null;
  const signals = [
    entry.pain >= 5,
    HARD_MOODS.includes(entry.mood),
    entry.skin === "breakout" || entry.skin === "sensitive",
    entry.sleep <= 4,
  ];
  const hits = signals.filter(Boolean).length;
  if (hits < 2) return null;
  return "Dolor, animo dificil, piel reactiva y mal sueno tienden a moverse juntos por el mismo vaiven hormonal: no son fallas separadas tuyas, son parte de un mismo patron.";
}

function getMostCommon(values) {
  if (!values.length) return null;
  const counts = values.reduce((acc, value) => ({ ...acc, [value]: (acc[value] || 0) + 1 }), {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}
