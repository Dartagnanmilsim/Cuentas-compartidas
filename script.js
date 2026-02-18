import { ref, push, onValue, remove, set } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const db = window.db;
const proyecto = "default";

let personas = [];
let ingresos = [];
let gastos = [];

/* COLORES */

function colorPersona(nombre){
const index = personas.findIndex(p=>p.nombre===nombre);
return "color-"+(index%5);
}

/* FORMATO */

function money(n){
return "$ " + Number(n || 0).toLocaleString("es-CO");
}

/* PERSONAS */

window.agregarPersona = function(){

const nombre = document.getElementById("nombrePersona").value.trim();
if(!nombre) return;

personas.push({nombre});
guardarPersonas();

document.getElementById("nombrePersona").value="";

}

function guardarPersonas(){
set(ref(db, "data/personas"), personas);
}

function renderPersonas(){

const cont = document.getElementById("listaPersonas");
cont.innerHTML="";

personas.forEach((p,i)=>{

const div = document.createElement("div");
div.className="item";

div.innerHTML=`
<span class="${colorPersona(p.nombre)}"><b>${p.nombre}</b></span>
<div class="delete-btn" onclick="eliminarPersona(${i})">X</div>
`;

cont.appendChild(div);

});

}

/* SELECTS */

function cargarSelects(){

const sel1 = document.getElementById("personaIngreso");
const sel2 = document.getElementById("personaGasto");

sel1.innerHTML='<option value="">Seleccionar</option>';
sel2.innerHTML='<option value="">Seleccionar</option>';

personas.forEach(p=>{

const o1=document.createElement("option");
o1.value=p.nombre;
o1.textContent=p.nombre;

const o2=document.createElement("option");
o2.value=p.nombre;
o2.textContent=p.nombre;

sel1.appendChild(o1);
sel2.appendChild(o2);

});

}

/* ELIMINAR PERSONA */

window.eliminarPersona=function(i){
personas.splice(i,1);
guardarPersonas();
}

/* INGRESOS */

window.agregarIngreso=function(){

const persona=document.getElementById("personaIngreso").value;
const monto=Number(document.getElementById("montoIngreso").value);

if(!persona||!monto) return;

push(ref(db,"data/ingresos"),{
persona,
monto,
fecha:Date.now()
});

document.getElementById("montoIngreso").value="";

}

function renderIngresos(){

let total=0;
const cont=document.getElementById("listaIngresos");
cont.innerHTML="";

ingresos.forEach(i=>{

total+=i.monto;

const div=document.createElement("div");
div.className="item";

div.innerHTML=`
<span class="${colorPersona(i.persona)}">
${i.persona} → ${money(i.monto)}
</span>
`;

cont.appendChild(div);

});

document.getElementById("totalIngresos").innerText="Total: "+money(total);

}

/* GASTOS */

window.agregarGasto=function(){

const persona=document.getElementById("personaGasto").value;
const desc=document.getElementById("descripcionGasto").value;
const monto=Number(document.getElementById("montoGasto").value);

if(!persona||!monto) return;

push(ref(db,"data/gastos"),{
persona,
desc,
monto,
fecha:Date.now()
});

document.getElementById("descripcionGasto").value="";
document.getElementById("montoGasto").value="";

}

function renderGastos(){

let total=0;
const cont=document.getElementById("listaGastos");
cont.innerHTML="";

gastos.forEach(g=>{

total+=g.monto;

const div=document.createElement("div");
div.className="item";

div.innerHTML=`
<span class="${colorPersona(g.persona)}">
${g.persona} → ${g.desc} → ${money(g.monto)}
</span>
`;

cont.appendChild(div);

});

document.getElementById("totalGastos").innerText="Total: "+money(total);

}

/* BALANCE */

function renderBalance(){

const cont=document.getElementById("balance");
cont.innerHTML="";

const totalIng=ingresos.reduce((a,b)=>a+b.monto,0);
const totalGas=gastos.reduce((a,b)=>a+b.monto,0);

const porPersona={};

personas.forEach(p=>porPersona[p.nombre]=0);

ingresos.forEach(i=>porPersona[i.persona]+=i.monto);
gastos.forEach(g=>porPersona[g.persona]-=g.monto);

const promedio=totalGas/personas.length||0;

Object.keys(porPersona).forEach(p=>{

const balance=porPersona[p]-promedio;

const div=document.createElement("div");
div.innerHTML=`${p}: ${money(balance)}`;

cont.appendChild(div);

});

}

/* RANKING */

function renderRanking(){

const cont=document.getElementById("ranking");
cont.innerHTML="";

const mapa={};

ingresos.forEach(i=>{
mapa[i.persona]=(mapa[i.persona]||0)+i.monto;
});

const arr=Object.entries(mapa).sort((a,b)=>b[1]-a[1]);

arr.forEach((r,i)=>{
const div=document.createElement("div");
div.innerHTML=`${i+1}. ${r[0]} → ${money(r[1])}`;
cont.appendChild(div);
});

}

/* WHATSAPP */

window.enviarWhatsApp=function(){

let txt="🍻 *Resumen Gastos del Parche*\n\n";

ingresos.forEach(i=>{
txt+=`${i.persona} puso ${money(i.monto)}\n`;
});

txt+="\n💩 Gastos\n";

gastos.forEach(g=>{
txt+=`${g.persona} → ${g.desc} → ${money(g.monto)}\n`;
});

const url="https://wa.me/?text="+encodeURIComponent(txt);
window.open(url);

}

/* FIREBASE LISTENERS */

onValue(ref(db,"data/personas"),snap=>{

personas=snap.val()||[];

renderPersonas();
cargarSelects(); // 🔥 ESTA LINEA ARREGLA EL BUG

});

onValue(ref(db,"data/ingresos"),snap=>{

const val=snap.val()||{};
ingresos=Object.values(val);

renderIngresos();
renderBalance();
renderRanking();

});

onValue(ref(db,"data/gastos"),snap=>{

const val=snap.val()||{};
gastos=Object.values(val);

renderGastos();
renderBalance();

});
