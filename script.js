import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
deleteDoc,
doc,
onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// 🔥 PEGA TU CONFIG AQUÍ
const firebaseConfig = {
apiKey: "TU_API_KEY",
authDomain: "TU_DOMINIO",
projectId: "TU_PROJECT_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ================= VARIABLES

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

select.innerHTML="";

snap.forEach(docu=>{

const opt=document.createElement("option");
opt.value=docu.id;
opt.textContent=docu.data().nombre;

select.appendChild(opt);

});

if(select.value){
cargarProyecto(select.value);
}

});


window.crearProyecto=async()=>{

if(!admin){
alert("Solo admin");
return;
}

const nombre=document.getElementById("nuevoProyecto").value;

await addDoc(proyectosRef,{nombre});

};


window.eliminarProyecto=async()=>{

if(!admin){
alert("Solo admin");
return;
}

if(!proyectoActual) return;

await deleteDoc(doc(db,"proyectos",proyectoActual));

};


document.getElementById("proyectoSelect").onchange=e=>{

cargarProyecto(e.target.value);

};


function cargarProyecto(id){

proyectoActual=id;

escucharPersonas();
escucharIngresos();
escucharGastos();

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
const select1=document.getElementById("selectIngreso");
const select2=document.getElementById("selectGasto");

lista.innerHTML="";
select1.innerHTML="";
select2.innerHTML="";

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

select1.appendChild(opt.cloneNode(true));
select2.appendChild(opt.cloneNode(true));

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

const data=docu.data();
total+=data.monto;

const div=document.createElement("div");
div.className="item";

div.innerHTML=`
<span>🍻 ${data.nombre} - $${data.monto}</span>
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

const data=docu.data();
total+=data.monto;

const div=document.createElement("div");
div.className="item";

div.innerHTML=`
<span>💩 ${data.nombre} - $${data.monto}</span>
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


// ================= BALANCE + RANKING

function actualizarBalance(){

const ingresos=parseFloat(document.getElementById("totalIngresos").innerText)||0;
const gastos=parseFloat(document.getElementById("totalGastos").innerText)||0;

const balance=ingresos-gastos;

document.getElementById("balance").innerText="$"+balance;

}


// ================= WHATSAPP

window.compartirWhatsApp=()=>{

const texto=`Balance actual: ${document.getElementById("balance").innerText}`;

const url=`https://wa.me/?text=${encodeURIComponent(texto)}`;

window.open(url);

};
