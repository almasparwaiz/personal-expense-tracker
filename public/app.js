// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// TODO: Replace with your actual Firebase project config credentials
const firebaseConfig = {
  apiKey: "AIzaSyDr1uJYgsJPrPKfMsnGCbtzLqglIo3xzOQ",
  authDomain: "personal-expense-tracker-15e82.firebaseapp.com",
  projectId: "personal-expense-tracker-15e82",
  storageBucket: "personal-expense-tracker-15e82.firebasestorage.app",
  messagingSenderId: "572656177693",
  appId: "1:572656177693:web:f2f6f319e43af6aec36cf4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const expenseForm = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');
const totalCountEl = document.getElementById('totalCount');
const totalAmountEl = document.getElementById('totalAmount');

// Set default date to today
document.getElementById('date').valueAsDate = new Date();

// Fetch and Display Expenses in Realtime
function loadExpenses() {
    onSnapshot(collection(db, "expenses"), (snapshot) => {
        let expenses = [];
        let totalAmount = 0;
        expenseList.innerHTML = "";

        if (snapshot.empty) {
            expenseList.innerHTML = `<tr><td colspan="5" class="no-data">No expenses recorded yet.</td></tr>`;
            totalCountEl.textContent = 0;
            totalAmountEl.textContent = "$0.00";
            return;
        }

        snapshot.forEach((docSnap) => {
            const expense = { id: docSnap.id, ...docSnap.data() };
            expenses.push(expense);
            totalAmount += Number(expense.amount);
        });

        // Update Summary Calculations
        totalCountEl.textContent = expenses.length;
        totalAmountEl.textContent = `$${totalAmount.toFixed(2)}`;

        // Render Table Rows
        expenses.forEach((item) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(item.title)}</td>
                <td><span class="badge">${escapeHtml(item.category)}</span></td>
                <td>${escapeHtml(item.date)}</td>
                <td>$${Number(item.amount).toFixed(2)}</td>
                <td><button class="btn-delete" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button></td>
            `;
            expenseList.appendChild(tr);
        });

        // Attach Delete Event Listeners
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                await deleteExpense(id);
            });
        });
    });
}

// Add Expense Handler
expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    try {
        await addDoc(collection(db, "expenses"), {
            title,
            amount,
            category,
            date,
            createdAt: new Date()
        });
        expenseForm.reset();
        document.getElementById('date').valueAsDate = new Date();
    } catch (error) {
        console.error("Error adding expense: ", error);
        alert("Failed to add expense.");
    }
});

// Delete Expense Function
async function deleteExpense(id) {
    if (confirm("Are you sure you want to delete this expense?")) {
        try {
            await deleteDoc(doc(db, "expenses", id));
        } catch (error) {
            console.error("Error deleting expense: ", error);
            alert("Failed to delete expense.");
        }
    }
}

// Security Helper to Prevent XSS
function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Initialize on Load
loadExpenses();