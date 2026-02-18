let admin = false;
let proyectoActual = null;

const colores = ["color1","color2","color3","color4","color5"];

function formato(n){
  return "$ " + Number(n).toLocaleString("es-CO");
}

function loginAdmin(){
  const pass = document.getElementById("adminPass").value;
  if(pass === "1234"){
    admin = true;
    document.getElementById("modoAdmin").innerText = "Modo 👑 Admin";
  }else{
    alert("Clave incorrecta");
  }
}

async function crearProyecto(){
  const nombre = document.getElementById("nuevoProyecto").value;
  if(!nombre) return;

  await fb.addDoc(fb.collection(db,"proyectos"),{nombre});
  cargarProyectos();
}

async function cargarProyectos(){
  const snap = await fb.getDocs(fb.collection(db,"proyectos"));
  const select = document.getElementById("proyectoSelect");
  select.innerHTML="";

  snap.forEach(docu=>{
    const op = document.createElement("option");
    op.value = docu.id;
    op.textContent = docu.data().nombre;
    select.appendChild(op);
  });

  if(select.value){
    proyectoActual = select.value;
    cargarTodo();
  }
}

document.getElementById("proyectoSelect").addEventListener("change",e=>{
  proyectoActual = e.target.value;
  cargarTodo();
});

async function agregarIntegrante(){
  if(!admin) return alert("Solo admin");

  const nombre = document.getElementById("nombreIntegrante").value;

  await fb.addDoc(fb.collection(db,"proyectos",proyectoActual,"integrantes"),{
    nombre
  });

  cargarTodo();
}

async function cargarIntegrantes(){
  const cont = document.getElementById("listaIntegrantes");
  cont.innerHTML="";

  const snap = await fb.getDocs(fb.collection(db,"proyectos",proyectoActual,"integrantes"));

  let i=0;

  snap.forEach(docu=>{
    const data = docu.data();

    const div = document.createElement("div");
    div.className="item";

    div.innerHTML=`
      <span class="${colores[i%colores.length]}">${data.nombre}</span>
      ${admin?`<button class="deleteBtn" onclick="eliminarIntegrante('${docu.id}')">X</button>`:""}
    `;

    cont.appendChild(div);
    i++;
  });
}

async function eliminarIntegrante(id){
  await fb.deleteDoc(fb.doc(db,"proyectos",proyectoActual,"integrantes",id));
  cargarTodo();
}

async function agregarIngreso(){
  if(!admin) return alert("Solo admin");

  const nombre = document.getElementById("selectIngreso").value;
  const monto = Number(document.getElementById("montoIngreso").value);

  await fb.addDoc(fb.collection(db,"proyectos",proyectoActual,"ingresos"),{
    nombre,monto,fecha:new Date()
  });

  cargarTodo();
}

async function agregarEgreso(){
  if(!admin) return alert("Solo admin");

  const nombre = document.getElementById("selectEgreso").value;
  const monto = Number(document.getElementById("montoEgreso").value);

  await fb.addDoc(fb.collection(db,"proyectos",proyectoActual,"egresos"),{
    nombre,monto,fecha:new Date()
  });

  cargarTodo();
}

async function cargarIngresos(){
  const snap = await fb.getDocs(fb.collection(db,"proyectos",proyectoActual,"ingresos"));
  const cont = document.getElementById("detalleIngresos");

  cont.innerHTML="";
  let total=0;
  let ranking={};

  snap.forEach(docu=>{
    const d = docu.data();
    total+=d.monto;

    ranking[d.nombre]=(ranking[d.nombre]||0)+d.monto;

    const div = document.createElement("div");
    div.className="item";

    div.innerHTML=`
      <span>${d.nombre} → ${formato(d.monto)}</span>
      ${admin?`<button class="deleteBtn" onclick="eliminarIngreso('${docu.id}')">X</button>`:""}
    `;

    cont.appendChild(div);
  });

  document.getElementById("totalIngresos").innerText="Total: "+formato(total);

  cargarRanking(ranking);
}

async function eliminarIngreso(id){
  await fb.deleteDoc(fb.doc(db,"proyectos",proyectoActual,"ingresos",id));
  cargarTodo();
}

async function cargarEgresos(){
  const snap = await fb.getDocs(fb.collection(db,"proyectos",proyectoActual,"egresos"));
  const cont = document.getElementById("detalleEgresos");

  cont.innerHTML="";
  let total=0;

  snap.forEach(docu=>{
    const d = docu.data();
    total+=d.monto;

    const div = document.createElement("div");
    div.className="item";

    div.innerHTML=`
      <span>${d.nombre} → ${formato(d.monto)}</span>
      ${admin?`<button class="deleteBtn" onclick="eliminarEgreso('${docu.id}')">X</button>`:""}
    `;

    cont.appendChild(div);
  });

  document.getElementById("totalEgresos").innerText="Total: "+formato(total);
}

async function eliminarEgreso(id){
  await fb.deleteDoc(fb.doc(db,"proyectos",proyectoActual,"egresos",id));
  cargarTodo();
}

function cargarRanking(ranking){
  const div = document.getElementById("ranking");
  div.innerHTML="";

  const orden = Object.entries(ranking).sort((a,b)=>b[1]-a[1]);

  const medallas=["🥇","🥈","🥉"];

  orden.forEach((r,i)=>{
    const p = document.createElement("p");
    p.innerText=`${medallas[i]||"🏅"} ${r[0]} — ${formato(r[1])}`;
    div.appendChild(p);
  });
}

async function agregarDeuda(){
  if(!admin) return alert("Solo admin");

  const deudor=document.getElementById("deudor").value;
  const acreedor=document.getElementById("acreedor").value;
  const monto=Number(document.getElementById("montoDeuda").value);

  await fb.addDoc(fb.collection(db,"proyectos",proyectoActual,"deudas"),{
    deudor,acreedor,monto
  });

  cargarTodo();
}

async function cargarDeudas(){
  const cont=document.getElementById("listaDeudas");
  cont.innerHTML="";

  const snap=await fb.getDocs(fb.collection(db,"proyectos",proyectoActual,"deudas"));

  snap.forEach(docu=>{
    const d=docu.data();

    const div=document.createElement("div");
    div.className="item";

    div.innerHTML=`
      <span>${d.deudor} debe a ${d.acreedor} → ${formato(d.monto)}</span>
      ${admin?`<button class="deleteBtn" onclick="eliminarDeuda('${docu.id}')">X</button>`:""}
    `;

    cont.appendChild(div);
  });
}

async function eliminarDeuda(id){
  await fb.deleteDoc(fb.doc(db,"proyectos",proyectoActual,"deudas",id));
  cargarTodo();
}

function compartirWhatsApp(){

  const totalIng = document.getElementById("totalIngresos").innerText;
  const totalEgr = document.getElementById("totalEgresos").innerText;

  const msg =
`🍻 *Reporte Oficial del Parche* 🍻

${totalIng}
${totalEgr}

📊 Estado actualizado en tiempo real.

💸 Revisen deudas pendientes en la app.

🔥 ¡Vamos que todavía queda presupuesto para la rumba!`;

  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
}

async function cargarTodo(){
  if(!proyectoActual) return;

  cargarIntegrantes();
  cargarIngresos();
  cargarEgresos();
  cargarDeudas();
}

cargarProyectos();
