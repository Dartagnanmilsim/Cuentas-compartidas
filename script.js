let admin=false
let proyectoActual=null

const ADMIN_PASS="1234"

const colores=["#e74c3c","#3498db","#27ae60","#9b59b6","#f39c12"]

function formato(n){
return "$ "+Number(n||0).toLocaleString("es-CO")
}

function loginAdmin(){
let pass=document.getElementById("adminPass").value
if(pass===ADMIN_PASS){
admin=true
document.getElementById("modoAdmin").innerText="Modo 👑 Admin"
}else{
alert("Clave incorrecta")
}
}


// ---------- PROYECTOS ----------

function crearProyecto(){
let nombre=document.getElementById("nuevoProyecto").value
if(!nombre) return

db.collection("proyectos").doc(nombre).set({
integrantes:[],
ingresos:[],
gastos:[],
deudas:[]
})

proyectoActual=nombre
cargarProyectos()
}

function eliminarProyecto(){
if(!proyectoActual) return
db.collection("proyectos").doc(proyectoActual).delete()
proyectoActual=null
cargarProyectos()
}

function cargarProyectos(){

db.collection("proyectos").onSnapshot(snap=>{

let select=document.getElementById("selectProyecto")
select.innerHTML=""

snap.forEach(doc=>{
let op=document.createElement("option")
op.value=doc.id
op.textContent=doc.id
select.appendChild(op)
})

if(!proyectoActual && snap.docs.length>0){
proyectoActual=snap.docs[0].id
}

select.value=proyectoActual

cargarDatos()

})

}

document.getElementById("selectProyecto").onchange=e=>{
proyectoActual=e.target.value
cargarDatos()
}


// ---------- DATOS ----------

function cargarDatos(){

if(!proyectoActual) return

db.collection("proyectos").doc(proyectoActual)
.onSnapshot(doc=>{

let data=doc.data()||{}

renderTodo(data)

})

}


// ---------- RENDER ----------

function renderTodo(data){

renderIntegrantes(data.integrantes||[])
renderSelects(data.integrantes||[])
renderIngresos(data.ingresos||[])
renderGastos(data.gastos||[])
renderDeudas(data.deudas||[])
renderRanking(data.ingresos||[],data.integrantes||[])

}


// ---------- INTEGRANTES ----------

async function agregarIntegrante(){

if(!admin) return alert("Solo admin")

let nombre=document.getElementById("nombreIntegrante").value
if(!nombre) return

let doc=await db.collection("proyectos").doc(proyectoActual).get()
let data=doc.data()

let lista=data.integrantes||[]

lista.push({
nombre,
color:colores[lista.length%colores.length]
})

db.collection("proyectos").doc(proyectoActual).update({
integrantes:lista
})

document.getElementById("nombreIntegrante").value=""
}

function renderIntegrantes(lista){

let div=document.getElementById("listaIntegrantes")
div.innerHTML=""

lista.forEach((p,i)=>{

let row=document.createElement("div")
row.className="item"

row.innerHTML=`
<span style="color:${p.color};font-weight:bold">${p.nombre}</span>
${admin?`<div class="delete" onclick="eliminarIntegrante(${i})">x</div>`:""}
`

div.appendChild(row)

})

}

async function eliminarIntegrante(i){

if(!admin) return

let doc=await db.collection("proyectos").doc(proyectoActual).get()
let data=doc.data()

let lista=data.integrantes||[]

lista.splice(i,1)

db.collection("proyectos").doc(proyectoActual).update({
integrantes:lista
})

}


// ---------- SELECTS ----------

function renderSelects(lista){

let ids=["selectIngreso","selectGasto","deudor","acreedor"]

ids.forEach(id=>{

let s=document.getElementById(id)
s.innerHTML=""

lista.forEach(p=>{
let op=document.createElement("option")
op.value=p.nombre
op.textContent=p.nombre
s.appendChild(op)
})

})

}


// ---------- INGRESOS ----------

async function agregarIngreso(){

if(!admin) return

let persona=document.getElementById("selectIngreso").value
let monto=Number(document.getElementById("montoIngreso").value)

if(!persona||!monto) return

let doc=await db.collection("proyectos").doc(proyectoActual).get()
let data=doc.data()

let lista=data.ingresos||[]

lista.push({persona,monto})

db.collection("proyectos").doc(proyectoActual).update({
ingresos:lista
})

document.getElementById("montoIngreso").value=""
}

function renderIngresos(lista){

let div=document.getElementById("listaIngresos")
div.innerHTML=""

let total=0

lista.forEach((i,index)=>{

total+=i.monto

let row=document.createElement("div")
row.className="item"

row.innerHTML=`
<span>${i.persona}</span>
<span>${formato(i.monto)}</span>
${admin?`<div class="delete" onclick="eliminarIngreso(${index})">x</div>`:""}
`

div.appendChild(row)

})

document.getElementById("totalIngresos").innerText="Total: "+formato(total)

}

async function eliminarIngreso(i){

let doc=await db.collection("proyectos").doc(proyectoActual).get()
let data=doc.data()

let lista=data.ingresos||[]

lista.splice(i,1)

db.collection("proyectos").doc(proyectoActual).update({
ingresos:lista
})

}


// ---------- GASTOS ----------

async function agregarGasto(){

if(!admin) return

let persona=document.getElementById("selectGasto").value
let desc=document.getElementById("descGasto").value
let monto=Number(document.getElementById("montoGasto").value)

if(!persona||!monto) return

let doc=await db.collection("proyectos").doc(proyectoActual).get()
let data=doc.data()

let lista=data.gastos||[]

lista.push({persona,desc,monto})

db.collection("proyectos").doc(proyectoActual).update({
gastos:lista
})

document.getElementById("descGasto").value=""
document.getElementById("montoGasto").value=""
}

function renderGastos(lista){

let div=document.getElementById("listaGastos")
div.innerHTML=""

let total=0

lista.forEach((g,i)=>{

total+=g.monto

let row=document.createElement("div")
row.className="item"

row.innerHTML=`
<span>${g.desc}</span>
<span>${formato(g.monto)}</span>
${admin?`<div class="delete" onclick="eliminarGasto(${i})">x</div>`:""}
`

div.appendChild(row)

})

document.getElementById("totalGastos").innerText="Total: "+formato(total)

}

async function eliminarGasto(i){

let doc=await db.collection("proyectos").doc(proyectoActual).get()
let data=doc.data()

let lista=data.gastos||[]

lista.splice(i,1)

db.collection("proyectos").doc(proyectoActual).update({
gastos:lista
})

}


// ---------- DEUDAS ----------

async function agregarDeuda(){

if(!admin) return

let deudor=document.getElementById("deudor").value
let acreedor=document.getElementById("acreedor").value
let monto=Number(document.getElementById("montoDeuda").value)

let doc=await db.collection("proyectos").doc(proyectoActual).get()
let data=doc.data()

let lista=data.deudas||[]

lista.push({deudor,acreedor,monto})

db.collection("proyectos").doc(proyectoActual).update({
deudas:lista
})

}

function renderDeudas(lista){

let div=document.getElementById("listaDeudas")
div.innerHTML=""

lista.forEach((d,i)=>{

let row=document.createElement("div")
row.className="item"

row.innerHTML=`
<span>${d.deudor} → ${d.acreedor}</span>
<span>${formato(d.monto)}</span>
${admin?`<div class="delete" onclick="eliminarDeuda(${i})">x</div>`:""}
`

div.appendChild(row)

})

}

async function eliminarDeuda(i){

let doc=await db.collection("proyectos").doc(proyectoActual).get()
let data=doc.data()

let lista=data.deudas||[]

lista.splice(i,1)

db.collection("proyectos").doc(proyectoActual).update({
deudas:lista
})

}


// ---------- RANKING ----------

function renderRanking(ingresos,integrantes){

let mapa={}

ingresos.forEach(i=>{
mapa[i.persona]=(mapa[i.persona]||0)+i.monto
})

let lista=Object.entries(mapa).sort((a,b)=>b[1]-a[1])

let div=document.getElementById("ranking")
div.innerHTML=""

lista.forEach((p,i)=>{

let medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":""

let row=document.createElement("div")
row.className="item"

row.innerHTML=`
<span>${medal} ${p[0]}</span>
<span>${formato(p[1])}</span>
`

div.appendChild(row)

})

}


// ---------- WHATSAPP ----------

async function enviarWhatsApp(){

let doc=await db.collection("proyectos").doc(proyectoActual).get()
let data=doc.data()

let ingresos=data.ingresos||[]
let gastos=data.gastos||[]

let totalIng=ingresos.reduce((a,b)=>a+b.monto,0)
let totalGas=gastos.reduce((a,b)=>a+b.monto,0)

let saldo=totalIng-totalGas

let msg=
`🍻 Gastos del Parche

💰 Ingresos: ${formato(totalIng)}
💩 Gastos: ${formato(totalGas)}
📊 Saldo: ${formato(saldo)}

Proyecto: ${proyectoActual}`

window.open("https://wa.me/?text="+encodeURIComponent(msg))

}


// ---------- INIT ----------

cargarProyectos()
