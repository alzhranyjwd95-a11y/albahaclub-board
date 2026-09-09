import {initializeApp}
    from
        "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


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
    from
        "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


import {
    getAuth,
    onAuthStateChanged
}
    from
        "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";



const firebaseConfig = {

    apiKey: "AIzaSyDRe0sxYnR7QVzhXkbR3H0ZhLcfxla7LgA",

    authDomain: "al-baha-literary-club-board.firebaseapp.com",

    projectId: "al-baha-literary-club-board",

    storageBucket: "al-baha-literary-club-board.firebasestorage.app",

    messagingSenderId: "451049449840",

    appId: "1:451049449840:web:9c3b9aca29d0c97b8287b5"

};



const app=initializeApp(firebaseConfig);


const db=getFirestore(app);


const auth=getAuth(app);



let isAdmin=false;



async function checkRole(){


    const user=auth.currentUser;


    if(!user)return;


    const q=query(

        collection(db,"users"),

        where("email","==",user.email)

    );


    const snap=await getDocs(q);


    snap.forEach(x=>{


        if(x.data().role=="admin"){

            isAdmin=true;

        }


    });


}




async function loadMinutes(){


    await checkRole();



    const list=document.getElementById("minutesList");


    if(!list)return;



    const snap=
        await getDocs(
            collection(db,"minutes")
        );



    list.innerHTML="";



    snap.forEach(item=>{


        let data=item.data();



        let buttons="";


        if(isAdmin){


            buttons=`

<br>

<a class="edit-btn"
href="edit-minute.html?id=${item.id}">

 تعديل

</a>


<button class="delete-btn"
onclick="deleteMinute('${item.id}')">

 حذف

</button>


`;

        }




        list.innerHTML+=`

<div class="card">


<h3>
${data.title}
</h3>


<p>
الاجتماع:
${data.meeting}
</p>


<p>
التاريخ:
${data.date}
</p>


<p>
${data.description}
</p>


${buttons}


</div>


`;

    });


}




window.addMinute = async function(){


    let titleValue =
        document.getElementById("title").value;


    let meetingValue =
        document.getElementById("meeting").value;


    let dateValue =
        document.getElementById("date").value;


    let descriptionValue =
        document.getElementById("description").value;



    await addDoc(

        collection(db,"minutes"),

        {

            title:titleValue,

            meeting:meetingValue,

            date:dateValue,

            description:descriptionValue

        }

    );



    alert("تم إضافة المحضر بنجاح");


    window.location.href="minutes.html";


};





window.deleteMinute=async function(id){


    if(confirm("حذف المحضر؟")){


        await deleteDoc(

            doc(db,"minutes",id)

        );


        location.reload();


    }


}





const params=
    new URLSearchParams(location.search);


const id=params.get("id");



async function loadEdit(){


    if(!id)return;


    const snap=
        await getDoc(
            doc(db,"minutes",id)
        );



    if(snap.exists()){


        let d=snap.data();



        title.value=d.title;

        meeting.value=d.meeting;

        date.value=d.date;

        description.value=d.description;



    }


}



window.updateMinute=async function(){


    await updateDoc(

        doc(db,"minutes",id),

        {

            title:title.value,

            meeting:meeting.value,

            date:date.value,

            description:description.value


        }

    );


    alert("تم التعديل");


    location.href="minutes.html";


}



loadEdit();


onAuthStateChanged(auth,()=>{

    loadMinutes();

});