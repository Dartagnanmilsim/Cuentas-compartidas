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


// ================= ESTADO GLOBAL

let admin=false;
let proyectoActual=null;

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

});


document.getElementById("proyectoSelect").addEventListener("change",e=>{

proyectoActual=e.target.value;

if(proyectoActual){
cargarDatos();
}

});


window.crearProyecto=async()=>{

if(!admin) return alert("Solo admin");

const nombre=document.getElementById("nuevoProyecto").value;

await addDoc(proyectosRef,{nombre});

};


window.eliminarProyecto=async()=>{

if(!admin) return;

if(!proyectoActual) return;

await deleteDoc(doc(db,"proyectos",proyectoActual));

};


// ================= FUNCION PRINCIPAL

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
const s1=document.getElementById("selectIngreso");
const s2=document.getElementById("selectGasto");
const d1=document.getElementById("deudor");
const d2=document.getElementById("acreedor");

lista.innerHTML="";
s1.innerHTML="";
s2.innerHTML="";
d1.innerHTML="";
d2.innerHTML="";

snap.forEach(docu=>{

const data=docu.data();

const div=document.createElement("div");
div.className="item";

div.innerHTML=`
<span>👍 ${data.nombre}</span>
${admin?`<div class="deleteBtn" onclick="eliminarPersona('${docu.id}')">✖</div>`:""}
`;

lista.appendChild(div);

const opt=document.createElement("option");
opt.value=data.nombre;
opt.textContent=data.nombre;

s1.appendChild(opt.cloneNode(true));
s2.appendChild(opt.cloneNode(true));
d1.appendChild(opt.cloneNode(true));
d2.appendChild(opt.cloneNode(true));

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
<span>🍻 ${d.nombre} - $${d.monto}</span>
${admin?`<div class="deleteBtn" onclick="eliminarIngreso('${docu.id}')">✖</div>`:""}
`;

lista.appendChild(div);

});

document.getElementById("totalIngresos").innerText=total;

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
<span>💩 ${d.nombre} - $${d.monto}</span>
${admin?`<div class="deleteBtn" onclick="eliminarGasto('${docu.id}')">✖</div>`:""}
`;

lista.appendChild(div);

});

document.getElementById("totalGastos").innerText=total;

actualizarBalance();

});

}


window.eliminarGasto=async(id)=>{

if(!admin) return;

await deleteDoc(doc(db,"proyectos",proyectoActual,"gastos",id));

};


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
<span>💸 ${d.deudor} debe a ${d.acreedor} $${d.monto}</span>
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


// ================= BALANCE

function actualizarBalance(){

const i=parseFloat(document.getElementById("totalIngresos").innerText)||0;
const g=parseFloat(document.getElementById("totalGastos").innerText)||0;

document.getElementById("balance").innerText="$"+(i-g);

}


// ================= WHATSAPP

window.compartirWhatsApp=()=>{

const texto=`Balance: ${document.getElementById("balance").innerText}`;

window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`);

};
