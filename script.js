import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
deleteDoc,
doc,
onSnapshot,
setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// 🔥 CONFIG FIREBASE
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


function formato(n){
return "$ " + Number(n || 0).toLocaleString("es-CO");
}


// ================= ADMIN

window.loginAdmin=()=>{

const pass=document.getElementById("claveAdmin").value;

if(pass==="1234"){
admin=true;
document.getElementById("modoTexto").innerText="Modo 👑 Admin";
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

document.getElementById("nombrePersona").value="";

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

const texto=`Balance actual del parche: ${document.getElementById("balance").innerText}`;

window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`);

};


// ================= CARGAR DATOS

function cargarDatos(){

// PERSONAS
onSnapshot(collection(db,"personas"),snap=>{

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

snap.forEach(docu=>{

const d=docu.data();
if(d.proyecto!==proyectoActual) return;

const li=document.createElement("li");

li.innerHTML=`${d.nombre}`;


// 🔥 ELIMINAR INTEGRANTE SOLO ADMIN
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


// llenar selects
[s1,s2,s3,s4].forEach(sel=>{
const op=document.createElement("option");
op.value=d.nombre;
op.textContent=d.nombre;
sel.appendChild(op);
});

});

});


// ================= INGRESOS

onSnapshot(collection(db,"ingresos"),snap=>{

let total=0;
const lista=document.getElementById("listaIngresos");
lista.innerHTML="";

const rankingTemp={};

snap.forEach(docu=>{

const d=docu.data();
if(d.proyecto!==proyectoActual) return;

total+=Number(d.monto);
rankingTemp[d.persona]=(rankingTemp[d.persona]||0)+Number(d.monto);

const li=document.createElement("li");
li.innerHTML=`${d.persona} → ${formato(d.monto)}`;

if(admin){
const btn=document.createElement("button");
btn.textContent="X";
btn.className="delete-btn";

btn.onclick=async()=>{
await deleteDoc(doc(db,"ingresos",docu.id));
};

li.appendChild(btn);
}

lista.appendChild(li);

});

document.getElementById("totalIngresos").innerText=formato(total);

actualizarBalance();
actualizarRanking(rankingTemp);

});


// ================= GASTOS

onSnapshot(collection(db,"gastos"),snap=>{

let total=0;
const lista=document.getElementById("listaGastos");
lista.innerHTML="";

snap.forEach(docu=>{

const d=docu.data();
if(d.proyecto!==proyectoActual) return;

total+=Number(d.monto);

const li=document.createElement("li");
li.innerHTML=`${d.persona} → ${formato(d.monto)}`;

if(admin){
const btn=document.createElement("button");
btn.textContent="X";
btn.className="delete-btn";

btn.onclick=async()=>{
await deleteDoc(doc(db,"gastos",docu.id));
};

li.appendChild(btn);
}

lista.appendChild(li);

});

document.getElementById("totalGastos").innerText=formato(total);

actualizarBalance();

});


// ================= DEUDAS

onSnapshot(collection(db,"deudas"),snap=>{

const lista=document.getElementById("listaDeudas");
lista.innerHTML="";

snap.forEach(docu=>{

const d=docu.data();
if(d.proyecto!==proyectoActual) return;

const li=document.createElement("li");
li.innerHTML=`${d.deudor} debe ${formato(d.monto)} a ${d.acreedor}`;

if(admin){
const btn=document.createElement("button");
btn.textContent="X";
btn.className="delete-btn";

btn.onclick=async()=>{
await deleteDoc(doc(db,"deudas",docu.id));
};

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
