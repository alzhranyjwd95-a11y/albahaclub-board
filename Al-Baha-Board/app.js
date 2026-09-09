import { initializeApp } from
        "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updatePassword
} from
        "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    getDoc,
    updateDoc,
    addDoc
} from
        "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";



// Firebase

const firebaseConfig = {

    apiKey: "AIzaSyDRe0sxYnR7QVzhXkbR3H0ZhLcfxla7LgA",

    authDomain: "al-baha-literary-club-board.firebaseapp.com",

    projectId: "al-baha-literary-club-board",

    storageBucket: "al-baha-literary-club-board.firebasestorage.app",

    messagingSenderId: "451049449840",

    appId: "1:451049449840:web:9c3b9aca29d0c97b8287b5"

};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);





// تسجيل الدخول

window.login = function(){


    let email =
        document.getElementById("email").value;


    let password =
        document.getElementById("password").value;



    signInWithEmailAndPassword(auth,email,password)

        .then(()=>{

            window.location.href="dashboard.html";

        })

        .catch(()=>{

            document.getElementById("error").innerHTML =
                "البريد الإلكتروني أو كلمة المرور غير صحيحة";

        });


};







// صفحة الاجتماعات

async function showMeetingsPage(){


    let list =
        document.getElementById("meetingsList");


    if(!list) return;



    let isAdmin = false;



    // 1- المستخدم الحالي

    const user = auth.currentUser;



    // 2- قراءة الصلاحية

    if(user){


        const q = query(

            collection(db,"users"),

            where("email","==",user.email)

        );


        const snap = await getDocs(q);



        snap.forEach((item)=>{


            let data=item.data();



            // 3- تحديد الادمن

            if(data.role.trim().toLowerCase()=="admin"){

                isAdmin=true;

            }


        });


    }



    // 4- زر الإضافة

    let addButton =
        document.getElementById("addMeetingLink");


    if(addButton){

        addButton.style.display =
            isAdmin ? "block" : "none";

    }





    // 5- عرض الاجتماعات


    const snapshot =
        await getDocs(collection(db,"meetings"));



    list.innerHTML="";



    snapshot.forEach((item)=>{


        let data=item.data();



        let buttons="";



        if(isAdmin){


            buttons = `

            <br><br>

            <button class="edit-btn"
            onclick="editMeeting('${item.id}')">

             تعديل

            </button>


            <button class="delete-btn"
            onclick="deleteMeeting('${item.id}')">

             حذف

            </button>

            `;


        }





        let link="";


        if(data.meetingLink){


            link=`

            <a href="${data.meetingLink}" target="_blank">

            <button class="add-btn">

            🟢 دخول الاجتماع

            </button>

            </a>

            `;


        }



        list.innerHTML += `


        <div class="card">


        <h3>${data.title}</h3>


        <p>التاريخ: ${data.date}</p>


        <p>الحالة: ${data.status}</p>


        ${link}


        ${buttons}


        </div>


        `;


    });


}




onAuthStateChanged(auth, async(user)=>{


    if(user){


        // جلب بيانات المستخدم

        const q = query(

            collection(db,"users"),

            where("email","==",user.email)

        );


        const result = await getDocs(q);

        let isAdmin = false;



        result.forEach((item)=>{


            let data = item.data();



            let nameBox =
                document.getElementById("userName");

            let topNameBox =
                document.getElementById("topUserName");


            let roleBox =
                document.getElementById("userRole");

            let topRoleBox =
                document.getElementById("topUserRole");



            if(nameBox){

                nameBox.innerHTML =
                    "مرحبًا، " + (data.name || user.email.split('@')[0]);

            }

            if(topNameBox){

                topNameBox.innerHTML =
                    data.name || user.email.split('@')[0];

            }



            if(roleBox){

                roleBox.innerHTML =
                    data.role;

            }

            if(data.role && data.role.trim().toLowerCase() === "admin"){
                isAdmin = true;
                if(topRoleBox) topRoleBox.innerHTML = "admin";
            } else {
                if(topRoleBox) topRoleBox.innerHTML = "عضو مجلس";
            }


        });

        // إظهار الإجراءات السريعة فقط للأدمن
        const quickCard = document.getElementById("quickActionsCard");
        const topGrid = document.querySelector(".grid-row-top");

        if(quickCard){
            if(isAdmin){
                quickCard.style.display = "block";
                if(topGrid) topGrid.style.gridTemplateColumns = "1fr 2fr";
            } else {
                quickCard.style.display = "none";
                if(topGrid) topGrid.style.gridTemplateColumns = "1fr";
            }
        }



        // تشغيل صفحة الاجتماعات

        showMeetingsPage();


    }


});
// زر تراجع في تعديل الاجتماع

window.goBackMeetings = function(){

    window.location.href="meetings.html";

};





// حذف

window.deleteMeeting = async function(id){


    if(confirm("هل تريد حذف الاجتماع؟")){


        await deleteDoc(

            doc(db,"meetings",id)

        );


        location.reload();

    }


};






// تعديل

window.editMeeting=function(id){


    window.location.href =
        "edit-meeting.html?id="+id;


};







// تحميل صفحة التعديل

const params =
    new URLSearchParams(window.location.search);


const meetingId =
    params.get("id");



async function loadEditMeeting(){


    if(!meetingId) return;


    const snap =
        await getDoc(
            doc(db,"meetings",meetingId)
        );


    if(snap.exists()){


        let data=snap.data();



        document.getElementById("title").value=data.title || "";

        document.getElementById("date").value=data.date || "";

        document.getElementById("status").value=data.status || "";

        document.getElementById("link").value=data.meetingLink || "";


    }


}


loadEditMeeting();






// حفظ التعديل

window.updateMeeting=async function(){


    await updateDoc(

        doc(db,"meetings",meetingId),

        {

            title:
            document.getElementById("title").value,


            date:
            document.getElementById("date").value,


            status:
            document.getElementById("status").value,


            meetingLink:
            document.getElementById("link").value

        }

    );


    alert("تم تعديل الاجتماع");


    window.location.href="meetings.html";


};
// إضافة اجتماع جديد



window.addMeeting = async function(){


    let title =
        document.getElementById("title").value;


    let date =
        document.getElementById("date").value;


    let status =
        document.getElementById("status").value;


    let link =
        document.getElementById("link").value;



    await addDoc(

        collection(db,"meetings"),

        {

            title:title,

            date:date,

            status:status,

            meetingLink:link

        }

    );



    alert("تم إضافة الاجتماع بنجاح");


    window.location.href="meetings.html";


};
// =========================
// لوحة التحكم
// =========================


// الاجتماعات

async function loadDashboardMeetings(){

    let box=document.getElementById("nextMeeting");
    let nextTitle = document.getElementById("nextMeetingTitle");
    let nextDate = document.getElementById("nextMeetingDate");
    let nextTime = document.getElementById("nextMeetingTime");

    if(!box && !nextTitle) return;


    const snapshot =
        await getDocs(collection(db,"meetings"));


    if(snapshot.empty){

        if(box) box.innerHTML="لا توجد اجتماعات";
        if(nextTitle) nextTitle.innerText="لا توجد اجتماعات مجدولة";
        return;

    }


    snapshot.forEach((item)=>{

        let data=item.data();

        if(box){
            box.innerHTML=
                `
            ${data.title}
            <br>
            التاريخ: ${data.date}
            <br>
            الحالة: ${data.status}
            `;
        }

        if(nextTitle) nextTitle.innerText = data.title || "اجتماع مجلس الإدارة";
        if(nextDate) nextDate.innerText = "📅 " + (data.date || "غير محدد");
        if(nextTime) nextTime.innerText = "⏰ " + (data.time || data.status || "");

    });


}


loadDashboardMeetings();





// القرارات

async function loadDecisions(){

    let box=document.getElementById("lastDecision");
    let latestList = document.getElementById("latestDecisions");

    if(!box && !latestList) return;


    const snapshot =
        await getDocs(collection(db,"decisions"));


    if(snapshot.empty){

        if(box) box.innerHTML="لا توجد قرارات";
        if(latestList) latestList.innerHTML="<li class='activity-item' style='cursor:default;'>لا توجد قرارات حالياً</li>";
        return;

    }

    if(latestList) latestList.innerHTML = "";

    let count = 0;
    snapshot.forEach((item)=>{

        let data=item.data();

        if(box){
            box.innerHTML=
                `
            ${data.title}
            <br>
            التاريخ: ${data.date}
            <br>
            الحالة: ${data.status}
            `;
        }

        if(latestList && count < 3){
            latestList.innerHTML += `
                <li class="activity-item" onclick="window.location.href='decisions.html'" style="cursor: pointer;">
                    <span class="title">${data.title}</span>
                    <span class="meta">${data.date || ""}</span>
                </li>
            `;
            count++;
        }

    });


}


loadDecisions();






// المهام

async function loadTasks(){

    let box=document.getElementById("tasksCount");
    let latestList = document.getElementById("latestTasks");

    if(!box && !latestList) return;


    const snapshot =
        await getDocs(collection(db,"tasks"));

    if(box){
        box.innerHTML =
            snapshot.size + " مهام مفتوحة";
    }

    if(latestList){
        latestList.innerHTML = "";
        if(snapshot.empty){
            latestList.innerHTML = "<li class='activity-item' style='cursor:default;'>لا توجد مهام حالياً</li>";
        } else {
            let count = 0;
            snapshot.forEach((item)=>{
                if(count < 3){
                    let data = item.data();
                    latestList.innerHTML += `
                        <li class="activity-item" onclick="window.location.href='tasks.html'" style="cursor: pointer;">
                            <span class="title">${data.title}</span>
                            <span class="meta">${data.status || "جديدة"}</span>
                        </li>
                    `;
                    count++;
                }
            });
        }
    }


}


loadTasks();






// التصويتات

async function loadVotes(){

    let box=document.getElementById("votesCount");

    if(!box) return;


    const snapshot =
        await getDocs(collection(db,"votes"));


    if(snapshot.empty){

        box.innerHTML="لا توجد تصويتات نشطة";
        return;

    }


    snapshot.forEach((item)=>{


        let data=item.data();


        box.innerHTML=

            `
        ${data.question}
        <br>
        الحالة: ${data.status || "نشط"}
        <br>
        موافق: ${data.Yes || 0}
        | غير موافق: ${data.No || 0}
        | ممتنع: ${data.abstain || 0}
        `;


    });


}


loadVotes();



// أحدث المستندات

async function loadLatestFiles(){
    const list = document.getElementById("latestFiles");
    if(!list) return;

    try {
        const snap = await getDocs(collection(db, "files"));
        list.innerHTML = "";
        if (snap.empty) {
            list.innerHTML = "<li class='activity-item' style='cursor:default;'>لا توجد ملفات حالياً</li>";
            return;
        }
        let count = 0;
        snap.forEach((docSnap) => {
            if (count < 3) {
                const d = docSnap.data();
                const fileHref = d.fileData || d.fileUrl || "";
                const clickAction = fileHref ? `window.open('${fileHref}', '_blank')` : `window.location.href='files.html'`;

                list.innerHTML += `
                    <li class="activity-item" onclick="${clickAction}" style="cursor: pointer;">
                        <span class="title">📄 ${d.title || d.fileName || "مستند"}</span>
                        <span class="meta">${d.date || ""}</span>
                    </li>
                `;
                count++;
            }
        });
    } catch (err) {
        console.error("خطأ في جلب الملفات:", err);
    }
}

loadLatestFiles();



// ==========================================
// وظائف القائمة والإعدادات (تغيير كلمة السر وتسجيل الخروج)
// ==========================================

// فتح/إغلاق القائمة المنسدلة
window.toggleDropdown = function(){
    const dropdown = document.getElementById("userDropdown");
    if(dropdown){
        dropdown.classList.toggle("show");
    }
};

// إغلاق القائمة عند الضغط بالخارج
window.addEventListener("click", function(event){
    if (!event.target.closest('.user-profile-container') && !event.target.closest('.user-box')) {
        const dropdown = document.getElementById("userDropdown");
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
});

// نافذة تغيير كلمة المرور
window.openPasswordModal = function(){
    const modal = document.getElementById("passwordModal");
    if(modal) modal.classList.add("show");
    const dropdown = document.getElementById("userDropdown");
    if(dropdown) dropdown.classList.remove("show");
};

window.closePasswordModal = function(){
    const modal = document.getElementById("passwordModal");
    if(modal) modal.classList.remove("show");
};

// تحديث كلمة المرور في فايربيس
window.changePassword = async function(){
    const newPass = document.getElementById("newPassword").value;
    if(!newPass || newPass.length < 6){
        alert("كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام");
        return;
    }

    try {
        await updatePassword(auth.currentUser, newPass);
        alert("تم تغيير كلمة المرور بنجاح");
        closePasswordModal();
    } catch(error){
        console.error(error);
        alert("حدث خطأ أثناء تغيير كلمة المرور: " + (error.message || "يرجى المحاولة مجدداً"));
    }
};

// تسجيل الخروج
window.logout = async function(){
    if(confirm("هل تريد تسجيل الخروج؟")){
        await signOut(auth);
        window.location.href = "index.html";
    }
};