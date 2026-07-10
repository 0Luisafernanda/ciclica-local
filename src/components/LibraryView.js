const principles = [
  ["Incertidumbre visible", "Ciclica diferencia una observación inicial, una conexión posible y un patrón repetido. No convierte pocos datos en certeza."],
  ["Acciones, no consejos genéricos", "Las sugerencias dependen de lo que sientes, dónde estás, cuánto tiempo tienes y qué te ayudó antes."],
  ["Aprender qué ayuda", "Una acción solo se vuelve aprendizaje cuando respondes si ayudó bastante, un poco o nada."],
  ["IA opcional", "Ollama mantiene la inferencia local. OpenAI solo se usa si lo eliges explícitamente como excepción en la nube."],
  ["Datos bajo tu control", "Los registros permanecen en este dispositivo. Puedes exportarlos o borrarlos cuando quieras."],
];

export function LibraryView() {
  return `
    <section class="transparency-view" data-view-panel="library">
      <header class="editorial-header">
        <p class="eyebrow">Transparencia</p>
        <h2>Por qué Ciclica funciona así</h2>
        <p>Las decisiones del producto están aquí para que puedas entender qué hace con tus datos y qué no pretende saber.</p>
      </header>

      <div class="principle-list">
        ${principles
          .map(
            ([title, body], index) => `
          <article class="principle-line">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <div><h3>${title}</h3><p>${body}</p></div>
          </article>
        `,
          )
          .join("")}
      </div>
    </section>
  `;
}
