// Import Firestore functions
import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Import the Firestore database from init-firebase.js
import { db } from "./init-firebase.js";


// ========================================
// GET FORM
// ========================================

const form = document.querySelector("#surplus-form");


// ========================================
// GET INPUT ELEMENTS
// ========================================

const foodInput = document.querySelector("#food-title");

const foodCategory = document.querySelector("#food-category");

const foodQty = document.querySelector("#food-qty");

const pickupWindow = document.querySelector("#pickup-window");

const handlingNotes = document.querySelector("#handling-notes");

const nutsCheckbox = document.querySelector("#alg-nuts");

const dairyCheckbox = document.querySelector("#alg-dairy");

const glutenCheckbox = document.querySelector("#diet-gluten");

const vegetarianCheckbox = document.querySelector("#diet-veg");

const submitButton = document.querySelector("#submit-btn");

const restaurantNameInput = document.querySelector("#restaurant-name");

const restaurantLocationInput = document.querySelector("#restaurant-location");

// ========================================
// FORM SUBMISSION
// ========================================

form.addEventListener("submit", async function(event) {

    // Prevent normal form submission
    event.preventDefault();


    // Disable button while uploading
    submitButton.disabled = true;

    submitButton.textContent = "Uploading...";


    // ========================================
    // COLLECT FORM DATA
    // ========================================

    const entryData = {

        foodInput: foodInput.value,

        foodCategory: foodCategory.value,

        foodQty: Number(foodQty.value),

        pickupWindow: pickupWindow.value,

        handlingNotes: handlingNotes.value,

        hasNuts: nutsCheckbox.checked,

        hasDairy: dairyCheckbox.checked,

        hasGluten: glutenCheckbox.checked,

        isVegetarian: vegetarianCheckbox.checked,


        restaurantName: restaurantNameInput.value || "Cafe Central",
    restaurantLocation: restaurantLocationInput.value || "",

    lat: window.selectedLat || 40.7589,
    lng: window.selectedLng || -73.9851,


        // Donation status
        status: "AVAILABLE",


        // Firebase server timestamp
        createdAt: serverTimestamp()

    };


    // Show the data in the browser console
    console.log("Data to upload:", entryData);


    // ========================================
    // UPLOAD TO FIRESTORE
    // =======================================
    
    

    try {

        const docRef = await addDoc(
            collection(db, "surplusFood"),
            entryData
        );


        console.log(
            "Data successfully uploaded!"
        );
        
        window.location.href = "hungry.html"; // (was index.html)
        console.log(
            "Firestore Document ID:",
            docRef.id
        );


        // Tell the user it worked
        alert(
            "Broadcast completed successfully! " +
            "Your surplus food is now live."
        );


        // Redirect AFTER successful upload
        window.location.href = "index.html";


    } catch (error) {

        console.error(
            "Error uploading to Firestore:",
            error
        );


        alert(
            "There was an error uploading your donation.\n\n" +
            error.message
        );


        // Allow user to try again
        submitButton.disabled = false;

        submitButton.textContent =
            "🚀 Broadcast Surplus Food";

    }

});