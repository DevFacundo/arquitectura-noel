/* ==========================================================================
   noel · formulario de consulta
   ========================================================================== */

/* ---------- CONFIGURACIÓN (lo único que normalmente se edita) ---------- */

// Pegar acá la URL de Formspree / Web3Forms. Mientras diga "TU_ENDPOINT_AQUI"
// el formulario funciona en modo demo: no envía nada y muestra el payload en la consola.
const FORM_ENDPOINT = "https://api.web3forms.com/submit";

const EXTRA_FIELDS = {
  access_key: "049d6f68-b106-469a-b9b8-25eb391849f6",
};

// Opciones de cada pregunta. Para cambiar rangos de inversión, plazos o espacios, editar acá.
const OPTIONS = {
  como_llego: { type: "radio", values: ["Instagram", "Google", "Recomendación", "Ya soy cliente", "Otro"] },
  tipo_proyecto: { type: "radio", values: ["Obra nueva", "Reforma", "Ampliación"] },
  terreno: { type: "radio", values: ["Sí", "No", "Estoy buscando"] },
  reforma_tipo: { type: "radio", values: ["Reforma integral", "Reforma parcial", "Redistribución de espacios", "Otro"] },
  ampliacion_espacios: {
    type: "checkbox",
    values: ["Dormitorios", "Cocina", "Living / comedor", "Baños", "Galería", "Quincho", "Garage", "Otro"],
  },
  espacios: {
    type: "checkbox",
    values: [
      "Living", "Comedor", "Cocina", "Dormitorio", "Suite", "Baño", "Lavadero",
      "Escritorio", "Quincho", "Galería", "Patio", "Garage", "Piscina", "Otro",
    ],
  },
  presupuesto: {
    type: "radio",
    values: [
      "Todavía no lo definí",
      "Hasta USD 50.000",
      "USD 50.000 – 100.000",
      "USD 100.000 – 200.000",
      "Más de USD 200.000",
      "Prefiero conversarlo personalmente",
    ],
  },
  plazo: {
    type: "radio",
    values: ["Lo antes posible", "Dentro de 3 meses", "Dentro de 6 meses", "Dentro de 1 año", "Todavía no lo sé"],
  },
};

// Validaciones de los campos obligatorios
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

const TOTAL_STEPS = 7;
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

let currentStep = 0;
let isSending = false;

/* ---------- Opciones ---------- */

function renderChoices() {
  document.querySelectorAll("[data-choice]").forEach((container) => {
    const name = container.dataset.choice;
    const { type, values } = OPTIONS[name];
    container.classList.toggle("choices--grid", type === "checkbox");
    container.innerHTML = values
      .map(
        (value) => `
          <label class="choice">
            <input type="${type}" name="${name}" value="${value}">
            <span class="choice__mark" aria-hidden="true"></span>
            <span class="choice__text">${value}</span>
          </label>`
      )
      .join("");
  });
}

/* ---------- Lógica condicional (paso 3) ---------- */

function updateBranches() {
  const projectType = getValue("tipo_proyecto");
  document.querySelectorAll("[data-branch]").forEach((branch) => {
    const isActive = branch.dataset.branch === projectType;
    branch.hidden = !isActive;
    // Los campos deshabilitados no se incluyen en FormData, así no viajan datos de otra rama
    branch.querySelectorAll("input, textarea").forEach((control) => (control.disabled = !isActive));
  });
}

/* ---------- Lectura de datos ---------- */

function getValue(name) {
  const control = form.elements[name];
  return control && control.value ? control.value.trim() : "";
}

// Devuelve { campo: "valor" } sin vacíos; las opciones múltiples se unen con coma
function collectData() {
  const data = {};
  new FormData(form).forEach((rawValue, key) => {
    const value = String(rawValue).trim();
    if (!value) return;
    data[key] = data[key] ? `${data[key]}, ${value}` : value;
  });
  return data;
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
    stepCount.textContent = `Paso ${step} de ${TOTAL_STEPS}`;
    progress.setAttribute("aria-valuenow", step);
    progressFill.style.width = `${(step / TOTAL_STEPS) * 100}%`;
    nextBtn.textContent = step === TOTAL_STEPS ? "Enviar consulta" : "Continuar";
    if (step === TOTAL_STEPS) renderSummary();
  }

  hideSubmitError();
  window.scrollTo(0, 0);
  screens.find((s) => Number(s.dataset.step) === step).querySelector(".title").focus({ preventScroll: true });
}

function goNext() {
  if (!validateStep(currentStep)) return;
  goTo(currentStep + 1);
}

/* ---------- Resumen (paso 7) ---------- */

function describeProject(data) {
  const parts = {
    "Obra nueva": [["Terreno", data.terreno], ["Ubicación", data.ubicacion], ["Superficie", data.superficie]],
    Reforma: [["Tipo", data.reforma_tipo], ["Ubicación", data.ubicacion], ["Superficie existente", data.superficie]],
    Ampliación: [["Ampliar", data.ampliacion_espacios], ["Ubicación", data.ubicacion], ["Superficie existente", data.superficie]],
  }[data.tipo_proyecto] || [];

  return parts
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join(". ");
}

function renderSummary() {
  const data = collectData();
  const rows = [
    ["Nombre", data.nombre, 1],
    ["Contacto", [data.email, data.telefono].filter(Boolean).join(" / "), 1],
    ["Localidad", data.localidad, 1],
    ["Tipo de proyecto", data.tipo_proyecto, 2],
    ["Proyecto", describeProject(data), 3],
    ["Presupuesto", data.presupuesto, 5],
    ["Plazo", data.plazo, 5],
  ];

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

// Etiquetas legibles: Formspree y Web3Forms muestran estas claves tal cual en el email.
// El orden de esta lista es el orden en que aparecen las respuestas.
const EMAIL_LABELS = {
  nombre: "Nombre y apellido",
  email: "email",
  telefono: "Teléfono / WhatsApp",
  localidad: "Ciudad / localidad",
  como_llego: "¿Cómo llegó al estudio?",
  tipo_proyecto: "Tipo de proyecto",
  terreno: "¿Tiene terreno?",
  ubicacion: "Ubicación",
  superficie: "Superficie",
  reforma_tipo: "Tipo de reforma",
  ampliacion_espacios: "Qué quiere ampliar",
  espacios: "Espacios que necesita",
  importante: "Lo más importante para el cliente",
  referencias: "Referencias, estilo o ideas",
  presupuesto: "Rango de inversión",
  plazo: "Cuándo quiere comenzar",
  comentarios: "Información adicional",
};

function buildPayload(data) {
  const subject = `Nueva consulta: ${data.nombre} (${data.tipo_proyecto})`;
  const answers = {};
  Object.entries(EMAIL_LABELS).forEach(([key, label]) => {
    if (data[key]) answers[label] = data[key];
  });
  // "_subject"/"_replyto" los usa Formspree; "subject"/"from_name" los usa Web3Forms
  return { ...EXTRA_FIELDS, _subject: subject, subject, _replyto: data.email, from_name: data.nombre, ...answers };
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
    if (currentStep === TOTAL_STEPS) nextBtn.textContent = "Enviar consulta";
  }
}

/* ---------- Eventos ---------- */

function bindEvents() {
  document.getElementById("startBtn").addEventListener("click", () => goTo(1));
  backBtn.addEventListener("click", () => goTo(currentStep - 1));

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
  });

  // Botones "Editar" del resumen
  summary.addEventListener("click", (event) => {
    const button = event.target.closest("[data-goto]");
    if (button) goTo(Number(button.dataset.goto));
  });
}

/* ---------- Inicio ---------- */

renderChoices();
updateBranches();
bindEvents();
goTo(0);
