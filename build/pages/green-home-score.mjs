// Green Home Score & Retrofit Engine — Megathon X, Team 37.
// Every number here comes from the repo's docs/ and reports/.

import { html } from "../lib/html.mjs";
import { intro, shutterImg, sec, field, codePane, prose, points, decisions, stack, table, fig } from "../lib/parts.mjs";

export default function ({ root, project }) {
  const body = html`
${intro({
  project,
  kicker: "Megathon X, Team 37, Oct 2026",
  lede: "A UK home gets a 0 to 100 score, a ranked list of retrofits and an estimate of what each would save. The models are trained on 2.9 million real energy certificates, and a language model explains the result without ever producing a number of its own.",
  meta: [
    ["Context", "Megathon X: Singularity, problem statement 2, set by Lloyds"],
    ["Team", "Team 37. The work was split into five parts: data, engine, models, LLM and product."],
    ["Built with", "Python, LightGBM, FastAPI, React, gpt-oss-120b on Groq"],
  ],
  visual: shutterImg({
    root, src: "green-home/architecture.webp", w: 2300, h: 1200,
    alt: "Architecture diagram in five columns: data foundation, models, core engine, LLM layer and product, connected by labelled arrows.",
    caption: "The architecture from the repo: public data feeds four model groups, the engine computes every number, the LLM layer only explains them, and a number checker sits between the LLM and the screen.",
  }),
})}

${sec({ title: "The problem", body: html`
  ${prose(
    "Lloyds asked for a way to tell a homeowner how green their home is and what to do about it. That needs three things a single model can't give honestly: a score people can audit, predictions of what each change would save, and a plain-language explanation.",
    "The team's answer splits those jobs apart. The score is arithmetic with published weights, so it can be checked by hand. The predictions come from models trained on real certificates and sales. The explanation comes from a language model that is handed the computed facts and checked against them before anything reaches the screen."
  )}
` })}

${sec({ title: "A score you can check", body: html`
  <div class="p-split">
    <div>
      ${prose(
        "The Green Home Score is a fixed weighted sum of seven sub-scores: energy efficiency 25%, consumption intensity 20%, insulation 15%, heating 15%, glazing 10%, renewables 10% and smart controls 5%. The problem statement set the weights, so the team didn't tune them. No model and no LLM computes the score.",
        "Consumption intensity is a straight line between the 5th and 95th percentile of the training homes, 85 and 230 kWh per square metre a year. When an owner doesn't know an answer, the engine doesn't guess. It tries every possible value of each unknown field and reports the score as a range."
      )}
      <div class="lab" data-lab="intensity" data-reveal>
        <div class="lab-row"><label for="intensity">Energy use per m² a year</label></div>
        <div class="lab-row"><input id="intensity" type="range" min="40" max="300" step="1" value="160"><output class="lab-out" for="intensity" data-lab-out>160 kWh/m² gives a sub-score of <b>48.3</b></output></div>
        <p class="small muted" style="margin-top:12px">Runs the same formula as <span class="mono">_intensity_sub_score</span>, with the repo's bounds.</p>
      </div>
    </div>
    ${codePane({ file: "greenhome/core/score.py", name: "green-intensity.py", start: 77, note: "The intensity sub-score: a clipped line between the train-split bounds." })}
  </div>
  ${codePane({ file: "greenhome/core/score.py", name: "green-ranges.py", start: 130, note: "Unknown answers become a range by exact enumeration over every value they could take, with the imputed rating allowed to move one band either way." })}
` })}

${sec({ title: "Four models, one feature builder", body: html`
  ${table({
    caption: "Trained with LightGBM. One feature builder, greenhome.ml.features, serves both training and inference.",
    head: ["Model", "Predicts", "Trained on", "Files"],
    rows: [
      ["M4 rating", "SAP rating and band", "2.89 million real EPC certificates", "1"],
      ["M1 energy", "Energy after a retrofit package, per fuel", "305,000 simulated home and package outcomes", "2"],
      ["M2 recommender", "Whether an assessor would suggest each of 7 retrofits", "9.4 million real assessor labels", "7"],
      ["M3 value", "Sale price range", "618,000 real Land Registry sales, 20-member ensemble", "20"],
    ],
    num: [3],
  })}
  ${points([
    "Monotone constraints keep the models physically sensible: better insulation can never lower the predicted rating, and no retrofit can raise predicted gas use.",
    "Altogether 30 files, 18,255 trees and about 61 MB, loaded once at start-up.",
    "The data pipeline streams the 98 GB national certificate archive one file at a time.",
  ])}
` })}

${sec({ title: "An LLM that can't invent numbers", body: html`
  <div class="p-split">
    <div>
      ${prose(
        "The language model only ever sees a fact sheet: numbers already computed by the engine, formatted exactly as the screens show them. Its reply goes through a checker that pulls out every number and matches it against the fact sheet, including whether a change goes up or down.",
        "If the check fails, the model gets one retry. If that fails too, or the model is unavailable, the page shows a template answer instead. Each answer has a 25 second budget, and the model is never on the critical path."
      )}
      ${table({
        caption: "80 test scenarios, gpt-oss-120b, reports/llm_eval.md",
        head: ["Measure", "Result"],
        rows: [
          ["Numbers grounded in facts, first draft", "70.5%"],
          ["Numbers grounded in facts, answer shown", "100%"],
          ["Intent and scenario accuracy", "100%"],
          ["Median and p95 latency", "1.83 s, 3.63 s"],
        ],
        num: [1],
        best: 1,
      })}
    </div>
    ${codePane({ file: "greenhome/llm/checker.py", name: "green-checker.py", start: 370, note: "Every number in a reply must match a fact, and must move in the same direction." })}
  </div>
` })}

${field(html`
${sec({ title: "Results on held-out homes", body: html`
  ${table({
    caption: "Test split, against the repo's baselines (reports/evaluation.md)",
    head: ["Model", "Measure", "Model", "Baseline"],
    rows: [
      ["M4 rating", "Mean absolute error, SAP points", "4.68", "7.99"],
      ["M4 rating", "Within one band", "98.7%", ""],
      ["M1 energy", "Mean absolute error of net saving, kWh a year", "249.4", "415.2"],
      ["M1 energy", "Same, multi-retrofit packages", "286.0", "645.2"],
      ["M3 value", "Median absolute error of price", "15.7%", "18.5%"],
    ],
    num: [2, 3],
  })}
  ${table({
    caption: "M2 recommender: ROC AUC per retrofit, against recommending by popularity",
    head: ["Retrofit", "Model", "Popularity"],
    rows: [
      ["Loft insulation", "0.843", "0.561"],
      ["Cavity wall insulation", "0.736", "0.586"],
      ["Solid wall insulation", "0.755", "0.624"],
      ["Double glazing", "0.844", "0.523"],
      ["Air source heat pump", "0.995", "0.784"],
      ["Solar PV", "0.935", "0.592"],
      ["Smart thermostat", "0.968", "0.604"],
    ],
    num: [1, 2],
  })}
  <div class="figs">
    ${fig({ root, src: "green-home/retrofit-gain.webp", w: 1200, h: 512, alt: "Bar chart of observed median SAP gain from single-change repeat certificates.", caption: "What each retrofit really added on homes certified twice: solid wall insulation +11 SAP points, a heat pump +10, smart thermostats +4." })}
    ${fig({ root, src: "green-home/band-mix.webp", w: 1200, h: 512, alt: "Bar chart comparing EPC band mix of the sample with England and Wales.", caption: "The sample's band mix against the national picture: C and D dominate both." })}
    ${fig({ root, src: "green-home/calibration-gas.webp", w: 1200, h: 960, alt: "Dot plot of synthetic against real annual gas use by property type and age band.", caption: "Synthetic monthly energy calibrated to NEED: medians line up across property types and ages." })}
    ${fig({ root, src: "green-home/parse-coverage.webp", w: 1200, h: 544, alt: "Horizontal bars of how many certificates each parsed field covers.", caption: "Free-text certificate fields turned into categories: 99.9% of glazing descriptions, down to 89.9% for wall type." })}
  </div>
` })}
`)}

${sec({ title: "Decisions the repo explains", body: decisions([
  ["Simulated labels without circularity", "Energy savings aren't labelled anywhere, so the team simulated them. The simulator uses hidden household factors like thermostat setpoint and occupancy, so the model can't simply learn the simulator back.", "docs/MODELS.md"],
  ["Each fuel predicts its own target", "Normalising both fuels by combined energy leaked errors across them: loft insulation appeared to raise electricity use.", "docs/MODELS.md"],
  ["Value is associational, not causal", "The value model never sees fields a retrofit can change. When it did, it learned confounded premiums, like +10% for a package that left the band unchanged. Uplift is shown as indicative.", "docs/MODELS.md"],
  ["Heat pumps need recent certificates", "Assessment software only started recommending heat pumps in 2025, so the recommender for them trains on 2025 certificates only.", "docs/MODELS.md"],
  ["Savings that add up exactly", "Retrofits are applied as growing prefix packages, so each one's incremental saving sums to the package total. An assertion checks the drift.", "greenhome/core/orchestrator.py"],
]) })}

${sec({ title: "Where it falls short", body: html`
  ${points([
    "On ordering retrofits, recommending by popularity still wins: NDCG@3 of 0.874 against the model's 0.859, because assessors list measures in a fixed order. The model's strength is picking which homes need a measure.",
    "Against real NEED data, the model overstates gas savings from cavity wall insulation: 14.1% against an observed 8.4 to 9.2%.",
    "The sample covers 11 local authorities, is city-heavy, and covers England and Wales only.",
    "23% of repeat-certificate pairs were thrown out as inconsistent before training.",
  ])}
  ${codePane({ file: "greenhome/core/orchestrator.py", name: "green-telescope.py", start: 278, note: "Prefix packages make incremental savings telescope to the package total." })}
` })}

${sec({ title: "Built with", body: stack([
  ["Models and data", "LightGBM 4.7, scikit-learn, pandas, Polars, PyArrow"],
  ["Engine and API", "pydantic, FastAPI, Uvicorn, SQLite"],
  ["LLM", "gpt-oss-120b and 20b on Groq, Ollama offline"],
  ["Front end", "React 18 with htm, no build step"],
  ["Testing", "pytest, Hypothesis property tests, Ruff"],
]) })}
`;
  return { body, js: [], titleSuffix: "home energy scoring with LightGBM" };
}
