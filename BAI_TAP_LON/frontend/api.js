const API="http://localhost:3000/api";

async function getData(url){

    const token=localStorage.getItem("token");

    const res=await fetch(API+url,{
        headers:{
            Authorization:"Bearer "+token
        }
    });

    return await res.json();

}

async function postData(url,data){

    const token=localStorage.getItem("token");

    const res=await fetch(API+url,{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
        },
        body:JSON.stringify(data)
    });

    return await res.json();

}

async function putData(url,data){

    const token=localStorage.getItem("token");

    const res=await fetch(API+url,{
        method:"PUT",
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
        },
        body:JSON.stringify(data)
    });

    return await res.json();

}

async function deleteData(url){

    const token=localStorage.getItem("token");

    const res=await fetch(API+url,{
        method:"DELETE",
        headers:{
            Authorization:"Bearer "+token
        }
    });

    return await res.json();

}