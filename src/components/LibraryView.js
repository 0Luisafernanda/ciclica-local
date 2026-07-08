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
    status: "Plan",
    title: "Lectura de notas con IA local",
    scope: "Modelo on-device para sintetizar notas propias",
    behavior: "Probado con transformers.js + WebGPU, 100% offline y verificado sin salida de datos.",
    review: "Modelo chico (0.5B) es inconsistente entre corridas; modelo mediano (1.5B) crashea en el navegador. Sin base confiable todavia para shippear.",
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
