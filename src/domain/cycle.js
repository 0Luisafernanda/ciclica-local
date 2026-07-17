import { addDays, clamp, daysBetween, parseISODate, startOfDay, toISODate } from "./date.js?v=feer-1";
import { moodLabels, bleedingLabels, skinLabels } from "../data/labels.js?v=feer-1";
import { symptomFocus } from "../domain/actions.js?v=feer-1";

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
      summary: "Registra lo minimo y Feer empezara a detectar patrones sin sacar datos de tu computadora.",
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
      headline: `Dia ${cycleDay}: fase menstrual`,
      summary: "Ventana de sangrado o recuperacion. Prioriza descanso real, calor local si ayuda y movimiento suave si se siente bien.",
      confidence,
    };
  }

  if (cycleDay <= Math.max(10, Math.floor(cycleLength * 0.45))) {
    return {
      phase: "follicular",
      day: cycleDay,
      nextPeriodInDays,
      headline: `Dia ${cycleDay}: fase folicular`,
      summary: "Puede ser una ventana de energia mas estable. Buen momento para planear, retomar fuerza y observar claridad mental.",
      confidence,
    };
  }

  if (cycleDay <= Math.max(14, Math.floor(cycleLength * 0.58))) {
    return {
      phase: "ovulatory",
      day: cycleDay,
      nextPeriodInDays,
      headline: `Dia ${cycleDay}: ventana ovulatoria`,
      summary: "Estimacion corporal, no anticoncepcion. Si no quieres foco en fertilidad, esta ventana queda solo como referencia privada.",
      confidence: contexts.includes("noFertility") ? "Oculta" : confidence,
    };
  }

  return {
    phase: "luteal",
    day: cycleDay,
    nextPeriodInDays,
    headline: `Dia ${cycleDay}: fase lutea`,
    summary: "Algunas personas notan mas sensibilidad, hambre, sueno ligero o menor paciencia. Feer observa si esto tambien es cierto para ti.",
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
      const lines = [cluster, describeEntry(entry), "Configura tu ultimo periodo cuando quieras para que Feer empiece a estimar fases."].filter(Boolean);
      return {
        title: cluster ? "Un patron que vale la pena notar" : "Registro de hoy guardado",
        lines,
        actions,
      };
    }
    return {
      title: "Empieza con tu ultimo periodo",
      lines: ["Con dos datos basicos, Feer puede estimar una fase probable sin asumir que tu cuerpo es un calendario perfecto."],
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

export function getPeriodStartDates(state) {
  const starts = new Set();
  getEntries(state).forEach((entry) => {
    if (entry?.periodStarted && entry.date) starts.add(entry.date);
  });
  if (state.profile?.lastPeriod) starts.add(state.profile.lastPeriod);
  return [...starts].sort();
}

/** Ciclo 1 = primer sangrado known; null si la fecha cae antes de cualquier inicio. */
export function getCycleNumber(state, dateInput) {
  const dateISO =
    typeof dateInput === "string"
      ? dateInput.slice(0, 10)
      : dateInput instanceof Date
        ? toISODate(dateInput)
        : null;
  if (!dateISO) return null;
  const starts = getPeriodStartDates(state);
  if (!starts.length) return null;
  let number = null;
  starts.forEach((start, index) => {
    if (start <= dateISO) number = index + 1;
  });
  return number;
}

export function getPersonalInsight(state, dateISO = toISODate(new Date())) {
  const entries = getEntries(state)
    .filter((entry) => !entry.date || entry.date <= dateISO)
    .map((entry) => ({
      ...entry,
      cycleNumber: entry.cycleNumber ?? getCycleNumber(state, entry.date),
    }));
  const checkIns = enrichCheckIns(state, dateISO);
  const signalRows = expandSignals(checkIns);

  const crossCycle =
    findCrossCyclePhasePattern(signalRows) ||
    findCrossCycleCompanionPattern(signalRows) ||
    findCrossCycleActionPattern(checkIns);
  if (crossCycle) return crossCycle;

  const entryLink = findEntryCompanionLink(entries);
  if (entryLink) return entryLink;

  const emerging =
    markEmerging(findCompanionSignalPattern(signalRows)) ||
    markEmerging(findPhaseSignalPattern(signalRows)) ||
    markEmerging(findHighIntensityPattern(signalRows)) ||
    markEmerging(findWithinWindowActionPattern(checkIns)) ||
    markEmerging(findRepeatedSignalPattern(signalRows));
  if (emerging) return emerging;

  const latest = checkIns.at(-1);
  if (latest) {
    const focusLabel = focusNoun(latest.focus);
    const headlineFocus = focusArticle(latest.focus);
    const dayBit = latest.cycleDay != null && Number.isFinite(Number(latest.cycleDay)) ? ` Día ${latest.cycleDay}.` : "";
    return {
      status: "watching",
      headline: `Falta saber si ${headlineFocus} se repite`,
      body: `Solo hay ${countFocus(checkIns, latest.focus)} registro${countFocus(checkIns, latest.focus) === 1 ? "" : "s"} de ${focusLabel}.${dayBit} Un patrón pedirá verse en más de un ciclo.`,
      evidence: `${checkIns.length} momento${checkIns.length === 1 ? "" : "s"} registrado${checkIns.length === 1 ? "" : "s"}`,
    };
  }

  return {
    status: "watching",
    headline: "Sin patrón aún",
    body: "Aparece cuando una señal se sostiene ciclo tras ciclo, no solo en una semana.",
    evidence: "",
  };
}

function enrichCheckIns(state, dateISO) {
  return (Array.isArray(state.checkIns) ? state.checkIns : [])
    .filter((item) => {
      const itemDate = item.date || item.createdAt?.slice(0, 10);
      return !itemDate || itemDate <= dateISO;
    })
    .map((item) => {
      const date = item.date || item.createdAt?.slice(0, 10);
      return {
        ...item,
        date,
        signals: getCheckInSignals(item),
        cycleNumber: item.cycleNumber ?? getCycleNumber(state, date),
      };
    });
}

function getCheckInSignals(item) {
  if (Array.isArray(item?.symptoms) && item.symptoms.length) {
    return [...new Set(item.symptoms.filter((symptom) => Number(symptom.intensity) > 0).map((symptom) => symptomFocus(symptom.id)))];
  }
  if (Array.isArray(item?.signals) && item.signals.length) return item.signals;
  return item?.focus ? [item.focus] : [];
}

/** Expande un check-in multi-señal a filas por señal para patrones. */
function expandSignals(checkIns = []) {
  return checkIns.flatMap((item) => {
    if (Array.isArray(item.symptoms) && item.symptoms.length) {
      return item.symptoms
        .filter((symptom) => Number(symptom.intensity) > 0)
        .map((symptom) => ({
          ...item,
          focus: symptomFocus(symptom.id),
          intensity: Number(symptom.intensity),
          symptomId: symptom.id,
        }));
    }
    return getCheckInSignals(item).map((focus) => ({
      ...item,
      focus,
    }));
  });
}

function countFocus(checkIns, focus) {
  return expandSignals(checkIns).filter((item) => item.focus === focus).length;
}

function distinctCycleCount(items = []) {
  return new Set(items.map((item) => item.cycleNumber).filter((value) => value != null)).size;
}

function markEmerging(insight) {
  if (!insight) return null;
  return {
    ...insight,
    status: "watching",
    body: `${insight.body} Por ahora en un solo tramo: si se repite en otro ciclo, se vuelve patrón.`,
    evidence: insight.evidence ? `${insight.evidence} · 1 ciclo` : "1 ciclo",
  };
}

function findCrossCyclePhasePattern(checkIns) {
  const usable = checkIns.filter(
    (item) => item.cycleNumber != null && item.phase && item.phase !== "unknown" && item.focus && item.focus !== "other",
  );
  const keys = new Map();
  usable.forEach((item) => {
    const key = `${item.focus}|${item.phase}`;
    const current = keys.get(key) || { focus: item.focus, phase: item.phase, items: [] };
    current.items.push(item);
    keys.set(key, current);
  });

  const ranked = [...keys.values()]
    .map((group) => ({ ...group, cycles: distinctCycleCount(group.items) }))
    .filter((group) => group.cycles >= 2 && group.items.length >= 2)
    .sort((a, b) => b.cycles - a.cycles || b.items.length - a.items.length);

  const best = ranked[0];
  if (!best) return null;
  return {
    status: "pattern",
    headline: `${focusTitle(best.focus)} vuelve en ${phaseLabel(best.phase)} ciclo tras ciclo`,
    body: "Misma fase, distintos ciclos: eso sí se sostiene como patrón personal.",
    evidence: `${best.cycles} ciclos · ${best.items.length} momentos`,
  };
}

function findCrossCycleCompanionPattern(checkIns) {
  const companionNames = {
    shortSleep: "sueño corto",
    stressed: "estrés",
    bleeding: "sangrado",
    hungry: "poca comida",
    bloatedFeel: "hinchazón",
  };
  const keys = new Map();
  checkIns.forEach((item) => {
    if (item.cycleNumber == null || !item.focus || item.focus === "other") return;
    (item.companions || []).forEach((companion) => {
      if (!companionNames[companion]) return;
      const key = `${item.focus}|${companion}`;
      const current = keys.get(key) || { focus: item.focus, companion, items: [] };
      current.items.push(item);
      keys.set(key, current);
    });
  });

  const ranked = [...keys.values()]
    .map((group) => ({ ...group, cycles: distinctCycleCount(group.items) }))
    .filter((group) => group.cycles >= 2 && group.items.length >= 2)
    .sort((a, b) => b.cycles - a.cycles || b.items.length - a.items.length);

  const best = ranked[0];
  if (!best) return null;
  return {
    status: "pattern",
    headline: `Con ${companionNames[best.companion]} aparece ${focusNoun(best.focus)} ciclo tras ciclo`,
    body: "La correlación se sostuvo en más de un ciclo, no solo en una racha de días.",
    evidence: `${best.cycles} ciclos · ${best.items.length} momentos`,
  };
}

function findCrossCycleActionPattern(checkIns) {
  const keys = new Map();
  checkIns
    .filter((item) => item.cycleNumber != null && item.action?.title && ["much", "some"].includes(item.feedback))
    .forEach((item) => {
      const key = item.action.id || item.action.title;
      const current = keys.get(key) || { title: item.action.title, items: [] };
      current.items.push(item);
      keys.set(key, current);
    });

  const ranked = [...keys.values()]
    .map((group) => ({ ...group, cycles: distinctCycleCount(group.items) }))
    .filter((group) => group.cycles >= 2 && group.items.length >= 2)
    .sort((a, b) => b.cycles - a.cycles || b.items.length - a.items.length);

  const best = ranked[0];
  if (!best) return null;
  return {
    status: "pattern",
    headline: `“${best.title}” ayudó en más de un ciclo`,
    body: "Eso ya no es una anécdota: es aprendizaje sostenido de tus propios registros.",
    evidence: `${best.cycles} ciclos · ${best.items.length} veces que ayudó`,
  };
}

function findEntryCompanionLink(entries) {
  const recent = entries.slice(-24);
  const lowEnergyDays = recent.filter((entry) => Number(entry.energy) <= 4);
  const lowEnergyWithShortSleep = lowEnergyDays.filter((entry) => Number(entry.sleep) <= 5);
  if (lowEnergyWithShortSleep.length >= 2 && lowEnergyWithShortSleep.length / lowEnergyDays.length >= 0.6) {
    const cycles = distinctCycleCount(lowEnergyWithShortSleep);
    if (cycles >= 2) {
      return {
        status: "pattern",
        headline: "La energía baja aparece junto con poco sueño ciclo tras ciclo",
        body: "En tus registros, esa combinación se sostuvo en más de un ciclo.",
        evidence: `${cycles} ciclos · ${lowEnergyWithShortSleep.length} de ${lowEnergyDays.length} días con energía baja`,
      };
    }
    return {
      status: "watching",
      headline: "La energía baja aparece junto con poco sueño",
      body: "En tus registros, los días de menor energía también tuvieron cinco horas de sueño o menos. Por ahora en un solo tramo: si se repite en otro ciclo, se vuelve patrón.",
      evidence: `Visto en ${lowEnergyWithShortSleep.length} de ${lowEnergyDays.length} días con energía baja · 1 ciclo`,
    };
  }

  const painDays = recent.filter((entry) => Number(entry.pain) >= 5);
  const painWithShortSleep = painDays.filter((entry) => Number(entry.sleep) <= 5);
  if (painWithShortSleep.length >= 2 && painWithShortSleep.length / painDays.length >= 0.6) {
    const cycles = distinctCycleCount(painWithShortSleep);
    if (cycles >= 2) {
      return {
        status: "pattern",
        headline: "El dolor aparece junto con poco sueño ciclo tras ciclo",
        body: "Tus registros conectan dolor medio o alto con noches cortas en más de un ciclo.",
        evidence: `${cycles} ciclos · ${painWithShortSleep.length} de ${painDays.length} días con dolor`,
      };
    }
    return {
      status: "watching",
      headline: "El dolor aparece junto con poco sueño",
      body: "Tus registros conectan dolor de intensidad media o alta con noches de cinco horas o menos. Por ahora en un solo tramo: si se repite en otro ciclo, se vuelve patrón.",
      evidence: `Visto en ${painWithShortSleep.length} de ${painDays.length} días con dolor · 1 ciclo`,
    };
  }

  return null;
}

function findCompanionSignalPattern(checkIns) {
  const companionNames = {
    shortSleep: "sueño corto",
    stressed: "estrés",
    bleeding: "sangrado",
    hungry: "poca comida",
    bloatedFeel: "hinchazón",
  };

  const comboCounts = new Map();
  checkIns.forEach((item) => {
    if (!item?.focus || item.focus === "other") return;
    const comps = (item.companions || []).filter((id) => companionNames[id]).sort();
    if (comps.length < 2) return;
    const key = `${item.focus}|${comps.join("+")}`;
    const current = comboCounts.get(key) || { focus: item.focus, companions: comps, count: 0 };
    current.count += 1;
    comboCounts.set(key, current);
  });

  const bestCombo = [...comboCounts.values()].sort((a, b) => b.count - a.count)[0];
  if (bestCombo?.count >= 2) {
    const labels = bestCombo.companions.map((id) => companionNames[id]);
    return {
      status: "pattern",
      headline: `${focusTitle(bestCombo.focus)} suele venir con ${joinSpanish(labels)}`,
      body: "La combinación se repite en tus momentos: eso importa más que cada factor por separado.",
      evidence: `${bestCombo.count} momentos con esa combinación`,
    };
  }

  const links = [];
  Object.keys(companionNames).forEach((id) => {
    const moments = checkIns.filter((item) => Array.isArray(item.companions) && item.companions.includes(id));
    if (moments.length < 2) return;
    const [focus, count] = topCounted(moments.map((item) => item.focus));
    if (!focus || count < 2) return;
    links.push({ id, focus, count, total: moments.length });
  });
  links.sort((a, b) => b.count - a.count || b.total - a.total);
  if (!links.length) return null;

  const primary = links[0];
  const extras = links
    .filter((link) => link.focus === primary.focus && link.id !== primary.id)
    .slice(0, 2);
  const extraBit = extras.length
    ? ` También suele ir con ${joinSpanish(extras.map((link) => companionNames[link.id]))}.`
    : "";

  return {
    status: "pattern",
    headline: `Con ${companionNames[primary.id]} aparece ${focusNoun(primary.focus)}`,
    body: `Conexión observada en tus momentos, no una regla general.${extraBit}`,
    evidence: `${primary.count} de ${primary.total} momentos con ${companionNames[primary.id]}`,
  };
}

function joinSpanish(items = []) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} y ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} y ${items.at(-1)}`;
}

function findWithinWindowActionPattern(checkIns) {
  const actionCounts = new Map();
  checkIns
    .filter((item) => item.action?.title && ["much", "some"].includes(item.feedback))
    .forEach((item) => {
      const key = item.action.id || item.action.title;
      const current = actionCounts.get(key) || { count: 0, title: item.action.title };
      current.count += 1;
      actionCounts.set(key, current);
    });
  const repeatedAction = [...actionCounts.values()].sort((a, b) => b.count - a.count)[0];
  if (!repeatedAction || repeatedAction.count < 2) return null;
  return {
    status: "pattern",
    headline: `“${repeatedAction.title}” funcionó más de una vez`,
    body: "Sale de tus respuestas anteriores, no de un tip genérico.",
    evidence: `${repeatedAction.count} veces marcaste que ayudó`,
  };
}

function findPhaseSignalPattern(checkIns) {
  const usable = checkIns.filter((item) => item.phase && item.phase !== "unknown" && item.focus && item.focus !== "other");
  if (usable.length < 3) return null;

  const ranked = [...new Set(usable.map((item) => item.focus))]
    .map((focus) => ({ focus, related: usable.filter((item) => item.focus === focus) }))
    .filter((item) => item.related.length >= 3)
    .sort((a, b) => b.related.length - a.related.length);

  for (const { focus, related } of ranked) {
    const [phase, phaseCount] = topCounted(related.map((item) => item.phase));
    if (!phase || phaseCount < 2 || phaseCount / related.length < 0.6) continue;
    const strong = related.filter((item) => Number(item.intensity) >= 8).length;
    return {
      status: "pattern",
      headline: `${focusTitle(focus)} vuelve en ${phaseLabel(phase)}`,
      body: strong >= 2
        ? `Además, ${strong} de esos momentos fueron de intensidad fuerte o intensa.`
        : "Señal anclada a la fase estimada de tus días, no a un tip genérico.",
      evidence: `${phaseCount} de ${related.length} registros en ${phaseLabel(phase)}`,
    };
  }
  return null;
}

function findHighIntensityPattern(checkIns) {
  const strong = checkIns.filter((item) => Number(item.intensity) >= 8 && item.focus && item.focus !== "other");
  if (strong.length < 2) return null;
  const [focus, count] = topCounted(strong.map((item) => item.focus));
  if (!focus || count < 2) return null;
  const [phase, phaseCount] = topCounted(strong.filter((item) => item.focus === focus).map((item) => item.phase).filter((value) => value && value !== "unknown"));
  return {
    status: "pattern",
    headline: `${focusTitle(focus)} llega intenso con frecuencia`,
    body: phase && phaseCount >= 2
      ? `Esos picos se concentran en ${phaseLabel(phase)}.`
      : "Marcar intensidad alta permite separar ruido de lo que realmente te atraviesa.",
    evidence: `${count} momentos intensos de ${focusNoun(focus)}`,
  };
}

function findRepeatedSignalPattern(checkIns) {
  if (checkIns.length < 3) return null;
  const [focus, count] = topCounted(checkIns.map((item) => item.focus));
  if (!focus || count < 2) return null;

  const related = checkIns.filter((item) => item.focus === focus);
  const companionCounts = new Map();
  related.forEach((item) => {
    (item.companions || []).forEach((companion) => {
      if (companion === "other") return;
      companionCounts.set(companion, (companionCounts.get(companion) || 0) + 1);
    });
  });
  const rankedCompanions = [...companionCounts.entries()]
    .filter(([, companionCount]) => companionCount >= 2)
    .sort((a, b) => b[1] - a[1]);
  const companionLabel = {
    shortSleep: "sueño corto",
    stressed: "estrés",
    bleeding: "sangrado",
    hungry: "poca comida",
    bloatedFeel: "hinchazón",
    coldOrHeat: "frío o calor raro",
  };
  const labels = rankedCompanions
    .map(([companion]) => companionLabel[companion])
    .filter(Boolean)
    .slice(0, 3);

  return {
    status: "pattern",
    headline: `${focusTitle(focus)} se está repitiendo`,
    body: labels.length
      ? `Suele aparecer con ${joinSpanish(labels)}.`
      : "Marcá qué va junto la próxima vez: ahí el patrón se vuelve útil.",
    evidence: `${count} de ${checkIns.length} momentos recientes`,
  };
}

function topCounted(values = []) {
  const counts = new Map();
  values.filter(Boolean).forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || [null, 0];
}

function focusNoun(focus) {
  return {
    pain: "dolor",
    lowEnergy: "energía baja",
    anxious: "ansiedad",
    sensitive: "sensibilidad",
    bloated: "hinchazón",
    digestion: "digestión",
    focus: "poca concentración",
    other: "eso que marcaste",
  }[focus] || "esta señal";
}

function focusArticle(focus) {
  return {
    pain: "el dolor",
    lowEnergy: "la energía baja",
    anxious: "la ansiedad",
    sensitive: "la sensibilidad",
    bloated: "la hinchazón",
    digestion: "la digestión",
    focus: "la dificultad para concentrarte",
    other: "eso que marcaste",
  }[focus] || "esta señal";
}

function focusTitle(focus) {
  return {
    pain: "El dolor",
    lowEnergy: "La energía baja",
    anxious: "La ansiedad",
    sensitive: "La sensibilidad",
    bloated: "La hinchazón",
    digestion: "La digestión",
    focus: "La dificultad para concentrarte",
    other: "Eso que marcaste",
  }[focus] || "Esta señal";
}

function phaseLabel(phase) {
  return {
    menstrual: "la fase menstrual",
    follicular: "la fase folicular",
    ovulatory: "la ventana ovulatoria",
    luteal: "la fase lútea",
  }[phase] || "esta fase";
}

export function getFindings(state) {
  const entries = getEntries(state);
  const contexts = state.profile?.contexts || [];
  const findings = [];

  if (!state.profile) {
    findings.push(["Falta perfil inicial", "Feer necesita fecha de ultima menstruacion y longitud aproximada para estimar fases con transparencia."]);
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
