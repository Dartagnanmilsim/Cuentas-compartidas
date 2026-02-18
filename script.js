let admin = false;

const ADMIN_PASS = "1234";

const colores = ["#e74c3c","#3498db","#27ae60","#9b59b6","#f39c12","#16a085"];


function loginAdmin(){
    const pass = document.getElementById("adminPass").value;

    if(pass === ADMIN_PASS){
        admin = true;
        document.getElementById("modoAdmin").innerText = "Modo 👑 Admin";
        alert("Modo administrador activado");
    }else{
        alert("Clave incorrecta");
    }
}



function formatoPesos(num){
    return "$ " + Number(num || 0).toLocaleString("es-CO");
}



function cargarDatos(){

    db.collection("parche").doc("data").onSnapshot(doc=>{

        const data = doc.data() || {};

        const integrantes = data.integrantes || [];
        const ingresos = data.ingresos || [];
        const gastos = data.gastos || [];
        const deudas = data.deudas || [];

        renderIntegrantes(integrantes);
        renderSelects(integrantes);
        renderIngresos(ingresos);
        renderGastos(gastos);
        renderDeudas(deudas);
        renderRanking(ingresos, integrantes);

    });

}



function guardar(data){
    db.collection("parche").doc("data").set(data,{merge:true});
}



async function obtener(){
    const doc = await db.collection("parche").doc("data").get();
    return doc.data() || {};
}



async function agregarIntegrante(){

    if(!admin) return alert("Solo admin");

    const nombre = document.getElementById("nombreIntegrante").value.trim();
    if(!nombre) return;

    const data = await obtener();

    const lista = data.integrantes || [];

    lista.push({
        nombre,
        color: colores[lista.length % colores.length]
    });

    guardar({integrantes: lista});

    document.getElementById("nombreIntegrante").value="";
}



function renderIntegrantes(lista){

    const div = document.getElementById("listaIntegrantes");
    div.innerHTML="";

    lista.forEach((p,i)=>{

        const row = document.createElement("div");
        row.className="item";

        row.innerHTML = `
        <span style="color:${p.color};font-weight:bold">${p.nombre}</span>
        ${admin ? `<div class="delete" onclick="eliminarIntegrante(${i})">X</div>`:""}
        `;

        div.appendChild(row);
    });
}



async function eliminarIntegrante(i){

    if(!admin) return;

    const data = await obtener();
    const lista = data.integrantes || [];

    lista.splice(i,1);

    guardar({integrantes:lista});
}



function renderSelects(lista){

    const selects = ["selectIngreso","selectGasto","deudor","acreedor"];

    selects.forEach(id=>{

        const s = document.getElementById(id);
        s.innerHTML="";

        lista.forEach(p=>{
            const opt = document.createElement("option");
            opt.value = p.nombre;
            opt.textContent = p.nombre;
            s.appendChild(opt);
        });

    });
}



async function agregarIngreso(){

    if(!admin) return alert("Solo admin");

    const nombre = document.getElementById("selectIngreso").value;
    const monto = Number(document.getElementById("montoIngreso").value);

    if(!nombre || !monto) return;

    const data = await obtener();
    const lista = data.ingresos || [];

    lista.push({
        nombre,
        monto,
        fecha: new Date().toLocaleDateString()
    });

    guardar({ingresos:lista});

    document.getElementById("montoIngreso").value="";
}



function renderIngresos(lista){

    const div = document.getElementById("detalleIngresos");
    div.innerHTML="";

    let total = 0;

    lista.forEach((item,i)=>{

        total += item.monto;

        const row = document.createElement("div");
        row.className="item";

        row.innerHTML = `
        <span>${item.nombre} → ${formatoPesos(item.monto)}</span>
        ${admin ? `<div class="delete" onclick="eliminarIngreso(${i})">X</div>`:""}
        `;

        div.appendChild(row);
    });

    document.getElementById("totalIngresos").innerText =
        "Total: " + formatoPesos(total);
}



async function eliminarIngreso(i){

    const data = await obtener();
    const lista = data.ingresos || [];

    lista.splice(i,1);

    guardar({ingresos:lista});
}



async function agregarGasto(){

    if(!admin) return alert("Solo admin");

    const persona = document.getElementById("selectGasto").value;
    const desc = document.getElementById("descGasto").value;
    const monto = Number(document.getElementById("montoGasto").value);

    if(!persona || !monto) return;

    const data = await obtener();
    const lista = data.gastos || [];

    lista.push({
        persona,
        desc,
        monto,
        fecha: new Date().toLocaleDateString()
    });

    guardar({gastos:lista});

    document.getElementById("descGasto").value="";
    document.getElementById("montoGasto").value="";
}



function renderGastos(lista){

    const div = document.getElementById("detalleGastos");
    div.innerHTML="";

    let total = 0;

    lista.forEach((g,i)=>{

        total += g.monto;

        const row = document.createElement("div");
        row.className="item";

        row.innerHTML = `
        <span>${g.desc} → ${formatoPesos(g.monto)}</span>
        ${admin ? `<div class="delete" onclick="eliminarGasto(${i})">X</div>`:""}
        `;

        div.appendChild(row);
    });

    document.getElementById("totalGastos").innerText =
        "Total: " + formatoPesos(total);
}



async function eliminarGasto(i){

    const data = await obtener();
    const lista = data.gastos || [];

    lista.splice(i,1);

    guardar({gastos:lista});
}



async function agregarDeuda(){

    if(!admin) return alert("Solo admin");

    const deudor = document.getElementById("deudor").value;
    const acreedor = document.getElementById("acreedor").value;
    const monto = Number(document.getElementById("montoDeuda").value);

    const data = await obtener();
    const lista = data.deudas || [];

    lista.push({deudor,acreedor,monto});

    guardar({deudas:lista});
}



function renderDeudas(lista){

    const div = document.getElementById("listaDeudas");
    div.innerHTML="";

    lista.forEach((d,i)=>{

        const row = document.createElement("div");
        row.className="item";

        row.innerHTML = `
        <span>${d.deudor} → ${d.acreedor} ${formatoPesos(d.monto)}</span>
        ${admin ? `<div class="delete" onclick="eliminarDeuda(${i})">X</div>`:""}
        `;

        div.appendChild(row);
    });
}



async function eliminarDeuda(i){

    const data = await obtener();
    const lista = data.deudas || [];

    lista.splice(i,1);

    guardar({deudas:lista});
}



function renderRanking(ingresos, integrantes){

    const ranking = {};

    ingresos.forEach(i=>{
        ranking[i.nombre] = (ranking[i.nombre] || 0) + i.monto;
    });

    const lista = Object.entries(ranking)
        .sort((a,b)=>b[1]-a[1]);

    const div = document.getElementById("ranking");
    div.innerHTML="";

    lista.forEach((p,i)=>{

        const medal =
            i===0?"🥇":
            i===1?"🥈":
            i===2?"🥉":"";

        const row = document.createElement("div");
        row.className="item";

        row.innerHTML = `
        <span>${medal} ${p[0]} → ${formatoPesos(p[1])}</span>
        `;

        div.appendChild(row);
    });
}



async function enviarWhatsApp(){

    const data = await obtener();

    const ingresos = data.ingresos || [];
    const gastos = data.gastos || [];

    const totalIng = ingresos.reduce((a,b)=>a+b.monto,0);
    const totalGas = gastos.reduce((a,b)=>a+b.monto,0);

    const saldo = totalIng - totalGas;

    let msg =
`🍻 *Resumen del Parche* 🍻

💰 Ingresos: ${formatoPesos(totalIng)}
💸 Gastos: ${formatoPesos(totalGas)}
📊 Saldo: ${formatoPesos(saldo)}

🔥 Seguimos firmes equipo`;

    const url = "https://wa.me/?text=" + encodeURIComponent(msg);

    window.open(url,"_blank");
}



cargarDatos();
