import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
    getFirestore, collection, getDocs, doc, deleteDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDRe0sxYnR7QVzhXkbR3H0ZhLcfxla7LgA",
    authDomain: "al-baha-literary-club-board.firebaseapp.com",
    projectId: "al-baha-literary-club-board",
    storageBucket: "al-baha-literary-club-board.firebasestorage.app",
    messagingSenderId: "451049449840",
    appId: "1:451049449840:web:9c3b9aca29d0c97b8287b5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;
let isAdmin = false;

async function checkRole(user) {
    if (!user) return;
    const snap = await getDocs(collection(db, "users"));
    snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.email?.toLowerCase().trim() === user.email?.toLowerCase().trim() && data.role === "admin") {
            isAdmin = true;
        }
    });
}

async function loadVotes() {
    await checkRole(currentUser);

    const addBtn = document.getElementById("addVoteBtn");
    if (addBtn && isAdmin) addBtn.style.display = "inline-block";

    const list = document.getElementById("votesList");
    if (!list) return;

    try {
        const snap = await getDocs(collection(db, "votes"));
        list.innerHTML = "";

        if (snap.empty) {
            list.innerHTML = "<p>لا توجد تصويتات حالياً.</p>";
            return;
        }

        snap.forEach((item) => {
            const data = item.data();
            const voteId = item.id;
            const options = data.options || [];

            let optionsHtml = "";
            options.forEach((opt, idx) => {
                const votes = opt.votes || [];
                const userVoted = currentUser && votes.includes(currentUser.email);

                optionsHtml += `
                    <div class="poll-option ${userVoted ? 'selected' : ''}" onclick="castVote('${voteId}', ${idx})">
                        <span>${opt.text}</span>
                        <span class="vote-count">${votes.length} صوت</span>
                    </div>
                `;
            });

            let adminButtons = "";
            if (isAdmin) {
                adminButtons = `
                    <div class="admin-controls">
                        <a class="edit-btn" href="edit-vote.html?id=${voteId}"> تعديل</a>
                        <button class="delete-btn" onclick="deleteVote('${voteId}')"> حذف</button>
                    </div>
                `;
            }

            list.innerHTML += `
                <div class="poll-card">
                    <h3>${data.question}</h3>
                    <p style="color: gray; font-size: 0.9rem;"> ${data.date || ""}</p>
                    <div class="options-container">${optionsHtml}</div>
                    ${adminButtons}
                </div>
            `;
        });
    } catch (e) {
        console.error(e);
        list.innerHTML = "حدث خطأ أثناء تحميل التصويتات";
    }
}

window.castVote = async function(voteId, optionIndex) {
    if (!currentUser) {
        alert("يرجى تسجيل الدخول أولاً لتتمكن من التصويت");
        return;
    }

    try {
        const snap = await getDocs(collection(db, "votes"));
        let targetVote = null;
        snap.forEach(d => { if (d.id === voteId) targetVote = d.data(); });

        if (!targetVote) return;

        let options = targetVote.options;
        const userEmail = currentUser.email;

        // إزالة صوت المستخدم من أي خيار سابق
        options.forEach(opt => {
            opt.votes = (opt.votes || []).filter(e => e !== userEmail);
        });

        // تسجيل التصويت الجديد
        options[optionIndex].votes.push(userEmail);

        await updateDoc(doc(db, "votes", voteId), { options: options });
        loadVotes();
    } catch (err) {
        console.error("خطأ أثناء التصويت:", err);
    }
};

window.deleteVote = async function(id) {
    if (confirm("هل أنت متأكد من حذف هذا التصويت؟")) {
        await deleteDoc(doc(db, "votes", id));
        loadVotes();
    }
};

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    loadVotes();
});