import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
    getFirestore, collection, getDocs, doc, deleteDoc
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

let isAdmin = false;
let usersMap = {}; // خريطة لتخزين أسماء المستخدمين عبر إيميلاتهم

// التحقق من صلاحية الأدمن وجلب بيانات أسماء المستخدمين
async function loadUsersData(user) {
    if (!user) return;
    try {
        const snap = await getDocs(collection(db, "users"));
        snap.forEach((docSnap) => {
            const data = docSnap.data();
            const emailKey = data.email?.toLowerCase().trim();
            if (emailKey) {
                // تخزين الاسم المقابل للإيميل
                usersMap[emailKey] = data.name || data.fullName || data.username || data.displayName || emailKey;
            }
            if (emailKey === user.email?.toLowerCase().trim() && data.role === "admin") {
                isAdmin = true;
            }
        });
    } catch (e) {
        console.error("خطأ في جلب بيانات المستخدمين:", e);
    }
}

// دالة مساعدة لتحويل الإيميل إلى اسم المستخدم
function getDisplayName(uploader) {
    if (!uploader) return "عضو";
    const cleanEmail = uploader.toLowerCase().trim();
    return usersMap[cleanEmail] || uploader;
}

// عرض قائمة الملفات
async function loadFiles(user) {
    await loadUsersData(user);

    const addBtn = document.getElementById("addFileBtn");
    if (addBtn) addBtn.style.display = "inline-block";

    const list = document.getElementById("filesList");
    if (!list) return;

    try {
        const snap = await getDocs(collection(db, "files"));
        list.innerHTML = "";

        if (snap.empty) {
            list.innerHTML = "<p style='text-align:center; color:#718096;'>لا توجد ملفات مرفوعة حالياً.</p>";
            return;
        }

        snap.forEach((item) => {
            const data = item.data();
            let adminBtn = "";

            if (isAdmin) {
                adminBtn = `
                    <button class="delete-btn" onclick="deleteFile('${item.id}')">
                         حذف
                    </button>
                `;
            }

            const fileHref = data.fileData || data.fileUrl || "#";
            const downloadAttr = data.fileName ? `download="${data.fileName}"` : `download`;

            // جلب الاسم سواء كان محفوظاً مسبقاً أو بمطابقة الإيميل
            const authorName = data.uploadedByName || getDisplayName(data.uploadedBy);

            list.innerHTML += `
                <div class="file-card">
                    <div class="file-info">
                        <div class="file-details">
                            <h3>${data.title}</h3>
                            <p>التاريخ: ${data.date || "غير محدد"} | 👤 بواسطة: ${authorName}</p>
                        </div>
                    </div>
                    <div class="file-actions">
                        <a class="download-btn" href="${fileHref}" ${downloadAttr} target="_blank">
                           تحميل / فتح الملف
                        </a>
                        ${adminBtn}
                    </div>
                </div>
            `;
        });
    } catch (e) {
        console.error(e);
        list.innerHTML = "حدث خطأ أثناء تحميل الملفات";
    }
}

// حذف الملف
window.deleteFile = async function(docId) {
    if (!confirm("هل أنت متأكد من حذف هذا الملف؟")) return;

    try {
        await deleteDoc(doc(db, "files", docId));
        alert("تم الحذف بنجاح");
        location.reload();
    } catch (error) {
        console.error("خطأ:", error);
    }
};

onAuthStateChanged(auth, (user) => {
    loadFiles(user);
});