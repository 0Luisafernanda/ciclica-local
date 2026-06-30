const updates = [
  {
    status: "Adopted",
    title: "SOMP/SOP terminology bridge",
    scope: "Language + prediction caution",
    behavior: "The app shows SOMP/SOP together and avoids assuming fixed ovulation for this profile.",
    review: "Needs source packet before public release",
  },
  {
    status: "Design rule",
    title: "No automatic diagnosis",
    scope: "Safety boundary",
    behavior: "Ciclica can flag patterns for consultation, but never confirms PCOS/SOMP, PMDD, endometriosis or pregnancy.",
    review: "Locked for MVP",
  },
  {
    status: "Planned",
    title: "PMDD / TDPM severity window",
    scope: "Mood + cycle timing",
    behavior: "Track symptom interference in the late luteal window and prepare a clinician-facing summary.",
    review: "Clinical copy pending",
  },
  {
    status: "Planned",
    title: "Endometriosis red flags",
    scope: "Pain, bleeding, sex, bowel, urinary symptoms",
    behavior: "Escalate repeated disabling pain into a consultation prompt instead of normalizing it.",
    review: "Clinical copy pending",
  },
  {
    status: "Principle",
    title: "Fertility prediction is not contraception",
    scope: "Ovulation windows",
    behavior: "Confidence labels stay visible; irregular cycles reduce certainty automatically.",
    review: "Locked for MVP",
  },
];

export function LibraryView(state) {
  return `
    <section class="view ${state.activeView === "library" ? "is-visible" : ""}" data-view-panel="library">
      <div class="section-head compact">
        <div>
          <p class="eyebrow">Clinical operating log</p>
          <h3>Every claim should change product behavior.</h3>
        </div>
        <span class="version-badge">Evidence v0.1</span>
      </div>

      <div class="evidence-ledger panel">
        <div class="ledger-row ledger-head">
          <span>Status</span>
          <span>Update</span>
          <span>Product behavior</span>
          <span>Review</span>
        </div>
        ${updates.map((item) => `
          <article class="ledger-row">
            <span class="status-token">${item.status}</span>
            <div>
              <h4>${item.title}</h4>
              <p>${item.scope}</p>
            </div>
            <p>${item.behavior}</p>
            <p>${item.review}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}
