import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfMEoJ0yuS9EE1UC8cWHpqjgSL0bphcqs",
  authDomain: "gastos-parche.firebaseapp.com",
  projectId: "gastos-parche",
  storageBucket: "gastos-parche.firebasestorage.app",
  messagingSenderId: "558910304272",
  appId: "1:558910304272:web:e9ae826d11a7865a8b9a95"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

window.db = db;
