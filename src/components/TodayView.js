import { getInsight } from "../domain/cycle.js";
import { toISODate } from "../domain/date.js";
import { escapeHTML } from "../utils/html.js";

export function TodayView(state) {
  const date = toISODate(new Date());
  const entry = state.entries[date] || {};
  const insight = getInsight(state, date);
  return `
    <section class="view ${state.activeView === "today" || !state.activeView ? "is-visible" : ""}" data-view-panel="today">
      <div class="section-head compact">
        <div>
          <p class="eyebrow">Daily capture</p>
          <h3>Log only what matters.</h3>
        </div>
        <button class="button secondary" data-action="profile" type="button">Profile</button>
      </div>

      <div class="daily-layout">
        <form class="panel log-panel" id="dailyForm">
          <div class="form-grid">
            <label class="field date-field">
              <span>Date</span>
              <input name="entryDate" type="date" value="${date}" required />
            </label>

            <fieldset class="compact-choice bleeding-choice">
              <legend>Bleeding</legend>
              ${radio("bleeding", "none", "None", entry.bleeding || "none")}
              ${radio("bleeding", "light", "Light", entry.bleeding)}
              ${radio("bleeding", "medium", "Medium", entry.bleeding)}
              ${radio("bleeding", "heavy", "Heavy", entry.bleeding)}
            </fieldset>
          </div>

          <div class="vital-table" aria-label="Sintomas cuantificados">
            ${range("pain", "Pain", entry.pain ?? 0)}
            ${range("energy", "Energy", entry.energy ?? 6)}
            ${range("sleep", "Sleep", entry.sleep ?? 7)}
          </div>

          <fieldset class="compact-choice mood-choice">
            <legend>Mood</legend>
            ${radio("mood", "calm", "Calm", entry.mood || "calm")}
            ${radio("mood", "sensitive", "Sensitive", entry.mood)}
            ${radio("mood", "irritable", "Irritable", entry.mood)}
            ${radio("mood", "anxious", "Anxious", entry.mood)}
            ${radio("mood", "sad", "Sad", entry.mood)}
          </fieldset>

          <label class="field note-field">
            <span>Private note</span>
            <textarea name="note" rows="4" placeholder="Example: low patience after lunch, strong cravings, slept poorly...">${escapeHTML(entry.note || "")}</textarea>
          </label>

          <div class="form-footer">
            <p>Saved in this browser only.</p>
            <button class="button primary" type="submit">Save local entry</button>
          </div>
        </form>

        <aside class="panel protocol-panel">
          <div class="protocol-header">
            <p class="eyebrow">Local interpretation</p>
            <span>Draft</span>
          </div>
          <h3>${insight.title}</h3>
          <p>${insight.body}</p>
          <ol>${insight.actions.map((action) => `<li>${action}</li>`).join("")}</ol>
        </aside>
      </div>
    </section>
  `;
}

function radio(name, value, label, selected) {
  return `<label><input type="radio" name="${name}" value="${value}" ${selected === value ? "checked" : ""} /> <span>${label}</span></label>`;
}

function range(name, label, value) {
  return `<label class="vital-row"><span>${label}</span><input name="${name}" type="range" min="0" max="10" value="${value}" /><strong data-output="${name}">${value}</strong></label>`;
}
