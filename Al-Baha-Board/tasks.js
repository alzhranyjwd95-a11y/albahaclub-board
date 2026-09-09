import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    getDoc,
    updateDoc,
    query,
    where
}
    from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


import {
    getAuth,
    onAuthStateChanged
}
    from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";



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

const db = getFirestore(app);

const auth = getAuth(app);



let isAdmin=false;



// التحقق من الصلاحية
async function checkRole(){

    const user = auth.currentUser;


    if(!user){

        console.log("لا يوجد مستخدم");

        return;

    }



    const q=query(

        collection(db,"users"),

        where("email","==",user.email)

    );



    const snap=await getDocs(q);



    snap.forEach(item=>{


        console.log("بيانات المستخدم:", item.data());



        if(
            item.data().role &&
            item.data().role.toLowerCase()=="admin"
        ){

            isAdmin=true;

        }


    });


    console.log("صلاحية الادمن:",isAdmin);

}


// عرض المهام
async function loadTasks(){


    await checkRole();


    const list = document.getElementById("tasksList");


    if(!list) return;



    try{


        const snap = await getDocs(
            collection(db,"tasks")
        );


        console.log("عدد المهام:", snap.size);


        list.innerHTML="";



        snap.forEach((item)=>{


            let data=item.data();



            let buttons="";



            if(isAdmin){


                buttons=`

                <br>


                <a class="edit-btn"
                href="edit-task.html?id=${item.id}">

            تعديل

                </a>



                <button class="delete-btn"
                onclick="deleteTask('${item.id}')">

                حذف

                </button>

                `;


            }




            list.innerHTML += `


            <div class="card">


            <h3>
            ${data.title}
            </h3>



            <p>
            👤 المسؤول:
            ${data.assignedTo || "غير محدد"}
            </p>



            <p>
            📅 التاريخ:
            ${data.date || "غير محدد"}
            </p>



            <p>
            الحالة:
            ${data.status || "جديدة"}
            </p>



            <p>
            ${data.description || ""}
            </p>



            ${buttons}



            </div>


            `;


        });



    }

    catch(error){


        console.error(error);


        list.innerHTML =
            "خطأ في تحميل المهام";


    }


}

// إضافة مهمة

window.addTask = async function(){


    await addDoc(

        collection(db,"tasks"),

        {


            title:
            document.getElementById("title").value,


            assignedTo:
            document.getElementById("assignedTo").value,


            date:
            document.getElementById("date").value,


            status:
            document.getElementById("status").value,


            description:
            document.getElementById("description").value


        }

    );



    alert("تم إضافة المهمة");


    location.href="tasks.html";

};





// حذف

window.deleteTask=async function(id){


    if(confirm("حذف المهمة؟")){


        await deleteDoc(

            doc(db,"tasks",id)

        );


        location.reload();

    }

};




// تعديل

const params=
    new URLSearchParams(location.search);


const taskId=params.get("id");




async function loadEdit(){


    if(!taskId)return;


    const snap=
        await getDoc(

            doc(db,"tasks",taskId)

        );



    if(snap.exists()){


        let d=snap.data();


        document.getElementById("title").value=d.title || "";

        document.getElementById("assignedTo").value=d.assignedTo || "";

        document.getElementById("date").value=d.date || "";

        document.getElementById("status").value=d.status || "";

        document.getElementById("description").value=d.description || "";


    }

}




window.updateTask=async function(){


    await updateDoc(

        doc(db,"tasks",taskId),

        {


            title:
            document.getElementById("title").value,


            assignedTo:
            document.getElementById("assignedTo").value,


            date:
            document.getElementById("date").value,


            status:
            document.getElementById("status").value,


            description:
            document.getElementById("description").value


        }

    );



    alert("تم تعديل المهمة");


    location.href="tasks.html";


};





loadEdit();


onAuthStateChanged(auth,(user)=>{


    console.log("User:",user);


    loadTasks();


});