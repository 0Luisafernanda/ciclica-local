export function MoreView(state) {
  const entryCount = Object.keys(state.entries).length;

  return `
    <section class="view is-visible more-view" data-view-panel="more">
      <div class="more-head">
        <p class="micro-label">Explorar</p>
        <h2>Más de Ciclica</h2>
        <p class="more-hint">Lo que no hace falta ver todos los días, pero está siempre a mano.</p>
      </div>

      <div class="more-primary">
        <button class="more-row more-row-primary" data-action="view" data-view="patterns" type="button">
          <span class="more-row-icon" aria-hidden="true">▢</span>
          <span class="more-row-copy">
            <strong>Patrones</strong>
            <small>Mapa de 28 días · ${entryCount} registro${entryCount === 1 ? "" : "s"}</small>
          </span>
          <span class="more-row-arrow" aria-hidden="true">›</span>
        </button>
        <button class="more-row more-row-primary" data-action="view" data-view="consult" type="button">
          <span class="more-row-icon" aria-hidden="true">▣</span>
          <span class="more-row-copy">
            <strong>Consulta</strong>
            <small>Resumen listo para compartir</small>
          </span>
          <span class="more-row-arrow" aria-hidden="true">›</span>
        </button>
      </div>

      <button class="more-row more-row-quiet" data-action="view" data-view="library" type="button">
        <span>Transparencia — por qué Ciclica funciona así</span>
        <span class="more-row-arrow" aria-hidden="true">›</span>
      </button>
    </section>
  `;
}
