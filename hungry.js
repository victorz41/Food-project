import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./init-firebase.js";

// 1. Initialize Leaflet Map
const map = L.map("map").setView([40.7589, -73.9851], 12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const markersGroup = L.layerGroup().addTo(map);
const listingFeed = document.querySelector("#listing-feed");

// 2. Helper function to calculate exact expiration timestamp (in milliseconds)
function getExpirationMs(createdAt, pickupWindow) {
    const startTime = createdAt?.toDate ? createdAt.toDate().getTime() : Date.now();

    switch (pickupWindow) {
        case "1h":
            return startTime + 1 * 60 * 60 * 1000;
        case "2h":
            return startTime + 2 * 60 * 60 * 1000;
        case "4h":
            return startTime + 4 * 60 * 60 * 1000;
        case "end-of-day": {
            const endOfDay = new Date(startTime);
            endOfDay.setHours(23, 59, 59, 999);
            return endOfDay.getTime();
        }
        default:
            return startTime + 2 * 60 * 60 * 1000;
    }
}

// 3. Global Live Countdown Interval
function startLiveCountdown() {
    setInterval(() => {
        const timerElements = document.querySelectorAll(".countdown-timer");
        const now = Date.now();

        timerElements.forEach((el) => {
            const expiresMs = Number(el.getAttribute("data-expires"));
            const diff = expiresMs - now;

            if (diff <= 0) {
                el.textContent = "⏰ EXPIRED";
                el.style.color = "#d9534f";
                el.style.fontWeight = "bold";
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                const pad = (num) => String(num).padStart(2, "0");

                if (hours > 0) {
                    el.textContent = `⏳ ${hours}h ${pad(minutes)}m ${pad(seconds)}s remaining`;
                } else {
                    el.textContent = `⏳ ${pad(minutes)}m ${pad(seconds)}s remaining`;
                }

                // Turn text red when less than 15 minutes remain
                el.style.color = diff < 15 * 60 * 1000 ? "#d9534f" : "#212529";
                el.style.fontWeight = diff < 15 * 60 * 1000 ? "bold" : "normal";
            }
        });
    }, 1000);
}

// Start ticker interval once
startLiveCountdown();

// 4. Firestore Query & Real-time Listener
const foodQuery = query(
    collection(db, "surplusFood"),
    orderBy("createdAt", "desc")
);

onSnapshot(foodQuery, (snapshot) => {
    listingFeed.innerHTML = "";
    markersGroup.clearLayers();

    if (snapshot.empty) {
        listingFeed.innerHTML = "<p>No surplus food currently available.</p>";
        return;
    }

    const bounds = [];

    snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        const docId = docSnap.id;

        const lat = item.lat || 40.7589;
        const lng = item.lng || -73.9851;

        const expirationMs = getExpirationMs(item.createdAt, item.pickupWindow);

        // Add Marker Pin
        const marker = L.marker([lat, lng]).addTo(markersGroup);
        marker.bindPopup(`
            <strong>${item.restaurantName || "Cafe Central"}</strong><br>
            📦 ${item.foodQty || 1}x ${item.foodInput}<br>
            📍 ${item.restaurantLocation || ""}
        `);

        bounds.push([lat, lng]);

        // Build allergen/dietary badges
        let badgesHtml = "";

        // 🚨 Check if window is Urgent (1 hour)
        const isUrgent = item.pickupWindow === "1h";

        if (isUrgent) {
            badgesHtml += `<span class="badge badge-urgent">⚠️ Urgent (1 Hr Pickup)</span>`;
        }

        badgesHtml += `<span class="badge">${item.foodCategory || 'Food'}</span>`;
        if (item.isVegetarian) badgesHtml += `<span class="badge">Vegetarian</span>`;
        if (item.hasDairy) badgesHtml += `<span class="badge">Contains Dairy</span>`;
        if (item.hasNuts) badgesHtml += `<span class="badge">Contains Nuts</span>`;
        if (item.hasGluten) badgesHtml += `<span class="badge">Contains Gluten</span>`;

        // Create Card Container
        const card = document.createElement("div");
        card.className = "food-card";
        card.style.cursor = "pointer";

        // 🟡 Add yellow highlight border and soft yellow background for urgent items
        if (isUrgent) {
            card.style.borderLeft = "6px solid #ffc107";
            card.style.backgroundColor = "#fffdf0";
        }

        card.innerHTML = `
            <div class="card-header">
                <span>📦 ${item.foodQty || 1}x ${item.foodInput}</span>
                <span style="color:${isUrgent ? '#856404' : '#6c757d'}; font-weight:${isUrgent ? 'bold' : 'normal'};">
                    Status: ${item.status || 'AVAILABLE'}
                </span>
            </div>
            <div class="card-details">
                <p><strong>From:</strong> ${item.restaurantName || "Cafe Central"}</p>
                <p><strong>Location:</strong> 📍 ${item.restaurantLocation || "Location not provided"}</p>
                <p><strong>Expires In:</strong> <span class="countdown-timer" data-expires="${expirationMs}">Calculating...</span></p>
                ${item.handlingNotes ? `<p><strong>Notes:</strong> ${item.handlingNotes}</p>` : ""}
                <p style="margin-top:6px;">${badgesHtml}</p>
            </div>
            <button class="btn-claim">Claim Donation ➔</button>
        `;

        // Click card to view pin on map
        card.addEventListener("click", (e) => {
            if (e.target.classList.contains("btn-claim")) return;
            map.setView([lat, lng], 15);
            marker.openPopup();
        });

        // Claim button logic
        const claimBtn = card.querySelector(".btn-claim");
        claimBtn.addEventListener("click", async () => {
            const confirmClaim = confirm(`Are you sure you want to claim "${item.foodInput}"?`);
            if (confirmClaim) {
                try {
                    await deleteDoc(doc(db, "surplusFood", docId));
                    alert("Donation claimed successfully!");
                } catch (error) {
                    console.error("Error claiming donation:", error);
                    alert("Error claiming donation: " + error.message);
                }
            }
        });

        listingFeed.appendChild(card);
    });

    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [30, 30] });
    }
}, (error) => {
    console.error("Error fetching surplus food feed:", error);
});