import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

let admin = false;
let proyectoActual = null;

function formato(valor) {
  return "$ " + Number(valor || 0).toLocaleString("es-CO");
}

/* ADMIN */

window.loginAdmin = function () {
  const pass = document.getElementById("adminPass").value;

  if (pass === "1234") {
    admin = true;
    document.getElementById("modoTexto").innerText = "Modo 👑 Admin";
    alert("Admin activado");
  } else {
    alert("Clave incorrecta");
  }
};


/* PROYECTOS */

window.crearProyecto = async function () {

  if (!admin) return alert("Solo admin");

  const nombre = document.getElementById("nuevoProyecto").value;

  if (!nombre) return;

  await setDoc(doc(db, "proyectos", nombre), {
    nombre
  });

  document.getElementById("nuevoProyecto").value = "";
};

window.eliminarProyecto = async function () {

  if (!admin) return alert("Solo admin");

  if (!proyectoActual) return;

  await deleteDoc(doc(db, "proyectos", proyectoActual));
};

const proyectoSelect = document.getElementById("proyectoSelect");

onSnapshot(collection(db, "proyectos"), snap => {

  proyectoSelect.innerHTML = "";

  snap.forEach(docu => {

    const op = document.createElement("option");
    op.value = docu.id;
    op.textContent = docu.id;

    proyectoSelect.appendChild(op);
  });

  if (!proyectoActual && proyectoSelect.options.length > 0) {
    proyectoActual = proyectoSelect.options[0].value;
  }

  cargarDatos();
});

proyectoSelect.onchange = () => {
  proyectoActual = proyectoSelect.value;
  cargarDatos();
};


/* PERSONAS */

window.agregarPersona = async function () {

  if (!admin) return alert("Solo admin");

  const nombre = document.getElementById("nombreInput").value;

  if (!nombre) return;

  await addDoc(collection(db, "personas"), {
    proyecto: proyectoActual,
    nombre
  });

  document.getElementById("nombreInput").value = "";
};


/* INGRESOS */

window.agregarIngreso = async function () {

  if (!admin) return alert("Solo admin");

  const persona = document.getElementById("personaIngreso").value;
  const monto = Number(document.getElementById("montoIngreso").value);

  if (!persona || !monto) return;

  await addDoc(collection(db, "ingresos"), {
    proyecto: proyectoActual,
    persona,
    monto,
    fecha: new Date()
  });

  document.getElementById("montoIngreso").value = "";
};


/* GASTOS */

window.agregarGasto = async function () {

  if (!admin) return alert("Solo admin");

  const persona = document.getElementById("personaGasto").value;
  const monto = Number(document.getElementById("montoGasto").value);

  if (!persona || !monto) return;

  await addDoc(collection(db, "gastos"), {
    proyecto: proyectoActual,
    persona,
    monto,
    fecha: new Date()
  });

  document.getElementById("montoGasto").value = "";
};


/* DEUDAS */

window.agregarDeuda = async function () {

  if (!admin) return alert("Solo admin");

  const deudor = document.getElementById("deudor").value;
  const acreedor = document.getElementById("acreedor").value;
  const monto = Number(document.getElementById("montoDeuda").value);

  if (!deudor || !acreedor || !monto) return;

  await addDoc(collection(db, "deudas"), {
    proyecto: proyectoActual,
    deudor,
    acreedor,
    monto
  });
};


/* CARGAR DATOS */

function cargarDatos() {

  if (!proyectoActual) return;

  onSnapshot(collection(db, "personas"), snap => {

    const lista = document.getElementById("listaPersonas");
    lista.innerHTML = "";

    const select1 = document.getElementById("personaIngreso");
    const select2 = document.getElementById("personaGasto");
    const select3 = document.getElementById("deudor");
    const select4 = document.getElementById("acreedor");

    select1.innerHTML = "";
    select2.innerHTML = "";
    select3.innerHTML = "";
    select4.innerHTML = "";

    snap.forEach(docu => {

      const d = docu.data();

      if (d.proyecto !== proyectoActual) return;

      const li = document.createElement("li");
      li.textContent = d.nombre;
      lista.appendChild(li);

      [select1, select2, select3, select4].forEach(sel => {

        const op = document.createElement("option");
        op.value = d.nombre;
        op.textContent = d.nombre;
        sel.appendChild(op);
      });
    });
  });


  onSnapshot(collection(db, "ingresos"), snap => {

    let total = 0;

    snap.forEach(docu => {

      const d = docu.data();
      if (d.proyecto === proyectoActual) total += d.monto;
    });

    document.getElementById("totalIngresos").innerText = formato(total);
  });


  onSnapshot(collection(db, "gastos"), snap => {

    let total = 0;

    snap.forEach(docu => {

      const d = docu.data();
      if (d.proyecto === proyectoActual) total += d.monto;
    });

    document.getElementById("totalGastos").innerText = formato(total);
  });


  onSnapshot(collection(db, "deudas"), snap => {

    const lista = document.getElementById("listaDeudas");
    lista.innerHTML = "";

    snap.forEach(docu => {

      const d = docu.data();
      if (d.proyecto !== proyectoActual) return;

      const li = document.createElement("li");
      li.textContent =
        `${d.deudor} 👉 debe ${formato(d.monto)} a ${d.acreedor}`;

      lista.appendChild(li);
    });
  });

}
