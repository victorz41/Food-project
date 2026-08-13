import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyBrY0EFBaEv3PRgko8HctJYxZlWjOXhoiY",
  authDomain: "foodbridge-569e5.firebaseapp.com",
  databaseURL: "https://foodbridge-569e5-default-rtdb.firebaseio.com",
  projectId: "foodbridge-569e5",
  storageBucket: "foodbridge-569e5.firebasestorage.app",
  messagingSenderId: "350895529916",
  appId: "1:350895529916:web:3d1bdd61b951566b3e95b9"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };