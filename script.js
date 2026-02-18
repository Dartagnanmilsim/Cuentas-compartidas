import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
deleteDoc,
doc,
onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// 🔥 CONFIG FIREBASE
const firebaseConfig = {
apiKey: "TU_API_KEY",
authDomain: "TU_DOMINIO",
projectId: "TU_PROJECT_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ================= FORMATO MONEDA

function dinero(valor){

return new Intl.NumberFormat('es-CO',{
style:'currency',
currency:'COP',
minimumFractionDigits:2
}).format(valor);

}


// ================= ESTADO

let admin=false;
let proyectoActual=localStorage.getItem("proyectoActivo")||null;
const claveCorrecta="1234";


// ================= ADMIN

window.loginAdmin=()=>{

const clave=document.getElementById("claveAdmin").value;

if(clave===claveCorrecta){
admin=true;
document.getElementById("modoTexto").innerText="Modo 👑 Admin";
alert("Admin activado");
}else{
alert("Clave incorrecta");
}

};


// ================= PROYECTOS

const proyectosRef=collection(db,"proyectos");

onSnapshot(proyectosRef,snap=>{

const select=document.getElementById("proyectoSelect");
select.innerHTML='<option value="">Seleccionar</option>';

snap.forEach(docu=>{

const opt=document.createElement("option");
opt.value=docu.id;
opt.textContent=docu.data().nombre;
select.appendChild(opt);

});

if(proyectoActual){

select.value=proyectoActual;
cargarDatos();

}

});


document.getElementById("proyectoSelect").addEventListener("change",e=>{

proyectoActual=e.target.value;

localStorage.setItem("proyectoActivo",proyectoActual);

if(proyectoActual) cargarDatos();

});


window.crearProyecto=async()=>{

if(!admin) return alert("Solo admin");

const nombre=document.getElementById("nuevoProyecto").value;
if(!nombre) return;

const docRef=await addDoc(proyectosRef,{nombre});

proyectoActual=docRef.id;
localStorage.setItem("proyectoActivo",proyectoActual);

cargarDatos();

};


window.eliminarProyecto=async()=>{

if(!admin || !proyectoActual) return;

await deleteDoc(doc(db,"proyectos",proyectoActual));

localStorage.removeItem("proyectoActivo");

location.reload();

};


// ================= CARGAR DATOS

function cargarDatos(){

escucharPersonas();
escucharIngresos();
escucharGastos();
escucharDeudas();

}


// ================= PERSONAS

function personasRef(){
return collection(db,"proyectos",proyectoActual,"personas");
}

window.agregarPersona=async()=>{

if(!admin) return;

const nombre=document.getElementById("nombreInput").value;

await addDoc(personasRef(),{nombre});

};


function escucharPersonas(){

onSnapshot(personasRef(),snap=>{

const lista=document.getElementById("listaPersonas");
const selects=["selectIngreso","selectGasto","deudor","acreedor"];

lista.innerHTML="";
selects.forEach(id=>document.getElementById(id).innerHTML="");

snap.forEach(docu=>{

const data=docu.data();

const div=document.createElement("div");
div.className="item";

div.innerHTML=`
<span>👍 ${data.nombre}</span>
${admin?`<div class="deleteBtn" onclick="eliminarPersona('${docu.id}')">✖</div>`:""}
`;

lista.appendChild(div);

selects.forEach(id=>{

const opt=document.createElement("option");
opt.value=data.nombre;
opt.textContent=data.nombre;

document.getElementById(id).appendChild(opt);

});

});

});

}


window.eliminarPersona=async(id)=>{

if(!admin) return;

await deleteDoc(doc(db,"proyectos",proyectoActual,"personas",id));

};


// ================= INGRESOS

function ingresosRef(){
return collection(db,"proyectos",proyectoActual,"ingresos");
}

window.agregarIngreso=async()=>{

if(!admin) return;

const nombre=document.getElementById("selectIngreso").value;
const monto=parseFloat(document.getElementById("montoIngreso").value);

await addDoc(ingresosRef(),{
nombre,
monto,
fecha:new Date()
});

};


function escucharIngresos(){

onSnapshot(ingresosRef(),snap=>{

let total=0;
const lista=document.getElementById("listaIngresos");
lista.innerHTML="";

snap.forEach(docu=>{

const d=docu.data();
total+=d.monto;

const div=document.createElement("div");
div.className="item";

div.innerHTML=`
<span>🍻 ${d.nombre} - ${dinero(d.monto)}</span>
${admin?`<div class="deleteBtn" onclick="eliminarIngreso('${docu.id}')">✖</div>`:""}
`;

lista.appendChild(div);

});

document.getElementById("totalIngresos").innerText=dinero(total);
actualizarBalance();

});

}


window.eliminarIngreso=async(id)=>{

if(!admin) return;

await deleteDoc(doc(db,"proyectos",proyectoActual,"ingresos",id));

};


// ================= GASTOS

function gastosRef(){
return collection(db,"proyectos",proyectoActual,"gastos");
}

window.agregarGasto=async()=>{

if(!admin) return;

const nombre=document.getElementById("selectGasto").value;
const monto=parseFloat(document.getElementById("montoGasto").value);

await addDoc(gastosRef(),{
nombre,
monto,
fecha:new Date()
});

};


function escucharGastos(){

onSnapshot(gastosRef(),snap=>{

let total=0;
const lista=document.getElementById("listaGastos");
lista.innerHTML="";

snap.forEach(docu=>{

const d=docu.data();
total+=d.monto;

const div=document.createElement("div");
div.className="item";

div.innerHTML=`
<span>💩 ${d.nombre} - ${dinero(d.monto)}</span>
${admin?`<div class="deleteBtn" onclick="eliminarGasto('${docu.id}')">✖</div>`:""}
`;

lista.appendChild(div);

});

document.getElementById("totalGastos").innerText=dinero(total);
actualizarBalance();

});

}


window.eliminarGasto=async(id)=>{

if(!admin) return;

await deleteDoc(doc(db,"proyectos",proyectoActual,"gastos",id));

};


// ================= BALANCE

function actualizarBalance(){

const ingresos=document.getElementById("totalIngresos").innerText.replace(/\D/g,"")||0;
const gastos=document.getElementById("totalGastos").innerText.replace(/\D/g,"")||0;

const total=(ingresos-gastos);

document.getElementById("balance").innerText=dinero(total);

}


// ================= DEUDAS

function deudasRef(){
return collection(db,"proyectos",proyectoActual,"deudas");
}

window.agregarDeuda=async()=>{

if(!admin) return;

const deudor=document.getElementById("deudor").value;
const acreedor=document.getElementById("acreedor").value;
const monto=parseFloat(document.getElementById("montoDeuda").value);

await addDoc(deudasRef(),{
deudor,
acreedor,
monto
});

};


function escucharDeudas(){

onSnapshot(deudasRef(),snap=>{

const lista=document.getElementById("listaDeudas");
lista.innerHTML="";

snap.forEach(docu=>{

const d=docu.data();

const div=document.createElement("div");
div.className="item";

div.innerHTML=`
<span>💸 ${d.deudor} debe a ${d.acreedor} ${dinero(d.monto)}</span>
${admin?`<div class="deleteBtn" onclick="eliminarDeuda('${docu.id}')">✖</div>`:""}
`;

lista.appendChild(div);

});

});

}


window.eliminarDeuda=async(id)=>{

if(!admin) return;

await deleteDoc(doc(db,"proyectos",proyectoActual,"deudas",id));

};


// ================= WHATSAPP

window.compartirWhatsApp=()=>{

const texto=`Balance del parche: ${document.getElementById("balance").innerText}`;

window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`);

};
