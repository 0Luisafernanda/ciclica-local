export const focusOptions = [
  { id: "pain", label: "Dolor" },
  { id: "lowEnergy", label: "Sin energía" },
  { id: "anxious", label: "Ansiosa" },
  { id: "sensitive", label: "Sensible" },
  { id: "bloated", label: "Hinchada" },
  { id: "focus", label: "No puedo concentrarme" },
];

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
};

export function getActionPlan(checkIn = {}) {
  const focus = plans[checkIn.focus] ? checkIn.focus : "focus";
  const requested = Number(checkIn.availableTime);
  const durationMinutes = requested >= 30 ? 30 : requested >= 10 ? 10 : 2;
  const source = plans[focus][durationMinutes];
  const contextSuffix = focus === "pain" && checkIn.context === "work" && durationMinutes === 2 ? "-work" : "";
  const id = `${focus}${contextSuffix}-${durationMinutes}`;
  const title = id === "pain-work-2" ? "Bajar el dolor sin dejar de trabajar" : source.title;

  return {
    id,
    focus,
    title,
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
    focus: "dificultad para concentrarte",
  };
  const focusLabel = labels[checkIn.focus] || "esta señal";
  const matching = previousCheckIns.filter((item) => item.focus === checkIn.focus).length + 1;
  const numberWords = { 1: "una", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco" };
  const countLabel = numberWords[Math.min(matching, 5)] || String(matching);
  const isRepeated = matching >= 3;

  return {
    headline: isRepeated ? `El ${focusLabel} empieza a repetirse` : `Este momento de ${focusLabel} queda registrado`,
    body: isRepeated
      ? `El ${focusLabel} aparece en ${countLabel} momentos registrados. Ciclica seguirá observando qué contexto y qué acciones coinciden.`
      : `Todavía hay pocos momentos parecidos para afirmar un patrón. Lo útil ahora es registrar qué haces y si realmente ayuda.`,
    confidence: isRepeated ? "Conexión posible" : "Lectura inicial",
    caution:
      checkIn.focus === "pain" && Number(checkIn.intensity) >= 7
        ? "Si el dolor limita tu día, empeora o se repite, merece atención y una conversación en consulta."
        : "Esta lectura organiza tus registros; no sustituye una evaluación médica.",
  };
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
