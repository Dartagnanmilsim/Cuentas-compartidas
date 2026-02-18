// =============================
// VARIABLES GLOBALES
// =============================

let proyectoActual = null
let esAdmin = false

let personas = {}
let ingresos = {}
let gastos = {}
let deudas = {}

const ADMIN_PASSWORD = "1234"

// =============================
// FORMATO MONEDA
// =============================

function moneda(valor) {
  return "$ " + Number(valor || 0).toLocaleString("es-CO")
}

// =============================
// COLORES PERSONAS
// =============================

const colores = [
  "#e74c3c",
  "#3498db",
  "#27ae60",
  "#9b59b6",
  "#f39c12",
  "#16a085"
]

// =============================
// ADMIN LOGIN
// =============================

function loginAdmin() {
  const clave = document.getElementById("adminPass").value

  if (clave === ADMIN_PASSWORD) {
    esAdmin = true
    document.getElementById("modoAdmin").innerText = "Modo 👑 Admin"
    renderTodo()
  } else {
    alert("Clave incorrecta")
  }
}

// =============================
// PROYECTOS
// =============================

function crearProyecto() {
  const nombre = document.getElementById("nuevoProyecto").value.trim()
  if (!nombre) return

  db.ref("proyectos/" + nombre).set({
    personas: {},
    ingresos: {},
    gastos: {},
    deudas: {}
  })

  proyectoActual = nombre
  cargarProyectos()
}

function eliminarProyecto() {
  if (!proyectoActual) return

  if (!confirm("Eliminar proyecto completo?")) return

  db.ref("proyectos/" + proyectoActual).remove()
  proyectoActual = null
  cargarProyectos()
}

function cargarProyectos() {
  db.ref("proyectos").on("value", snap => {
    const data = snap.val() || {}
    const select = document.getElementById("selectProyecto")

    select.innerHTML = ""

    Object.keys(data).forEach(p => {
      const op = document.createElement("option")
      op.value = p
      op.textContent = p
      select.appendChild(op)
    })

    if (!proyectoActual && Object.keys(data).length > 0) {
      proyectoActual = Object.keys(data)[0]
    }

    select.value = proyectoActual || ""
    cargarDatosProyecto()
  })
}

function cambiarProyecto() {
  proyectoActual = document.getElementById("selectProyecto").value
  cargarDatosProyecto()
}

// =============================
// CARGAR DATOS FIREBASE
// =============================

function cargarDatosProyecto() {
  if (!proyectoActual) return

  db.ref("proyectos/" + proyectoActual).on("value", snap => {
    const data = snap.val() || {}

    personas = data.personas || {}
    ingresos = data.ingresos || {}
    gastos = data.gastos || {}
    deudas = data.deudas || {}

    renderTodo()

    // 🔥 CORRECCIÓN IMPORTANTE
    cargarSelectPersonas()
  })
}

// =============================
// PERSONAS
// =============================

function agregarPersona() {
  const nombre = document.getElementById("nombrePersona").value.trim()
  if (!nombre) return

  const color = colores[Object.keys(personas).length % colores.length]

  db.ref(`proyectos/${proyectoActual}/personas/${nombre}`).set({
    color
  })

  document.getElementById("nombrePersona").value = ""
}

function eliminarPersona(nombre) {
  if (!esAdmin) return

  if (!confirm("Eliminar integrante?")) return

  db.ref(`proyectos/${proyectoActual}/personas/${nombre}`).remove()
}

// =============================
// SELECT PERSONAS
// =============================

function cargarSelectPersonas() {
  const select = document.getElementById("selectPersona")

  if (!select) return

  select.innerHTML = ""

  Object.keys(personas).forEach(p => {
    const op = document.createElement("option")
    op.value = p
    op.textContent = p
    select.appendChild(op)
  })
}

// =============================
// INGRESOS
// =============================

function agregarIngreso() {
  const persona = document.getElementById("selectPersona").value
  const monto = Number(document.getElementById("montoIngreso").value)

  if (!persona || !monto) return

  const id = Date.now()

  db.ref(`proyectos/${proyectoActual}/ingresos/${id}`).set({
    persona,
    monto,
    fecha: new Date().toLocaleDateString()
  })

  document.getElementById("montoIngreso").value = ""
}

function eliminarIngreso(id) {
  if (!esAdmin) return
  db.ref(`proyectos/${proyectoActual}/ingresos/${id}`).remove()
}

// =============================
// GASTOS
// =============================

function agregarGasto() {
  const concepto = document.getElementById("conceptoGasto").value
  const monto = Number(document.getElementById("montoGasto").value)

  if (!concepto || !monto) return

  const id = Date.now()

  db.ref(`proyectos/${proyectoActual}/gastos/${id}`).set({
    concepto,
    monto,
    fecha: new Date().toLocaleDateString()
  })

  document.getElementById("montoGasto").value = ""
}

function eliminarGasto(id) {
  if (!esAdmin) return
  db.ref(`proyectos/${proyectoActual}/gastos/${id}`).remove()
}

// =============================
// DEUDAS
// =============================

function calcularDeudas() {
  const totalIngresos = Object.values(ingresos).reduce((a, b) => a + Number(b.monto || 0), 0)
  const totalGastos = Object.values(gastos).reduce((a, b) => a + Number(b.monto || 0), 0)

  const personasLista = Object.keys(personas)
  const deudaPorPersona = totalGastos / (personasLista.length || 1)

  let resultado = {}

  personasLista.forEach(p => {
    const aportado = Object.values(ingresos)
      .filter(i => i.persona === p)
      .reduce((a, b) => a + Number(b.monto || 0), 0)

    resultado[p] = deudaPorPersona - aportado
  })

  deudas = resultado
}

// =============================
// RENDER
// =============================

function renderTodo() {
  renderPersonas()
  renderIngresos()
  renderGastos()
  renderRanking()
  renderDeudas()
}

// =============================
// PERSONAS UI
// =============================

function renderPersonas() {
  const cont = document.getElementById("listaPersonas")
  if (!cont) return

  cont.innerHTML = ""

  Object.keys(personas).forEach(p => {
    const div = document.createElement("div")
    div.className = "personaItem"

    const color = personas[p].color || "#000"

    div.innerHTML = `
      <span style="color:${color};font-weight:bold">${p}</span>
      ${esAdmin ? `<button onclick="eliminarPersona('${p}')">X</button>` : ""}
    `

    cont.appendChild(div)
  })
}

// =============================
// INGRESOS UI
// =============================

function renderIngresos() {
  const cont = document.getElementById("listaIngresos")
  if (!cont) return

  cont.innerHTML = ""

  let total = 0

  Object.entries(ingresos).forEach(([id, i]) => {
    total += Number(i.monto)

    const color = personas[i.persona]?.color || "#000"

    const div = document.createElement("div")
    div.className = "itemFila"

    div.innerHTML = `
      <span style="color:${color}">${i.persona}</span>
      <span>${moneda(i.monto)}</span>
      ${esAdmin ? `<button onclick="eliminarIngreso('${id}')">X</button>` : ""}
    `

    cont.appendChild(div)
  })

  document.getElementById("totalIngresos").innerText = moneda(total)
}

// =============================
// GASTOS UI
// =============================

function renderGastos() {
  const cont = document.getElementById("listaGastos")
  if (!cont) return

  cont.innerHTML = ""

  let total = 0

  Object.entries(gastos).forEach(([id, g]) => {
    total += Number(g.monto)

    const div = document.createElement("div")
    div.className = "itemFila"

    div.innerHTML = `
      <span>${g.concepto}</span>
      <span>${moneda(g.monto)}</span>
      ${esAdmin ? `<button onclick="eliminarGasto('${id}')">X</button>` : ""}
    `

    cont.appendChild(div)
  })

  document.getElementById("totalGastos").innerText = moneda(total)

  calcularDeudas()
}

// =============================
// RANKING
// =============================

function renderRanking() {
  const cont = document.getElementById("ranking")
  if (!cont) return

  cont.innerHTML = ""

  let ranking = {}

  Object.values(ingresos).forEach(i => {
    ranking[i.persona] = (ranking[i.persona] || 0) + Number(i.monto)
  })

  const orden = Object.entries(ranking).sort((a, b) => b[1] - a[1])

  orden.forEach(([persona, total]) => {
    const color = personas[persona]?.color || "#000"

    const div = document.createElement("div")
    div.innerHTML = `
      <span style="color:${color};font-weight:bold">${persona}</span>
      <span>${moneda(total)}</span>
    `
    cont.appendChild(div)
  })
}

// =============================
// DEUDAS UI
// =============================

function renderDeudas() {
  const cont = document.getElementById("listaDeudas")
  if (!cont) return

  cont.innerHTML = ""

  Object.entries(deudas).forEach(([p, valor]) => {
    const color = personas[p]?.color || "#000"

    const div = document.createElement("div")

    div.innerHTML = `
      <span style="color:${color}">${p}</span>
      <span>${moneda(valor)}</span>
    `

    cont.appendChild(div)
  })
}

// =============================
// WHATSAPP
// =============================

function enviarWhatsApp() {
  let mensaje = `🍻 *Gastos del Parche*\n\n`

  mensaje += `💰 Ingresos:\n`
  Object.values(ingresos).forEach(i => {
    mensaje += `• ${i.persona}: ${moneda(i.monto)}\n`
  })

  mensaje += `\n💸 Gastos:\n`
  Object.values(gastos).forEach(g => {
    mensaje += `• ${g.concepto}: ${moneda(g.monto)}\n`
  })

  mensaje += `\n⚖️ Balance:\n`
  Object.entries(deudas).forEach(([p, v]) => {
    mensaje += `• ${p}: ${moneda(v)}\n`
  })

  const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`
  window.open(url, "_blank")
}

// =============================
// INIT
// =============================

window.onload = () => {
  cargarProyectos()
}
