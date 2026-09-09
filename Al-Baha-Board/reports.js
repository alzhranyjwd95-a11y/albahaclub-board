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
let usersMap = {};

// جلب المستخدمين وبناء الخريطة
async function loadUsersData(user) {
    try {
        const snap = await getDocs(collection(db, "users"));
        snap.forEach((docSnap) => {
            const data = docSnap.data();

            // محاولة التقاط الإيميل سواء كان حقلاً أو هو الـ ID الخاص بالمستند
            const emailKey = (data.email || (docSnap.id.includes("@") ? docSnap.id : "")).toLowerCase().trim();

            // فحص جميع الاحتمالات الممكنة لحقل الاسم
            const detectedName = data.name || data.fullName || data.fullname || data.userName || data.username || data.displayName || data.arabicName;

            if (emailKey && detectedName) {
                usersMap[emailKey] = detectedName;
            }

            // التحقق من صلاحية الأدمن
            if (user && emailKey === user.email?.toLowerCase().trim() && data.role === "admin") {
                isAdmin = true;
            }
        });

        console.log("خريطة المستخدمين المحملة:", usersMap); // لمعاينة الأسماء في الكونسول
    } catch (e) {
        console.error("خطأ في جلب بيانات المستخدمين:", e);
    }
}

// استخراج الاسم
function getDisplayName(uploader) {
    if (!uploader) return "الإدارة";
    const cleanEmail = uploader.toLowerCase().trim();
    return usersMap[cleanEmail] || uploader;
}

// جلب وعرض التقارير
async function loadReports(user) {
    await loadUsersData(user);

    const addBtn = document.getElementById("addReportBtn");
    if (addBtn && isAdmin) addBtn.style.display = "inline-flex";

    const list = document.getElementById("reportsList");
    if (!list) return;

    try {
        const snap = await getDocs(collection(db, "reports"));
        list.innerHTML = "";

        if (snap.empty) {
            list.innerHTML = "<p style='text-align:center; color:#718096;'>لا توجد تقارير منشورة حالياً.</p>";
            return;
        }

        snap.forEach((item) => {
            const data = item.data();
            let adminButtons = "";

            if (isAdmin) {
                adminButtons = `
                    <div style="display:flex; gap:8px; margin-top:8px;">
                        <a class="edit-btn" href="edit-report.html?id=${item.id}">
                             تعديل
                        </a>
                        <button class="delete-btn" onclick="deleteReport('${item.id}')">
                            ️ حذف
                        </button>
                    </div>
                `;
            }

            const fileHref = data.fileData || data.fileUrl || "#";
            const downloadAttr = data.fileName ? `download="${data.fileName}"` : `download`;

            // جلب الاسم من الحقل المباشر أو عبر الخريطة
            const authorName = data.uploadedByName || getDisplayName(data.uploadedBy);

            list.innerHTML += `
                <div class="report-card">
                    <div class="report-info">
                        <span class="report-icon"></span>
                        <div class="report-details">
                            <h3>${data.title}</h3>
                            <div class="report-meta">
                                <span> تاريخ التقرير: <b>${data.reportDate || data.date || "غير محدد"}</b></span>
                                &nbsp;|&nbsp;
                                <span>👤 بواسطة: ${authorName}</span>
                            </div>
                            ${data.description ? `<p class="report-desc">${data.description}</p>` : ""}
                        </div>
                    </div>
                    <div class="report-actions">
                        <a class="download-btn" href="${fileHref}" ${downloadAttr} target="_blank">
                          تحميل / فتح التقرير
                        </a>
                        ${adminButtons}
                    </div>
                </div>
            `;
        });
    } catch (e) {
        console.error(e);
        list.innerHTML = "حدث خطأ أثناء تحميل التقارير";
    }
}

// حذف التقرير
window.deleteReport = async function(docId) {
    if (!confirm("هل أنت متأكد من حذف هذا التقرير؟")) return;

    try {
        await deleteDoc(doc(db, "reports", docId));
        alert("تم حذف التقرير بنجاح");
        location.reload();
    } catch (error) {
        console.error("خطأ بالحذف:", error);
    }
};

onAuthStateChanged(auth, (user) => {
    loadReports(user);
});