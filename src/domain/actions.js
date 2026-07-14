export const focusOptions = [
  { id: "pain", label: "Cólicos" },
  { id: "lowEnergy", label: "Energía baja" },
  { id: "anxious", label: "Ansiedad" },
  { id: "sensitive", label: "Sensibilidad" },
  { id: "bloated", label: "Hinchazón" },
  { id: "digestion", label: "Digestión" },
  { id: "focus", label: "Concentración" },
  { id: "other", label: "Otro" },
];

/** Síntomas del registro: cada uno con intensidad propia. */
export const symptomCatalog = [
  { id: "cramps", label: "Cólicos", focus: "pain" },
  { id: "backPain", label: "Espalda", focus: "pain" },
  { id: "headache", label: "Cabeza", focus: "pain" },
  { id: "legs", label: "Piernas", focus: "pain" },
  { id: "breast", label: "Pechos", focus: "sensitive" },
  { id: "lowEnergy", label: "Energía baja", focus: "lowEnergy" },
  { id: "anxious", label: "Ansiedad", focus: "anxious" },
  { id: "sensitive", label: "Sensibilidad", focus: "sensitive" },
  { id: "bloated", label: "Hinchazón", focus: "bloated" },
  { id: "digestion", label: "Digestión", focus: "digestion" },
  { id: "focus", label: "Concentración", focus: "focus" },
  { id: "shortSleep", label: "Sueño corto", focus: "lowEnergy" },
  { id: "stressed", label: "Estrés", focus: "anxious" },
  { id: "other", label: "Otro", focus: "other" },
];

export const bleedingOptions = [
  { value: "none", label: "Ninguno" },
  { value: "light", label: "Leve" },
  { value: "medium", label: "Medio" },
  { value: "heavy", label: "Abundante" },
];

export const bleedingColorOptions = [
  { value: "", label: "—" },
  { value: "bright", label: "Rojo vivo" },
  { value: "dark", label: "Oscuro" },
  { value: "brown", label: "Marrón" },
  { value: "pink", label: "Rosado" },
];

export const bleedingOdorOptions = [
  { value: "", label: "—" },
  { value: "normal", label: "Normal" },
  { value: "strong", label: "Fuerte" },
  { value: "unusual", label: "Distinto" },
];

export const intensityLevels = [
  { value: 0, label: "—" },
  { value: 2, label: "Leve" },
  { value: 5, label: "Presente" },
  { value: 8, label: "Fuerte" },
  { value: 10, label: "Intensa" },
];

export const registerCompanions = [
  { id: "shortSleep", label: "Sueño corto" },
  { id: "stressed", label: "Estrés" },
  { id: "hungry", label: "Poca comida" },
  { id: "bleeding", label: "Sangrado" },
];

export const correlatesBySignal = Object.fromEntries(
  focusOptions.map(({ id }) => [id, registerCompanions]),
);

const SIGNAL_PRIORITY = ["pain", "digestion", "bloated", "anxious", "sensitive", "lowEnergy", "focus", "other"];

export function symptomFocus(symptomId) {
  return symptomCatalog.find((item) => item.id === symptomId)?.focus || symptomId;
}

export function pickPrimarySignal(signals = []) {
  const selected = signals.map(String).filter(Boolean);
  if (!selected.length) return "pain";
  return SIGNAL_PRIORITY.find((id) => selected.includes(id)) || selected[0];
}

/** Elige la señal de acción según gravedad y prioridad clínica. */
export function pickPrimarySymptom(symptoms = []) {
  const active = symptoms.filter((item) => Number(item.intensity) > 0);
  if (!active.length) {
    return { focus: "other", intensity: 5, symptomId: null, signals: [] };
  }

  const ranked = [...active].sort((a, b) => {
    const focusA = symptomFocus(a.id);
    const focusB = symptomFocus(b.id);
    const pa = SIGNAL_PRIORITY.indexOf(focusA);
    const pb = SIGNAL_PRIORITY.indexOf(focusB);
    const rankA = pa === -1 ? 99 : pa;
    const rankB = pb === -1 ? 99 : pb;
    if (rankA !== rankB) return rankA - rankB;
    return Number(b.intensity) - Number(a.intensity);
  });

  const top = ranked[0];
  const focus = symptomFocus(top.id) || "other";
  const signals = [...new Set(active.map((item) => symptomFocus(item.id)).filter(Boolean))];
  return {
    focus,
    intensity: clampIntensity(Number(top.intensity) || 5),
    symptomId: top.id,
    signals,
  };
}

function clampIntensity(value) {
  return Math.min(10, Math.max(1, value));
}

export function getCorrelatesForSignal() {
  return registerCompanions;
}

const plans = {
  pain: {
    2: {
      title: "Bajar el dolor sin detener todo",
      why: "Reducir presión y soltar tensión puede darte alivio sin pedirte que abandones lo que estás haciendo.",
      steps: [
        "Apoya ambos pies y deja que la espalda descanse.",
        "Afloja cualquier presión sobre el abdomen.",
        "Exhala lentamente seis veces, más largo de lo que inhalas.",
      ],
    },
    10: {
      title: "Dar espacio al dolor durante diez minutos",
      why: "Combinar calor, movimiento breve y una postura menos tensa suele ser más útil que aguantar inmóvil.",
      steps: [
        "Aplica calor local si está disponible y es seguro para ti.",
        "Haz cinco movimientos lentos de pelvis o espalda baja.",
        "Camina suavemente durante dos minutos.",
        "Vuelve a evaluar el dolor sin exigir que desaparezca por completo.",
      ],
    },
    30: {
      title: "Crear una pausa real para el dolor",
      why: "Cuando tienes más tiempo, alternar calor, descanso apoyado y movimiento suave permite probar qué responde mejor hoy.",
      steps: [
        "Prepara calor local y una posición con apoyo para espalda y piernas.",
        "Permanece así diez minutos sin pantallas si puedes.",
        "Prueba cinco minutos de movimiento suave.",
        "Registra qué parte ayudó antes de volver a tu actividad.",
      ],
    },
  },
  lowEnergy: {
    2: {
      title: "Recuperar un poco de activación",
      why: "La combinación de luz, postura y movimiento corto puede despejarte sin depender inmediatamente de más cafeína.",
      steps: [
        "Ponte de pie y mira hacia una fuente de luz natural.",
        "Mueve hombros y brazos durante un minuto.",
        "Toma agua y elige una sola tarea para retomar.",
      ],
    },
    10: {
      title: "Recuperar energía sin exigirte más",
      why: "Una pausa con luz, movimiento y combustible sencillo puede ayudar a distinguir cansancio físico de saturación mental.",
      steps: [
        "Sal a la luz exterior o acércate a una ventana durante cinco minutos.",
        "Camina a ritmo cómodo mientras respiras con normalidad.",
        "Si llevas horas sin comer, elige algo pequeño con carbohidrato y proteína.",
        "Al volver, reduce tu siguiente tarea a un primer paso visible.",
      ],
    },
    30: {
      title: "Quitar una tarea y descansar veinte minutos",
      why: "Una pausa más larga sirve para recuperar capacidad, no para llenar el tiempo con otra obligación.",
      steps: [
        "Silencia notificaciones durante veinte minutos.",
        "Come algo completo si corresponde a tu horario.",
        "Descansa con ojos cerrados o camina suavemente, según lo que tu cuerpo pida.",
        "Elimina una tarea no esencial de hoy.",
      ],
    },
  },
  anxious: {
    2: {
      title: "Bajar la activación antes de seguir",
      why: "Una salida sensorial breve puede darte margen antes de responder o tomar una decisión.",
      steps: [
        "Apoya los pies y encuentra tres objetos del mismo color.",
        "Haz cuatro exhalaciones más largas que la inhalación.",
        "Nombra la próxima acción física, no toda la lista pendiente.",
      ],
    },
    10: {
      title: "Reducir estímulos y recuperar margen",
      why: "Bajar una fuente de estímulo y concretar el siguiente paso suele ayudar más que intentar calmar todos los pensamientos.",
      steps: [
        "Silencia notificaciones y reduce luz o ruido durante diez minutos.",
        "Escribe qué necesitas resolver en una sola frase.",
        "Separa lo urgente de lo que puede esperar.",
        "Elige una acción de menos de cinco minutos.",
      ],
    },
    30: {
      title: "Salir del bucle de sobrecarga",
      why: "Tener tiempo permite descargar pendientes y volver con una prioridad más realista.",
      steps: [
        "Escribe todo lo que está ocupando espacio mental durante cinco minutos.",
        "Marca solo una cosa que sí necesita atención hoy.",
        "Camina o cambia de habitación durante diez minutos.",
        "Vuelve únicamente a la acción marcada.",
      ],
    },
  },
  sensitive: {
    2: {
      title: "Crear margen antes de responder",
      why: "Cuando estás sensible, una pausa corta puede evitar que tengas que procesar y responder al mismo tiempo.",
      steps: [
        "Pon ambos pies en el suelo y suelta la mandíbula.",
        "Escribe en una frase qué necesitas ahora.",
        "Si debes responder, usa: ‘Necesito pensarlo; vuelvo contigo después’.",
      ],
    },
    10: {
      title: "Protegerte sin aislarte",
      why: "Reducir estímulos y poner un límite concreto puede bajar fricción sin convertir el día en una retirada completa.",
      steps: [
        "Aléjate diez minutos del estímulo más intenso.",
        "Identifica si necesitas espacio, alimento, descanso o claridad.",
        "Envía un límite breve si alguien espera una respuesta.",
        "Elige una tarea con baja carga emocional para volver.",
      ],
    },
    30: {
      title: "Recuperar espacio emocional",
      why: "Una pausa con menos estímulos puede ayudarte a distinguir sensibilidad corporal de un conflicto que necesita acción.",
      steps: [
        "Busca un lugar con menos ruido y luz.",
        "Escribe qué pasó y qué necesita esperar.",
        "Haz una actividad repetitiva y suave durante quince minutos.",
        "Decide después si necesitas hablar, descansar o pedir ayuda.",
      ],
    },
  },
  bloated: {
    2: {
      title: "Reducir presión abdominal ahora",
      why: "Quitar compresión y cambiar de postura puede dar alivio aunque no elimine la hinchazón.",
      steps: [
        "Afloja cualquier prenda que comprima el abdomen.",
        "Alarga la espalda sin contener el abdomen.",
        "Respira normalmente y evita acostarte justo después de comer.",
      ],
    },
    10: {
      title: "Dar movimiento suave a la digestión",
      why: "Caminar con suavidad y reducir presión suele ser más práctico que quedarse inmóvil con incomodidad.",
      steps: [
        "Afloja presión sobre el abdomen.",
        "Camina suavemente entre cinco y diez minutos.",
        "Prueba una bebida tibia si te resulta agradable.",
        "Evalúa de nuevo en veinte minutos.",
      ],
    },
    30: {
      title: "Hacer espacio para que baje la incomodidad",
      why: "Una pausa sin compresión y con movimiento ligero permite observar si la molestia cambia antes de sumar más intervenciones.",
      steps: [
        "Camina diez minutos a ritmo cómodo.",
        "Evita recostarte completamente si acabas de comer.",
        "Usa ropa suelta y una bebida tibia si te ayuda.",
        "Registra si la presión cambia o aparece dolor localizado.",
      ],
    },
  },
  focus: {
    2: {
      title: "Recuperar un punto de entrada",
      why: "La concentración suele volver mejor con una acción física concreta que con una lista completa de pendientes.",
      steps: [
        "Cierra todo excepto lo que necesitas para la siguiente acción.",
        "Escribe un verbo concreto: abrir, responder, revisar o enviar.",
        "Trabaja solo en ese verbo durante dos minutos.",
      ],
    },
    10: {
      title: "Construir diez minutos de enfoque",
      why: "Reducir opciones y preparar el entorno disminuye la fricción para empezar.",
      steps: [
        "Silencia notificaciones durante diez minutos.",
        "Deja visible un solo documento o tarea.",
        "Escribe qué resultado pequeño quieres al terminar.",
        "Empieza sin intentar completar todo el proyecto.",
      ],
    },
    30: {
      title: "Recuperar una franja de concentración",
      why: "Un bloque protegido funciona mejor cuando tiene un resultado pequeño y un final claro.",
      steps: [
        "Elige una tarea y define qué significa avanzar, no terminar.",
        "Silencia notificaciones y despeja el escritorio.",
        "Trabaja veinticinco minutos.",
        "Usa los últimos cinco para anotar dónde continuar.",
      ],
    },
  },
  digestion: {
    2: {
      title: "Aliviar la digestión sin frenar todo",
      why: "Soltar presión y cambiar de postura puede bajar la incomodidad de inmediato.",
      steps: [
        "Afloja cualquier prenda que comprima el abdomen.",
        "Ponte de pie un minuto y respira sin forzar.",
        "Toma sorbos de agua tibia si te resulta bien.",
      ],
    },
    10: {
      title: "Dar movimiento suave a la digestión",
      why: "Caminar despacio suele ayudar más que quedarte inmóvil con molestia.",
      steps: [
        "Camina suavemente cinco a diez minutos.",
        "Evita acostarte si acabas de comer.",
        "Nota si la molestia es presión, dolor o náusea.",
        "Registra qué cambió al volver.",
      ],
    },
    30: {
      title: "Hacer espacio real a la digestión",
      why: "Una pausa sin compresión permite observar si el cuerpo responde antes de sumar más intervenciones.",
      steps: [
        "Camina diez minutos a ritmo cómodo.",
        "Come o bebe solo si el cuerpo lo pide, sin forzar.",
        "Usa ropa suelta y una posición apoyada.",
        "Anota si mejora, se mantiene o aparece dolor localizado.",
      ],
    },
  },
  other: {
    2: {
      title: "Nombrar qué necesitas ahora",
      why: "Cuando la señal no encaja en una lista, concretar una necesidad pequeña evita quedarte en blanco.",
      steps: [
        "Escribe en una frase qué estás notando.",
        "Elige una necesidad: agua, calor, silencio, movimiento o pausa.",
        "Haz solo esa cosa durante dos minutos.",
      ],
    },
    10: {
      title: "Probar una acción a tu medida",
      why: "Sin categoría fija, lo útil es una prueba corta y después registrar si ayudó.",
      steps: [
        "Relee lo que escribiste sobre este momento.",
        "Elige una acción de diez minutos alineada a esa necesidad.",
        "Reduce un estímulo (pantalla, ruido o exigencia).",
        "Al terminar, marca si cambió algo.",
      ],
    },
    30: {
      title: "Crear una pausa y observar qué responde",
      why: "Con más tiempo puedes probar y comparar, que es lo que después alimenta tus patrones.",
      steps: [
        "Aparta treinta minutos sin otras tareas.",
        "Prueba la acción que tiene más sentido para lo que escribiste.",
        "Anota intensidad antes y después en una palabra.",
        "Guarda si vale repetirla la próxima vez.",
      ],
    },
  },
};

export function getActionPlan(checkIn = {}) {
  const focus = plans[checkIn.focus] ? checkIn.focus : "other";
  const requested = Number(checkIn.availableTime);
  const durationMinutes = requested >= 30 ? 30 : requested >= 10 ? 10 : 2;
  const source = plans[focus][durationMinutes];
  const id = `${focus}-${durationMinutes}`;

  return {
    id,
    focus,
    title: source.title,
    durationMinutes,
    why: source.why,
    steps: [...source.steps],
  };
}

export function getMomentInterpretation(checkIn = {}, previousCheckIns = []) {
  const labels = {
    pain: "dolor",
    lowEnergy: "energía baja",
    anxious: "ansiedad",
    sensitive: "sensibilidad",
    bloated: "hinchazón",
    digestion: "digestión",
    focus: "dificultad para concentrarte",
    other: "esto que marcaste",
  };
  const focusLabel = labels[checkIn.focus] || "esta señal";
  const matching = previousCheckIns.filter((item) => item.focus === checkIn.focus).length + 1;
  const numberWords = { 1: "una", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco" };
  const countLabel = numberWords[Math.min(matching, 5)] || String(matching);
  const isRepeated = matching >= 3;

  return {
    headline: isRepeated ? `El ${focusLabel} empieza a repetirse` : `Este momento de ${focusLabel} queda registrado`,
    body: isRepeated
      ? buildRepeatedMomentBody(checkIn, focusLabel, countLabel)
      : buildFirstMomentBody(checkIn),
    confidence: isRepeated ? "Conexión posible" : "Lectura inicial",
    caution:
      checkIn.focus === "pain" && Number(checkIn.intensity) >= 7
        ? "Si el dolor limita tu día, empeora o se repite, merece atención y una conversación en consulta."
        : "Esta lectura organiza tus registros; no sustituye una evaluación médica.",
  };
}

function buildRepeatedMomentBody(checkIn, focusLabel, countLabel) {
  const bits = [`El ${focusLabel} aparece en ${countLabel} momentos registrados.`];
  if (Number.isFinite(Number(checkIn.cycleDay)) && checkIn.cycleDay != null) bits.push(`Este cayó en el día ${checkIn.cycleDay}.`);
  bits.push("Ciclica observa qué suele acompañarlo y qué acciones ayudan.");
  return bits.join(" ");
}

function buildFirstMomentBody(checkIn) {
  if (Number.isFinite(Number(checkIn.cycleDay)) && checkIn.cycleDay != null) {
    return `Queda anclado al día ${checkIn.cycleDay}. Con más momentos parecidos se podrá afirmar un patrón.`;
  }
  return `Todavía hay pocos momentos parecidos para afirmar un patrón. Lo útil ahora es registrar qué haces y si realmente ayuda.`;
}

export function getActionLearning(checkIns = []) {
  const grouped = new Map();

  checkIns.forEach((checkIn) => {
    if (!checkIn?.action?.id) return;
    const current = grouped.get(checkIn.action.id) || {
      id: checkIn.action.id,
      title: checkIn.action.title,
      tried: 0,
      much: 0,
      some: 0,
      no: 0,
      pending: 0,
    };
    current.tried += checkIn.feedback ? 1 : 0;
    if (checkIn.feedback === "much") current.much += 1;
    else if (checkIn.feedback === "some") current.some += 1;
    else if (checkIn.feedback === "no") current.no += 1;
    else current.pending += 1;
    grouped.set(checkIn.action.id, current);
  });

  const items = [...grouped.values()];
  return {
    helpful: items.filter((item) => item.tried > 0 && item.much + item.some > item.no).sort((a, b) => b.much + b.some - (a.much + a.some)),
    notHelpful: items.filter((item) => item.tried > 0 && item.no >= item.much + item.some),
    uncertain: items.filter((item) => item.pending > 0 || item.tried === 0),
  };
}
