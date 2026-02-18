let admin = false;
const ADMIN_PASS = "1234";

let integrantes = [];
let ingresos = [];
let gastos = [];
let deudas = [];

const colores = ["#e74c3c","#3498db","#2ecc71","#9b59b6","#f39c12"];

function colorNombre(nombre){
let index = integrantes.indexOf(nombre);
return colores[index % colores.length];
}

function formato(n){
return "$ " + n.toLocaleString("es-CO");
}

// ADMIN
function loginAdmin(){
let pass = document.getElementById("adminPass").value;
if(pass === ADMIN_PASS){
admin = true;
document.getElementById("modoAdmin").innerText="Modo 👑 Admin";
alert("Modo administrador activado");
}else{
alert("Clave incorrecta");
}
}


// INTEGRANTES
function agregarIntegrante(){
if(!admin) return alert("Solo admin");

let nombre = document.getElementById("nombreIntegrante").value;
if(!nombre) return;

integrantes.push(nombre);
guardar();
render();
document.getElementById("nombreIntegrante").value="";
}

function eliminarIntegrante(i){
if(!admin) return;
integrantes.splice(i,1);
guardar();
render();
}


// INGRESOS
function agregarIngreso(){
if(!admin) return;

let nombre = document.getElementById("selectIngreso").value;
let monto = Number(document.getElementById("montoIngreso").value);

if(!nombre || !monto) return;

ingresos.push({nombre,monto,fecha:new Date()});
guardar();
render();
}


// GASTOS
function agregarGasto(){
if(!admin) return;

let nombre = document.getElementById("selectGasto").value;
let desc = document.getElementById("descGasto").value;
let monto = Number(document.getElementById("montoGasto").value);

if(!nombre || !monto) return;

gastos.push({nombre,desc,monto});
guardar();
render();
}


// DEUDAS
function agregarDeuda(){
if(!admin) return;

let d = document.getElementById("deudor").value;
let a = document.getElementById("acreedor").value;
let m = Number(document.getElementById("montoDeuda").value);

if(!d || !a || !m) return;

deudas.push({d,a,m});
guardar();
render();
}


// RENDER
function render(){

// selects
let selects = ["selectIngreso","selectGasto","deudor","acreedor"];
selects.forEach(id=>{
let s=document.getElementById(id);
if(!s) return;
s.innerHTML="";
integrantes.forEach(n=>{
let op=document.createElement("option");
op.value=n;
op.text=n;
s.appendChild(op);
});
});


// integrantes
let lista=document.getElementById("listaIntegrantes");
lista.innerHTML="";
integrantes.forEach((n,i)=>{
let div=document.createElement("div");
div.className="item";
div.innerHTML=`
<span style="color:${colorNombre(n)};font-weight:bold">${n}</span>
${admin?`<span class="delete" onclick="eliminarIntegrante(${i})">x</span>`:""}
`;
lista.appendChild(div);
});


// ingresos
let totalIng=0;
let listaIng=document.getElementById("listaIngresos");
listaIng.innerHTML="";

ingresos.forEach((x,i)=>{
totalIng+=x.monto;

let div=document.createElement("div");
div.className="item";
div.innerHTML=`
<span style="color:${colorNombre(x.nombre)}">${x.nombre}</span>
<span>${formato(x.monto)}</span>
`;
listaIng.appendChild(div);
});

document.getElementById("totalIngresos").innerText="Total: "+formato(totalIng);


// gastos
let totalGas=0;
let listaGas=document.getElementById("listaGastos");
listaGas.innerHTML="";

gastos.forEach((x,i)=>{
totalGas+=x.monto;

let div=document.createElement("div");
div.className="item";
div.innerHTML=`
<span>${x.desc} - <span style="color:${colorNombre(x.nombre)}">${x.nombre}</span></span>
<span>${formato(x.monto)}</span>
`;
listaGas.appendChild(div);
});

document.getElementById("totalGastos").innerText="Total: "+formato(totalGas);


// deudas
let listaDeu=document.getElementById("listaDeudas");
listaDeu.innerHTML="";

deudas.forEach(x=>{
let div=document.createElement("div");
div.className="item";
div.innerHTML=`
<span>${x.d} → ${x.a}</span>
<span>${formato(x.m)}</span>
`;
listaDeu.appendChild(div);
});


// ranking
let mapa={};
integrantes.forEach(n=>mapa[n]=0);

ingresos.forEach(x=>mapa[x.nombre]+=x.monto);

let rank=Object.entries(mapa).sort((a,b)=>b[1]-a[1]);

let r=document.getElementById("ranking");
r.innerHTML="";

rank.forEach((x,i)=>{
let div=document.createElement("div");
div.innerHTML=`${i+1}. ${x[0]} — ${formato(x[1])}`;
r.appendChild(div);
});

}


// WHATSAPP
function enviarWhatsApp(){

let totalIng = ingresos.reduce((a,b)=>a+b.monto,0);
let totalGas = gastos.reduce((a,b)=>a+b.monto,0);

let msg=`🍻 *Gastos del Parche* 🍻

💰 Total Ingresos: ${formato(totalIng)}
💩 Total Gastos: ${formato(totalGas)}

🏆 Ranking:
`;

let mapa={};
integrantes.forEach(n=>mapa[n]=0);
ingresos.forEach(x=>mapa[x.nombre]+=x.monto);

Object.entries(mapa)
.sort((a,b)=>b[1]-a[1])
.forEach((x,i)=>{
msg+=`\n${i+1}. ${x[0]} — ${formato(x[1])}`;
});

let url="https://wa.me/?text="+encodeURIComponent(msg);
window.open(url);
}


// STORAGE LOCAL (fase-1)
function guardar(){
localStorage.setItem("dataParche",JSON.stringify({
integrantes,ingresos,gastos,deudas
}));
}

function cargar(){
let data=localStorage.getItem("dataParche");
if(data){
let obj=JSON.parse(data);
integrantes=obj.integrantes||[];
ingresos=obj.ingresos||[];
gastos=obj.gastos||[];
deudas=obj.deudas||[];
}
render();
}

cargar();
