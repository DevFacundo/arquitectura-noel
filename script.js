/* ==========================================================================
   noel · formulario de consulta
   ========================================================================== */

/* ---------- CONFIGURACIÓN (lo único que normalmente se edita) ---------- */

// Si FORM_ENDPOINT vuelve a valer "TU_ENDPOINT_AQUI", el formulario funciona en modo demo
// (no envía nada y muestra los datos en la consola).
const FORM_ENDPOINT = "https://api.web3forms.com/submit";

// Campos fijos que exige el servicio. Web3Forms necesita access_key.
const EXTRA_FIELDS = {
  access_key: "049d6f68-b106-469a-b9b8-25eb391849f6", // clave provisoria: reemplazar por la del mail definitivo
};

const REGULARIZATION = "Regularización de planos";

// Opciones de cada pregunta. Para cambiar rangos de inversión, plazos o espacios, editar acá.
const OPTIONS = {
  como_llego: { type: "radio", values: ["Instagram", "Google", "Recomendación", "Ya soy cliente", "Otro"] },
  tipo_proyecto: { type: "radio", values: ["Obra nueva", "Reforma", "Ampliación", REGULARIZATION] },
  // Paso 3
  terreno: { type: "radio", values: ["Sí", "No", "Estoy buscando"] },
  mensura: { type: "radio", values: ["Sí", "No", "No sé"] },
  zona_terreno: { type: "radio", values: ["Zona urbana", "Barrio cerrado", "Zona rural o campo", "Todavía no lo sé"] },
  reforma_tipo: { type: "radio", values: ["Reforma integral", "Reforma parcial", "Redistribución de espacios", "Otro"] },
  planos_aprobados: { type: "radio", values: ["Sí", "No", "No sé"] },
  habitada: { type: "radio", values: ["Sí", "No", "Todavía no lo sé"] },
  planos_previos: { type: "radio", values: ["Sí, aprobados", "Sí, pero no aprobados", "No tengo", "No sé"] },
  construido_sin_declarar: {
    type: "checkbox",
    values: ["Ampliación de ambientes", "Quincho o galería", "Piscina", "Cambios de distribución", "Todavía no lo sé", "Otro"],
  },
  notificacion: { type: "radio", values: ["Sí", "No"] },
  // Paso 4 (solo Obra nueva)
  espacios: {
    type: "checkbox",
    values: [
      "Living", "Comedor", "Cocina", "Dormitorio", "Suite", "Baño", "Lavadero",
      "Escritorio", "Quincho", "Galería", "Patio", "Garage", "Piscina", "Otro",
    ],
  },
  // Paso 5
  presupuesto: {
    type: "radio",
    values: [
      "Todavía no lo definí",
      "Hasta USD 10.000",
      "USD 10.000 – 20.000",
      "USD 20.000 – 30.000",
      "Más de USD 30.000",
      "Prefiero conversarlo personalmente",
    ],
  },
  plazo: {
    type: "radio",
    values: ["Lo antes posible", "Dentro de 3 meses", "Dentro de 6 meses", "Dentro de 1 año", "Todavía no lo sé"],
  },
};

/* ---------- Ambientes y trabajos (paso 4: Reforma y Ampliación) ----------
   Cada trabajo indica el oficio que normalmente lo ejecuta. Con eso se arma
   "Oficios involucrados (estimado)" en el email. Para sumar un trabajo: agregarlo
   en WORKS y referenciarlo desde un grupo o desde los "extras" de un ambiente. */

const UNDECIDED = "Todavía no lo sé";
const DISTRIBUTION_OPTIONS = ["Sí", "No", "A evaluar"];
// Si cambia la distribución, casi siempre hay que demoler y levantar paredes
const DISTRIBUTION_TRADE = "Albañil";

const WORKS = {
  pisos: { label: "Pisos", trade: "Colocador" },
  solado_exterior: { label: "Pisos exteriores", trade: "Colocador" },
  revestimientos: { label: "Revestimientos de paredes", trade: "Colocador" },
  revoques: { label: "Arreglo o renovación de paredes", trade: "Albañil" },
  cielorraso: { label: "Cielorraso", trade: "Yesero / Durlock" },
  pintura: { label: "Pintura", trade: "Pintor" },
  techo: { label: "Techo o impermeabilización", trade: "Techista" },
  construccion_nueva: { label: "Construcción nueva de este ambiente", trade: "Albañil", only: "Ampliación" },
  electrica: { label: "Instalación eléctrica", trade: "Electricista" },
  iluminacion: { label: "Iluminación", trade: "Electricista" },
  sanitaria: { label: "Instalación de agua y desagües", trade: "Plomero" },
  gas: { label: "Instalación de gas", trade: "Gasista matriculado" },
  climatizacion: { label: "Calefacción o aire acondicionado", trade: "Instalador de climatización" },
  aberturas: { label: "Puertas y ventanas", trade: "Herrero / aberturas" },
  cerramientos: { label: "Portones y cerramientos", trade: "Herrero / aberturas" },
  mobiliario: { label: "Muebles a medida", trade: "Carpintero" },
  mesada: { label: "Mesada y bacha", trade: "Marmolero" },
  sanitarios: { label: "Sanitarios y grifería", trade: "Plomero" },
  mampara: { label: "Mampara de ducha", trade: "Vidriero" },
  parquizacion: { label: "Parquización o jardín", trade: "Paisajista" },
  pergola: { label: "Pérgola o deck", trade: "Carpintero" },
  pileta: { label: "Construcción o reforma de la pileta", trade: "Piletero" },
  parrilla: { label: "Parrilla u horno", trade: "Albañil" },
};

const INTERIOR_GROUPS = [
  { title: "Albañilería y terminaciones", works: ["pisos", "revestimientos", "revoques", "cielorraso", "pintura", "techo", "construccion_nueva"] },
  { title: "Instalaciones", works: ["electrica", "iluminacion", "sanitaria", "gas", "climatizacion"] },
  { title: "Carpintería y aberturas", works: ["aberturas", "mobiliario"] },
];
const EXTERIOR_GROUPS = [
  { title: "Albañilería y terminaciones", works: ["solado_exterior", "revestimientos", "pintura", "techo", "construccion_nueva"] },
  { title: "Instalaciones", works: ["electrica", "iluminacion", "sanitaria", "gas"] },
  { title: "Carpintería y cerramientos", works: ["cerramientos", "mobiliario"] },
];

const ROOMS = [
  { id: "living", label: "Living" },
  { id: "comedor", label: "Comedor" },
  { id: "cocina", label: "Cocina", extras: ["mesada"] },
  { id: "dormitorio", label: "Dormitorio" },
  { id: "suite", label: "Suite", extras: ["sanitarios", "mampara"] },
  { id: "bano", label: "Baño", extras: ["sanitarios", "mampara"] },
  { id: "lavadero", label: "Lavadero" },
  { id: "escritorio", label: "Escritorio" },
  { id: "quincho", label: "Quincho", exterior: true, extras: ["parrilla"] },
  { id: "galeria", label: "Galería", exterior: true },
  { id: "patio", label: "Patio", exterior: true, extras: ["parquizacion", "pergola"] },
  { id: "garage", label: "Garage", exterior: true },
  { id: "piscina", label: "Piscina", exterior: true, extras: ["pileta"] },
  { id: "otro", label: "Otro" },
];

const TRADE_BY_LABEL = Object.fromEntries(Object.values(WORKS).map((work) => [work.label, work.trade]));

/* ---------- Etiquetas del email ----------
   Formspree/Web3Forms muestran estas claves tal cual. El orden de esta lista es el orden
   en que aparecen las respuestas. "ambientes" dispara además el detalle de cada ambiente. */

const EMAIL_LABELS = {
  nombre: "Nombre y apellido",
  email: "email",
  telefono: "Teléfono / WhatsApp",
  localidad: "Ciudad / localidad",
  como_llego: "¿Cómo llegó al estudio?",
  tipo_proyecto: "Tipo de proyecto",
  terreno: "¿Tiene terreno?",
  ubicacion: "Ubicación (dirección)",
  superficie_terreno: "Superficie del terreno",
  mensura: "¿Tiene plano de mensura o escritura?",
  zona_terreno: "Zona del terreno",
  reforma_tipo: "Tipo de reforma",
  superficie_existente: "Superficie existente",
  planos_aprobados: "¿Tiene planos aprobados?",
  antiguedad: "Antigüedad de la construcción",
  habitada: "¿Habitada durante la obra?",
  superficie_construida: "Superficie construida",
  planos_previos: "¿Tiene planos anteriores?",
  construido_sin_declarar: "Qué se construyó sin declarar",
  notificacion: "¿Recibió notificación municipal?",
  espacios: "Espacios que necesita",
  ambientes: "Ambientes seleccionados",
  importante: "Lo más importante para el cliente",
  referencias: "Referencias, estilo o ideas",
  presupuesto: "Rango de inversión",
  plazo: "Cuándo quiere comenzar",
  comentarios: "Información adicional",
};

/* ---------- Validación de los campos obligatorios ---------- */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RULES = {
  nombre: { required: "Ingresá tu nombre y apellido." },
  email: {
    required: "Ingresá tu email.",
    invalid: "El email no parece correcto. Ejemplo: nombre@correo.com",
    isValid: (value) => EMAIL_PATTERN.test(value),
  },
  telefono: {
    required: "Ingresá un teléfono o WhatsApp.",
    invalid: "Ingresá un teléfono válido, con código de área.",
    isValid: (value) => value.replace(/\D/g, "").length >= 8,
  },
  localidad: { required: "Ingresá tu ciudad o localidad." },
  tipo_proyecto: { required: "Elegí una opción para continuar." },
};

const TOTAL_STEPS = 7; // el paso 7 es el resumen; el 8 es la pantalla de gracias
const SUCCESS_STEP = TOTAL_STEPS + 1;
const ENDPOINT_PLACEHOLDER = "TU_ENDPOINT_AQUI";

/* ---------- Referencias al DOM ---------- */

const form = document.getElementById("projectForm");
const screens = [...document.querySelectorAll("[data-step]")];
const topbar = document.getElementById("topbar");
const progress = document.getElementById("progress");
const progressFill = document.getElementById("progressFill");
const stepCount = document.getElementById("stepCount");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const submitError = document.getElementById("submitError");
const summary = document.getElementById("summary");
const roomsContainer = document.getElementById("rooms");

let currentStep = 0;
let isSending = false;

/* ---------- Utilidades ---------- */

const splitList = (text) => (text ? text.split(", ") : []);

function getValue(name) {
  const control = form.elements[name];
  return control && control.value ? control.value.trim() : "";
}

// Devuelve { campo: "valor" } sin vacíos; las opciones múltiples se unen con coma.
// Los campos deshabilitados (ramas o ambientes no elegidos) no entran en FormData.
function collectData() {
  const data = {};
  new FormData(form).forEach((rawValue, key) => {
    const value = String(rawValue).trim();
    if (!value) return;
    data[key] = data[key] ? `${data[key]}, ${value}` : value;
  });
  return data;
}

/* ---------- Opciones ---------- */

function choiceMarkup(type, name, value, attributes = "") {
  return `
    <label class="choice"${attributes}>
      <input type="${type}" name="${name}" value="${value}">
      <span class="choice__mark" aria-hidden="true"></span>
      <span class="choice__text">${value}</span>
    </label>`;
}

function renderChoices() {
  document.querySelectorAll("[data-choice]").forEach((container) => {
    const name = container.dataset.choice;
    const { type, values } = OPTIONS[name];
    container.classList.toggle("choices--grid", type === "checkbox");
    container.innerHTML = values.map((value) => choiceMarkup(type, name, value)).join("");
  });
}

/* ---------- Ambientes desplegables ---------- */

function workMarkup(room, workId) {
  const work = WORKS[workId];
  const attributes = work.only ? ` data-only="${work.only}"` : "";
  return choiceMarkup("checkbox", `trabajos_${room.id}`, work.label, attributes);
}

function roomMarkup(room) {
  const groups = (room.exterior ? EXTERIOR_GROUPS : INTERIOR_GROUPS).slice();
  if (room.extras) groups.push({ title: `Específico de ${room.label.toLowerCase()}`, works: room.extras });

  const groupsMarkup = groups
    .map(
      (group) => `
        <fieldset class="room__group">
          <legend>${group.title}</legend>
          <div class="choices choices--grid">${group.works.map((id) => workMarkup(room, id)).join("")}</div>
        </fieldset>`
    )
    .join("");

  const notesLabel = room.id === "otro" ? "¿Qué ambiente es? Contanos más detalles" : "Observaciones de este ambiente (opcional)";

  return `
    <div class="room">
      ${choiceMarkup("checkbox", "ambientes", room.label)}
      <div class="room__detail" hidden>
        ${groupsMarkup}
        <div class="choices">${choiceMarkup("checkbox", `trabajos_${room.id}`, UNDECIDED)}</div>
        <fieldset class="room__group" style="margin-top:1.5rem">
          <legend>¿Cambiarían la distribución actual?</legend>
          <div class="choices">${DISTRIBUTION_OPTIONS.map((value) => choiceMarkup("radio", `distribucion_${room.id}`, value)).join("")}</div>
        </fieldset>
        <div class="field">
          <label class="label" for="obs-${room.id}">${notesLabel}</label>
          <textarea id="obs-${room.id}" name="obs_${room.id}" rows="2"></textarea>
        </div>
      </div>
    </div>`;
}

function renderRooms() {
  roomsContainer.innerHTML = ROOMS.map(roomMarkup).join("");
}

// Muestra el detalle de los ambientes marcados y deshabilita lo que no corresponde
function syncRooms() {
  const projectType = getValue("tipo_proyecto");
  const branchActive = !roomsContainer.closest("[data-branch]").hidden;

  document.querySelectorAll(".room").forEach((roomElement) => {
    const toggle = roomElement.querySelector("input[name=ambientes]");
    const detail = roomElement.querySelector(".room__detail");
    const isOpen = branchActive && toggle.checked;

    toggle.disabled = !branchActive;
    detail.hidden = !isOpen;
    detail.querySelectorAll("[data-only]").forEach((item) => (item.hidden = item.dataset.only !== projectType));
    detail.querySelectorAll("input, textarea").forEach((control) => {
      const restriction = control.closest("[data-only]");
      const isAllowed = !restriction || restriction.dataset.only === projectType;
      control.disabled = !isOpen || !isAllowed;
    });
  });
}

/* ---------- Lógica condicional ---------- */

// Cada [data-branch="A,B"] se muestra solo si el tipo de proyecto es A o B
function updateBranches() {
  const projectType = getValue("tipo_proyecto");
  document.querySelectorAll("[data-branch]").forEach((branch) => {
    const isActive = branch.dataset.branch.split(",").includes(projectType);
    branch.hidden = !isActive;
    // Los campos deshabilitados no viajan en el envío: así no se mezclan datos de otra rama
    branch.querySelectorAll("input, textarea").forEach((control) => (control.disabled = !isActive));
  });
  syncRooms();
}

// Pasos que recorre la persona. Regularización no tiene el paso 4.
function getSteps() {
  const steps = [1, 2, 3, 4, 5, 6, 7];
  return getValue("tipo_proyecto") === REGULARIZATION ? steps.filter((step) => step !== 4) : steps;
}

/* ---------- Validación ---------- */

function getFieldWrapper(name) {
  return form.querySelector(`[data-field="${name}"]`);
}

function setError(name, message) {
  const wrapper = getFieldWrapper(name);
  const errorElement = document.getElementById(`${name}-error`);
  wrapper.classList.toggle("has-error", Boolean(message));
  errorElement.hidden = !message;
  errorElement.textContent = message;
  wrapper.querySelectorAll("input:not([type=radio])").forEach((input) => {
    input.setAttribute("aria-invalid", message ? "true" : "false");
  });
}

function validateField(name) {
  const rule = RULES[name];
  const value = getValue(name);
  let message = "";
  if (!value) message = rule.required;
  else if (rule.isValid && !rule.isValid(value)) message = rule.invalid;
  setError(name, message);
  return !message;
}

// Valida los campos obligatorios del paso y enfoca el primero con error
function validateStep(step) {
  const screen = screens.find((s) => Number(s.dataset.step) === step);
  const names = [...screen.querySelectorAll("[data-field]")]
    .map((wrapper) => wrapper.dataset.field)
    .filter((name) => RULES[name]);

  const invalidNames = names.filter((name) => !validateField(name));
  if (invalidNames.length) {
    getFieldWrapper(invalidNames[0]).querySelector("input").focus();
  }
  return invalidNames.length === 0;
}

/* ---------- Navegación ---------- */

function goTo(step) {
  currentStep = step;
  const isFormStep = step >= 1 && step <= TOTAL_STEPS;

  screens.forEach((screen) => (screen.hidden = Number(screen.dataset.step) !== step));
  form.hidden = !isFormStep;
  topbar.hidden = !isFormStep;
  progress.hidden = !isFormStep;

  if (isFormStep) {
    const steps = getSteps();
    const position = steps.indexOf(step) + 1;
    stepCount.textContent = `Paso ${position} de ${steps.length}`;
    progress.setAttribute("aria-valuemax", steps.length);
    progress.setAttribute("aria-valuenow", position);
    progressFill.style.width = `${(position / steps.length) * 100}%`;
    nextBtn.textContent = step === TOTAL_STEPS ? "Enviar consulta" : "Continuar";
    if (step === TOTAL_STEPS) renderSummary();
  }

  hideSubmitError();
  window.scrollTo(0, 0);
  screens.find((s) => Number(s.dataset.step) === step).querySelector(".title").focus({ preventScroll: true });
}

function goNext() {
  if (!validateStep(currentStep)) return;
  const steps = getSteps();
  goTo(steps[steps.indexOf(currentStep) + 1]);
}

function goBack() {
  const steps = getSteps();
  goTo(steps[steps.indexOf(currentStep) - 1] ?? 0);
}

/* ---------- Ambientes elegidos (resumen y email) ---------- */

function selectedRooms(data) {
  const chosen = splitList(data.ambientes);
  return ROOMS.filter((room) => chosen.includes(room.label));
}

// Oficios estimados según los trabajos marcados y si cambia la distribución
function collectTrades(data) {
  const trades = new Set();
  selectedRooms(data).forEach((room) => {
    splitList(data[`trabajos_${room.id}`]).forEach((label) => {
      if (TRADE_BY_LABEL[label]) trades.add(TRADE_BY_LABEL[label]);
    });
    if (["Sí", "A evaluar"].includes(data[`distribucion_${room.id}`])) trades.add(DISTRIBUTION_TRADE);
  });
  return [...trades].sort((a, b) => a.localeCompare(b, "es"));
}

// Una línea por dato y por ambiente: en el email se lee como una tabla ordenada
function buildRoomAnswers(data) {
  const answers = {};
  selectedRooms(data).forEach((room) => {
    answers[`${room.label}: trabajos`] = data[`trabajos_${room.id}`] || "Sin especificar";
    answers[`${room.label}: cambio de distribución`] = data[`distribucion_${room.id}`] || "Sin especificar";
    if (data[`obs_${room.id}`]) answers[`${room.label}: observaciones`] = data[`obs_${room.id}`];
  });
  const trades = collectTrades(data);
  if (trades.length) answers["Oficios involucrados (estimado)"] = trades.join(", ");
  return answers;
}

/* ---------- Resumen (paso 7) ---------- */

const PROJECT_SUMMARY_FIELDS = {
  "Obra nueva": [["Terreno", "terreno"], ["Ubicación", "ubicacion"], ["Superficie", "superficie_terreno"]],
  Reforma: [["Tipo", "reforma_tipo"], ["Ubicación", "ubicacion"], ["Superficie existente", "superficie_existente"]],
  Ampliación: [["Ubicación", "ubicacion"], ["Superficie existente", "superficie_existente"]],
  [REGULARIZATION]: [["Ubicación", "ubicacion"], ["Superficie construida", "superficie_construida"]],
};

function describeProject(data) {
  return (PROJECT_SUMMARY_FIELDS[data.tipo_proyecto] || [])
    .filter(([, key]) => data[key])
    .map(([label, key]) => `${label}: ${data[key]}`)
    .join(". ");
}

function describeSpaces(data) {
  if (data.tipo_proyecto === "Obra nueva") return data.espacios;
  return selectedRooms(data)
    .map((room) => {
      const count = splitList(data[`trabajos_${room.id}`]).filter((work) => work !== UNDECIDED).length;
      return count ? `${room.label} (${count} ${count === 1 ? "trabajo" : "trabajos"})` : room.label;
    })
    .join(", ");
}

function renderSummary() {
  const data = collectData();
  const rows = [
    ["Nombre", data.nombre, 1],
    ["Contacto", [data.email, data.telefono].filter(Boolean).join(" / "), 1],
    ["Localidad", data.localidad, 1],
    ["Tipo de proyecto", data.tipo_proyecto, 2],
    ["Proyecto", describeProject(data), 3],
  ];
  if (getSteps().includes(4)) {
    rows.push([data.tipo_proyecto === "Obra nueva" ? "Espacios" : "Ambientes", describeSpaces(data), 4]);
  }
  rows.push(["Presupuesto", data.presupuesto, 5], ["Plazo", data.plazo, 5]);

  summary.replaceChildren();
  rows.forEach(([label, value, step]) => {
    const row = document.createElement("div");
    row.className = "summary__row";

    const term = document.createElement("dt");
    term.textContent = label;

    const detail = document.createElement("dd");
    detail.textContent = value || "Sin completar";

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "btn-text summary__edit";
    edit.textContent = "Editar";
    edit.dataset.goto = step;
    edit.setAttribute("aria-label", `Editar ${label.toLowerCase()}`);

    row.append(term, detail, edit);
    summary.append(row);
  });
}

/* ---------- Envío ---------- */

function setSending(sending) {
  isSending = sending;
  nextBtn.disabled = sending;
  backBtn.disabled = sending;
  nextBtn.classList.toggle("is-loading", sending);
  nextBtn.setAttribute("aria-busy", sending);
  nextBtn.textContent = sending ? "Enviando" : "Enviar consulta";
}

function showSubmitError() {
  submitError.hidden = false;
}

function hideSubmitError() {
  submitError.hidden = true;
}

// Arma el payload con etiquetas legibles; el email muestra una fila por respuesta
function buildPayload(data) {
  const subject = `Nueva consulta: ${data.nombre} (${data.tipo_proyecto})`;
  const answers = {};
  Object.entries(EMAIL_LABELS).forEach(([key, label]) => {
    if (!data[key]) return;
    answers[label] = data[key];
    if (key === "ambientes") Object.assign(answers, buildRoomAnswers(data));
  });
  // "subject" y "from_name" son campos reservados de Web3Forms
  return { ...EXTRA_FIELDS, subject, from_name: data.nombre, ...answers };
}

async function postPayload(payload) {
  if (FORM_ENDPOINT === ENDPOINT_PLACEHOLDER) {
    console.info("[Modo demo] FORM_ENDPOINT sin configurar. Datos que se enviarían:", payload);
    await new Promise((resolve) => setTimeout(resolve, 900));
    return;
  }

  const response = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) {
    throw new Error(`Error al enviar (${response.status})`);
  }
}

async function submitForm() {
  const { _gotcha: honeypot, ...data } = collectData();

  // Si el campo trampa tiene contenido es un bot: simulamos éxito sin enviar
  if (honeypot) {
    goTo(SUCCESS_STEP);
    return;
  }

  setSending(true);
  hideSubmitError();
  try {
    await postPayload(buildPayload(data));
    form.reset();
    updateBranches();
    goTo(SUCCESS_STEP);
  } catch (error) {
    console.error(error);
    showSubmitError();
  } finally {
    setSending(false);
  }
}

/* ---------- Eventos ---------- */

function bindEvents() {
  document.getElementById("startBtn").addEventListener("click", () => goTo(1));
  backBtn.addEventListener("click", goBack);

  // Enter dentro de un campo o clic en "Continuar" pasan por acá
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (isSending) return;
    if (currentStep < TOTAL_STEPS) goNext();
    else submitForm();
  });

  form.addEventListener("input", (event) => {
    const { name } = event.target;
    if (RULES[name] && getFieldWrapper(name)?.classList.contains("has-error")) setError(name, "");
    if (name === "tipo_proyecto") updateBranches();
    if (name === "ambientes") syncRooms();
  });

  // Botones "Editar" del resumen
  summary.addEventListener("click", (event) => {
    const button = event.target.closest("[data-goto]");
    if (button) goTo(Number(button.dataset.goto));
  });
}

/* ---------- Inicio ---------- */

renderChoices();
renderRooms();
updateBranches();
bindEvents();
goTo(0);
