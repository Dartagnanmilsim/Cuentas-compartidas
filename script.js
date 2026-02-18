import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
deleteDoc,
doc,
onSnapshot,
setDoc,
query,
where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// 🔥 FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBfMEoJ0yuS9EE1UC8cWHpqjgSL0bphcqs",
  authDomain: "gastos-parche.firebaseapp.com",
  projectId: "gastos-parche",
  storageBucket: "gastos-parche.firebasestorage.app",
  messagingSenderId: "558910304272",
  appId: "1:558910304272:web:e9ae826d11a7865a8b9a95"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let admin=false;
let proyectoActual=null;


// listeners
let unsubPersonas=null;
let unsubIngresos=null;
let unsubGastos=null;
let unsubDeudas=null;


// colores
const colores=["#e74c3c","#3498db","#2ecc71","#9b59b6","#f39c12","#1abc9c"];
const colorMap={};


function formato(n){
return "$ " + Number(n || 0).toLocaleString("es-CO");
}


// ================= ADMIN
window.loginAdmin=()=>{

const pass=document.getElementById("claveAdmin").value;

if(pass==="1234"){
admin=true;
document.getElementById("modoTexto").innerText="Modo 👑 Admin";
cargarDatos();
}else{
alert("Clave incorrecta");
}

};


// ================= PROYECTOS
const proyectoSelect=document.getElementById("proyectoSelect");

onSnapshot(collection(db,"proyectos"),snap=>{

proyectoSelect.innerHTML="";

snap.forEach(docu=>{
const op=document.createElement("option");
op.value=docu.id;
op.textContent=docu.id;
proyectoSelect.appendChild(op);
});

if(!proyectoActual && proyectoSelect.options.length>0){
proyectoActual=proyectoSelect.options[0].value;
cargarDatos();
}

});


window.crearProyecto=async()=>{

if(!admin) return alert("Solo admin");

const nombre=document.getElementById("nuevoProyecto").value;
if(!nombre) return;

await setDoc(doc(db,"proyectos",nombre),{nombre});

};


window.eliminarProyecto=async()=>{

if(!admin) return;

await deleteDoc(doc(db,"proyectos",proyectoActual));

};


proyectoSelect.onchange=()=>{
proyectoActual=proyectoSelect.value;
cargarDatos();
};


// ================= PERSONAS
window.agregarPersona=async()=>{

if(!admin) return;

const nombre=document.getElementById("nombrePersona").value;
if(!nombre) return;

await addDoc(collection(db,"personas"),{
proyecto:proyectoActual,
nombre
});

};


// ================= INGRESOS
window.agregarIngreso=async()=>{

if(!admin) return;

const persona=document.getElementById("personaIngreso").value;
const monto=document.getElementById("montoIngreso").value;

await addDoc(collection(db,"ingresos"),{
proyecto:proyectoActual,
persona,
monto:Number(monto)
});

};


// ================= GASTOS
window.agregarGasto=async()=>{

if(!admin) return;

const persona=document.getElementById("personaGasto").value;
const monto=document.getElementById("montoGasto").value;

await addDoc(collection(db,"gastos"),{
proyecto:proyectoActual,
persona,
monto:Number(monto)
});

};


// ================= DEUDAS
window.agregarDeuda=async()=>{

if(!admin) return;

const deudor=document.getElementById("deudor").value;
const acreedor=document.getElementById("acreedor").value;
const monto=document.getElementById("montoDeuda").value;

await addDoc(collection(db,"deudas"),{
proyecto:proyectoActual,
deudor,
acreedor,
monto:Number(monto)
});

};


// ================= WHATSAPP
window.compartirWhatsApp=()=>{

const ingresos=document.getElementById("totalIngresos").innerText;
const gastos=document.getElementById("totalGastos").innerText;
const balance=document.getElementById("balance").innerText;

let rankingTexto="";
document.querySelectorAll("#ranking li").forEach(li=>{
rankingTexto+=li.innerText+"\n";
});

let deudasTexto="";
document.querySelectorAll("#listaDeudas li").forEach(li=>{
deudasTexto+=li.innerText+"\n";
});

const texto=`🚬💰 *Reunión de Alto Nivel — Organización del Parche*

Caballeros:

Los números ya hablaron.

💰 Plata que entró: ${ingresos}
💸 Plata que salió: ${gastos}
📊 Balance del negocio: ${balance}

🏆 Los que pusieron la cara por la empresa:
${rankingTexto || "Sin movimientos"}

🤝 Deudas internas:
${deudasTexto || "Sin deudas registradas"}

⚖️ Decisión:
La empresa sigue fuerte.
La caja está viva.
La fiesta continúa.

Firmado,
La Junta 🍻😎`;

window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`);

};


// ================= CARGAR DATOS
function cargarDatos(){

if(!proyectoActual) return;


// cancelar listeners
if(unsubPersonas) unsubPersonas();
if(unsubIngresos) unsubIngresos();
if(unsubGastos) unsubGastos();
if(unsubDeudas) unsubDeudas();


// ================= PERSONAS
const qPersonas=query(
collection(db,"personas"),
where("proyecto","==",proyectoActual)
);

unsubPersonas=onSnapshot(qPersonas,snap=>{

const lista=document.getElementById("listaPersonas");

const s1=document.getElementById("personaIngreso");
const s2=document.getElementById("personaGasto");
const s3=document.getElementById("deudor");
const s4=document.getElementById("acreedor");

lista.innerHTML="";
s1.innerHTML="";
s2.innerHTML="";
s3.innerHTML="";
s4.innerHTML="";

let i=0;

snap.forEach(docu=>{

const d=docu.data();

if(!colorMap[d.nombre]){
colorMap[d.nombre]=colores[i%colores.length];
i++;
}

const li=document.createElement("li");

const span=document.createElement("span");
span.textContent=d.nombre;
span.style.color=colorMap[d.nombre];
span.style.fontWeight="bold";

li.appendChild(span);

if(admin){
const btn=document.createElement("button");
btn.textContent="X";
btn.className="delete-btn";

btn.onclick=async()=>{
await deleteDoc(doc(db,"personas",docu.id));
};

li.appendChild(btn);
}

lista.appendChild(li);

[s1,s2,s3,s4].forEach(sel=>{
const op=document.createElement("option");
op.value=d.nombre;
op.textContent=d.nombre;
sel.appendChild(op);
});

});

});


// ================= INGRESOS
const qIngresos=query(
collection(db,"ingresos"),
where("proyecto","==",proyectoActual)
);

unsubIngresos=onSnapshot(qIngresos,snap=>{

let total=0;
const lista=document.getElementById("listaIngresos");
lista.innerHTML="";

const rankingTemp={};

snap.forEach(docu=>{

const d=docu.data();

total+=Number(d.monto);
rankingTemp[d.persona]=(rankingTemp[d.persona]||0)+Number(d.monto);

const li=document.createElement("li");
li.innerHTML=`${d.persona} → ${formato(d.monto)}`;

if(admin){
const btn=document.createElement("button");
btn.textContent="X";
btn.className="delete-btn";
btn.onclick=async()=> await deleteDoc(doc(db,"ingresos",docu.id));
li.appendChild(btn);
}

lista.appendChild(li);

});

document.getElementById("totalIngresos").innerText=formato(total);

actualizarBalance();
actualizarRanking(rankingTemp);

});


// ================= GASTOS
const qGastos=query(
collection(db,"gastos"),
where("proyecto","==",proyectoActual)
);

unsubGastos=onSnapshot(qGastos,snap=>{

let total=0;
const lista=document.getElementById("listaGastos");
lista.innerHTML="";

snap.forEach(docu=>{

const d=docu.data();

total+=Number(d.monto);

const li=document.createElement("li");
li.innerHTML=`${d.persona} → ${formato(d.monto)}`;

if(admin){
const btn=document.createElement("button");
btn.textContent="X";
btn.className="delete-btn";
btn.onclick=async()=> await deleteDoc(doc(db,"gastos",docu.id));
li.appendChild(btn);
}

lista.appendChild(li);

});

document.getElementById("totalGastos").innerText=formato(total);

actualizarBalance();

});


// ================= DEUDAS
const qDeudas=query(
collection(db,"deudas"),
where("proyecto","==",proyectoActual)
);

unsubDeudas=onSnapshot(qDeudas,snap=>{

const lista=document.getElementById("listaDeudas");
lista.innerHTML="";

snap.forEach(docu=>{

const d=docu.data();

const li=document.createElement("li");
li.innerHTML=`${d.deudor} debe ${formato(d.monto)} a ${d.acreedor}`;

if(admin){
const btn=document.createElement("button");
btn.textContent="X";
btn.className="delete-btn";
btn.onclick=async()=> await deleteDoc(doc(db,"deudas",docu.id));
li.appendChild(btn);
}

lista.appendChild(li);

});

});

}


// ================= BALANCE
function actualizarBalance(){

const ingresos=Number(document.getElementById("totalIngresos").innerText.replace(/\D/g,""));
const gastos=Number(document.getElementById("totalGastos").innerText.replace(/\D/g,""));

const total=ingresos-gastos;

document.getElementById("balance").innerText=formato(total);

}


// ================= RANKING
function actualizarRanking(data){

const lista=document.getElementById("ranking");
lista.innerHTML="";

Object.entries(data)
.sort((a,b)=>b[1]-a[1])
.forEach(([persona,total],i)=>{

const medalla=i===0?"🥇":i===1?"🥈":i===2?"🥉":"";

const li=document.createElement("li");
li.textContent=`${medalla} ${persona} → ${formato(total)}`;

lista.appendChild(li);

});

}
