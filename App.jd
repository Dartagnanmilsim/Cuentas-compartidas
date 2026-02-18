import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc 
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

window.db = db;
window.fb = { collection, addDoc, getDocs, deleteDoc, doc };
