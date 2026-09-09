import { initializeApp } from
        "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


import {
    getAuth,
    onAuthStateChanged
}
    from
        "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    deleteDoc,
    doc,
    addDoc,
    updateDoc,
    getDoc
}
    from
        "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";



const firebaseConfig = {

    apiKey:"AIzaSyDRe0sxYnR7QVzhXkbR3H0ZhLcfxla7LgA",

    authDomain:
        "al-baha-literary-club-board.firebaseapp.com",

    projectId:
        "al-baha-literary-club-board",

    storageBucket:
        "al-baha-literary-club-board.firebasestorage.app",

    messagingSenderId:
        "451049449840",

    appId:
        "1:451049449840:web:9c3b9aca29d0c97b8287b5"

};



const app = initializeApp(firebaseConfig);

const auth=getAuth(app);

const db=getFirestore(app);





async function loadDecisions(){


    const list=document.getElementById("decisionsList");


    if(!list) return;



    let isAdmin=false;


    const user=auth.currentUser;



    if(user){


        const q=query(

            collection(db,"users"),

            where("email","==",user.email)

        );



        const snap=await getDocs(q);



        snap.forEach((item)=>{


            let data=item.data();



            if(data.role.toLowerCase()=="admin"){

                isAdmin=true;

            }


        });


    }





    const snapshot=
        await getDocs(collection(db,"decisions"));



    list.innerHTML="";



    snapshot.forEach((item)=>{


        let data=item.data();



        let buttons="";



        if(isAdmin){


            buttons=`

<br>

<button class="edit-btn"
onclick="editDecision('${item.id}')">

 تعديل

</button>


<button class="delete-btn"
onclick="deleteDecision('${item.id}')">

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
التاريخ: ${data.date}
</p>


<p>
الحالة: ${data.status}
</p>


<p>
${data.description || ""}
</p>


${buttons}


</div>


`;


    });


}




onAuthStateChanged(auth,()=>{

    loadDecisions();

});





window.deleteDecision = async function(id){


    if(confirm("هل تريد حذف القرار؟")){


        await deleteDoc(

            doc(db,"decisions",id)

        );


        location.reload();


    }


};
// إضافة قرار جديد

window.addDecision = async function(){


    let title =
        document.getElementById("title").value;


    let date =
        document.getElementById("date").value;


    let status =
        document.getElementById("status").value;


    let description =
        document.getElementById("description").value;



    await addDoc(

        collection(db,"decisions"),

        {

            title:title,

            date:date,

            status:status,

            description:description

        }

    );



    alert("تم إضافة القرار بنجاح");



    window.location.href="decisions.html";


};
// تعديل القرار


const params =
    new URLSearchParams(window.location.search);


const decisionId =
    params.get("id");



async function loadEditDecision(){


    if(!decisionId) return;



    const snap =
        await getDoc(
            doc(db,"decisions",decisionId)
        );



    if(snap.exists()){


        let data=snap.data();



        document.getElementById("title").value =
            data.title || "";


        document.getElementById("date").value =
            data.date || "";


        document.getElementById("status").value =
            data.status || "";


        document.getElementById("description").value =
            data.description || "";


    }



}



loadEditDecision();





window.updateDecision = async function(){


    await updateDoc(

        doc(db,"decisions",decisionId),

        {


            title:
            document.getElementById("title").value,


            date:
            document.getElementById("date").value,


            status:
            document.getElementById("status").value,


            description:
            document.getElementById("description").value


        }


    );



    alert("تم تعديل القرار بنجاح");


    window.location.href="decisions.html";


};
// فتح صفحة تعديل القرار

window.editDecision = function(id){

    window.location.href =
        "edit-decision.html?id=" + id;

};
// زر تراجع في تعديل القرار

window.goBackDecisions = function(){

    window.location.href="decisions.html";

};