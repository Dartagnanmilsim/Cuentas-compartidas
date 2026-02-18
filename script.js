import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMAIN",
  projectId: "TU_PROJECT_ID"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


let admin = false;
let proyectoActual = localStorage.getItem("proyecto") || "";


function formato(n) {
  return "$" + Number(n).toLocaleString("es-CO");
}


window.loginAdmin = () => {

  const clave = document.getElementById("claveAdmin").value;

  if (clave === "1234") {
    admin = true;
    document.getElementById("modoTexto").innerText = "Modo 👑 Admin";
  } else {
    alert("Clave incorrecta");
  }

};


const proyectosRef = collection(db, "proyectos");

onSnapshot(proyectosRef, snap => {

  const select = document.getElementById("proyectoSelect");

  select.innerHTML = '<option value="">Seleccionar proyecto</option>';

  snap.forEach(docu => {

    const data = docu.data();

    const opt = document.createElement("option");
    opt.value = docu.id;
    opt.textContent = data.nombre;

    select.appendChild(opt);

  });

});


document.getElementById("proyectoSelect")
.addEventListener("change", e => {

  proyectoActual = e.target.value;
  localStorage.setItem("proyecto", proyectoActual);

  cargarDatos();

});


window.crearProyecto = async () => {

  if (!admin) return alert("Solo admin");

  const nombre = document.getElementById("nuevoProyecto").value;

  if (!nombre) return;

  const ref = await addDoc(collection(db, "proyectos"), {
    nombre
  });

  proyectoActual = ref.id;

  localStorage.setItem("proyecto", proyectoActual);

  cargarDatos();

};


window.eliminarProyecto = async () => {

  if (!admin) return;

  if (!proyectoActual) return;

  await deleteDoc(doc(db, "proyectos", proyectoActual));

  proyectoActual = "";

  localStorage.removeItem("proyecto");

};


function cargarDatos() {

  if (!proyectoActual) return;

  cargarPersonas();
  cargarIngresos();
  cargarEgresos();

}



function cargarPersonas() {

  const ref = collection(db, "proyectos", proyectoActual, "personas");

  onSnapshot(ref, snap => {

    const div = document.getElementById("listaPersonas");
    const sel1 = document.getElementById("personaIngreso");
    const sel2 = document.getElementById("personaEgreso");

    div.innerHTML = "";
    sel1.innerHTML = "";
    sel2.innerHTML = "";

    snap.forEach(d => {

      const data = d.data();

      const item = document.createElement("div");
      item.className = "item";

      item.innerHTML = `
        ${data.nombre}
        ${admin ? `<button class="delete" onclick="eliminarPersona('${d.id}')">X</button>` : ""}
      `;

      div.appendChild(item);

      const opt1 = document.createElement("option");
      opt1.value = data.nombre;
      opt1.textContent = data.nombre;

      const opt2 = opt1.cloneNode(true);

      sel1.appendChild(opt1);
      sel2.appendChild(opt2);

    });

  });

}


window.agregarPersona = async () => {

  if (!admin) return;

  const nombre = document.getElementById("nombrePersona").value;

  await addDoc(
    collection(db, "proyectos", proyectoActual, "personas"),
    { nombre }
  );

};


window.eliminarPersona = async (id) => {

  if (!admin) return;

  await deleteDoc(
    doc(db, "proyectos", proyectoActual, "personas", id)
  );

};


function cargarIngresos() {

  const ref = collection(db, "proyectos", proyectoActual, "ingresos");

  onSnapshot(ref, snap => {

    let total = 0;
    const div = document.getElementById("listaIngresos");
    div.innerHTML = "";

    snap.forEach(d => {

      const data = d.data();

      total += Number(data.monto);

      const item = document.createElement("div");
      item.className = "item";

      item.innerHTML = `
        ${data.persona} - ${formato(data.monto)}
        ${admin ? `<button class="delete" onclick="eliminarIngreso('${d.id}')">X</button>` : ""}
      `;

      div.appendChild(item);

    });

    document.getElementById("totalIngresos").innerText = formato(total);
    calcularBalance();

  });

}


window.agregarIngreso = async () => {

  if (!admin) return;

  const persona = document.getElementById("personaIngreso").value;
  const monto = document.getElementById("montoIngreso").value;

  await addDoc(
    collection(db, "proyectos", proyectoActual, "ingresos"),
    { persona, monto }
  );

};


window.eliminarIngreso = async (id) => {

  if (!admin) return;

  await deleteDoc(
    doc(db, "proyectos", proyectoActual, "ingresos", id)
  );

};



function cargarEgresos() {

  const ref = collection(db, "proyectos", proyectoActual, "egresos");

  onSnapshot(ref, snap => {

    let total = 0;
    const div = document.getElementById("listaEgresos");
    div.innerHTML = "";

    snap.forEach(d => {

      const data = d.data();

      total += Number(data.monto);

      const item = document.createElement("div");
      item.className = "item";

      item.innerHTML = `
        ${data.persona} - ${formato(data.monto)}
        ${admin ? `<button class="delete" onclick="eliminarEgreso('${d.id}')">X</button>` : ""}
      `;

      div.appendChild(item);

    });

    document.getElementById("totalEgresos").innerText = formato(total);
    calcularBalance();

  });

}


window.agregarEgreso = async () => {

  if (!admin) return;

  const persona = document.getElementById("personaEgreso").value;
  const monto = document.getElementById("montoEgreso").value;

  await addDoc(
    collection(db, "proyectos", proyectoActual, "egresos"),
    { persona, monto }
  );

};


window.eliminarEgreso = async (id) => {

  if (!admin) return;

  await deleteDoc(
    doc(db, "proyectos", proyectoActual, "egresos", id)
  );

};


function calcularBalance() {

  const ingresos = document.getElementById("totalIngresos").innerText.replace(/\D/g,"");
  const egresos = document.getElementById("totalEgresos").innerText.replace(/\D/g,"");

  const total = ingresos - egresos;

  document.getElementById("balanceTotal").innerText = formato(total);

}
