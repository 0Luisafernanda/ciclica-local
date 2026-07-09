const updates = [
  {
    status: "Aplicado",
    title: "SOMP/SOP nomenclatura dual",
    scope: "Lenguaje + frontera de precisión",
    behavior: "Mostramos SOMP y SOP juntos y evitamos diagnósticos cerrados.",
    review: "Pendiente evidencia clínico-popular local por región.",
  },
  {
    status: "Bloqueado",
    title: "Pronóstico hormonal fijo",
    scope: "Modelado de fase sin registro suficiente",
    behavior: "No mostramos fechas exactas sin base sólida de datos.",
    review: "Regla de seguridad activa.",
  },
  {
    status: "Plan",
    title: "Prioridad PMDD",
    scope: "Animo + fase lútea",
    behavior: "Añadiremos seguimiento de interferencia funcional por ventana.",
    review: "Diseño de copy pendiente.",
  },
  {
    status: "Plan",
    title: "Alertas de dolor persistente",
    scope: "Dolor alto y contexto clínico",
    behavior: "Derivar a nota médica si hay repetición de dolor limitante.",
    review: "Pendiente textos de seguridad.",
  },
  {
    status: "Aplicado",
    title: "IA opcional: Ollama u OpenAI",
    scope: "Configuracion en el icono ◈ del header",
    behavior: "Apagada por defecto. Ollama corre en tu maquina y no sale de tu red. OpenAI es la unica excepcion real a 'sin nube': tus registros viajan a un tercero si lo elegis a proposito.",
    review: "El intento anterior (modelo on-device en el navegador, WebGPU) quedo descartado: inconsistente o crasheaba. Este camino usa un proveedor real en vez de forzar un modelo chico en el navegador.",
  },
];

export function LibraryView() {
  return `
    <section class="view is-visible" data-view-panel="library">
      <div class="panel library-head">
        <div>
          <p class="micro-label">Transparencia</p>
          <h3>Por qué Ciclica funciona así</h3>
          <p>Solo se cambian reglas cuando hay razón y seguridad de uso.</p>
        </div>
      </div>

      <section class="library-grid">
        ${updates
          .map(
            (item) => `
          <article class="update-card">
            <span class="pill-status">${item.status}</span>
            <h4>${item.title}</h4>
            <p class="scope">${item.scope}</p>
            <p>${item.behavior}</p>
            <small>${item.review}</small>
          </article>
        `,
          )
          .join("")}
      </section>
    </section>
  `;
}
