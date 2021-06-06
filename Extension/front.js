//at every new site entry: 
//fetch account -> if available use data to fill fields ->using storage sync for user name and currentWebsite for site
// else-> get submit buttons and password fields and on click ask for saving
var isNewAccount=false
async function checkNewAccount(site, email){
    try{
        const response =await fetch(`http://localhost:8080/users/${email}/accounts/${site}`,{
            method: 'GET',
        })
        const data = await response.json()
        if(data.hasOwnProperty('message')){
            isNewAccount = true
        }
        else isNewAccount = false
    }catch(err){
        
    }
}
checkNewAccount()
async function fetchAcc(site, email){
    try{
        const response =await fetch(`http://localhost:8080/users/${email}/accounts/${site}`,{
            method: 'GET',
        });
        const data = await response.json();
        if(data)
            return data;
        else return {}
    }catch(err){
        console.error("not working", err)
    }
}
async function processAcc(site,email){
    const account = await fetchAcc(site,email)
    if(account){
        console.log(account.password)
    }
}

// async function insertAccount ()

let userData ={
    "mainEmail":"",
    "currentWebsite":"",
    "username":"",
    "password":"",
    "key":""
}

chrome.storage.sync.get(["Logged"],async (result)=>{
    // userData.mainEmail=result
    userData.mainEmail= await Object.values(result)[0]
    userData.currentWebsite = window.location.href.split('/')[2]
    console.log(userData.mainEmail)
    processAcc(userData.currentWebsite,userData.mainEmail)

    let passwordInput
    let userNameInput
    let passFields=document.getElementsByTagName("input");
    for(let i=0; i< passFields.length;i++){
        // console.log(passFields[i])
        
        if (passFields[i].type.toLowerCase()==='password'){
            try{
                const response =await fetch(`http://localhost:8080/users/${userData.mainEmail}/accounts/${userData.currentWebsite}`,{
                method: 'GET',
            });
            const data = await response.json();
            
            if(!data.hasOwnProperty('message')){
                console.log(data.password)
                passFields[i].value = data.password
            }else {
                passFields[i].value = ''
                isNewAccount = true
            }
            }catch(err){

            }
            
            if(i==0){
                userNameInput = null
            }else{
                userNameInput = passFields[i-1]
            }
            passwordInput = passFields[i]
            userData.password="has password"
            break
        }
    }

    let buttons = document.getElementsByTagName("button")

    if(userData.password==='has password'){
        for(let i=0;i<buttons.length; i++){
        if(buttons[i].value.toString().toLowerCase().includes("log") || buttons[i].value.toString().toLowerCase().includes("register")
        || buttons[i].value.toString().includes("create") || buttons[i].type === 'submit'){
            if(isNewAccount){
                buttons[i].addEventListener("click",()=>{
                    let usernameMessage=""
                    if(!userNameInput.value){
                        usernameMessage=userData.mainEmail
                    }else{
                        usernameMessage=userNameInput.value
                    }
                    chrome.runtime.sendMessage({message : 'showNotification', password: passwordInput.value, userEmail: userData.mainEmail,
                                                currentSite : userData.currentWebsite,  username :usernameMessage },function(response){console.log(response)})
                })
            }
        }
        let childNodes = buttons[i].childNodes
        console.log(childNodes)
        if(childNodes){
            for(node of childNodes){
                if(node.innerText){
                    if (node.innerText.toString().toLowerCase().includes('log') || node.innerText.toString().toLowerCase().includes('register')){
                        if(isNewAccount){
                            buttons[i].addEventListener("click",()=>{
                            let usernameMessage=""
                            console.log(userData.mainEmail)
                            if(!userNameInput.value){
                                usernameMessage=userData.mainEmail
                            }else{
                                usernameMessage=userNameInput.value
                            }                      
                            chrome.runtime.sendMessage({message : 'showNotification', password: passwordInput.value, userEmail: userData.mainEmail,
                                                        currentSite : userData.currentWebsite,  username :usernameMessage },function(response){})
                            })
                        }
                    }
                }
            }
        }
        }
        // for(let i=0;i<passFields.length;i++){
        //     if(passFields[i].type==='submit'){
        //         if(isNewAccount){
        //             passFields[i].addEventListener("click",()=>{
        //                 let usernameMessage=""
        //                 if(!userNameInput.value){
        //                     usernameMessage=userData.mainEmail
        //                 }else{
        //                     usernameMessage=userNameInput.value
        //                 }
        //                 chrome.runtime.sendMessage({message : 'showNotification', password: passwordInput.value, userEmail: userData.mainEmail,
        //                                             currentSite : userData.currentWebsite,  username :usernameMessage },function(response){})
        //             })
        //         }
        //     }
        // }
    }
})



// let passwordInput
// let passFields=document.getElementsByTagName("input");
// for(let i=0; i< passFields.length;i++){
//     // console.log(passFields[i])
    
//     if (passFields[i].type.toLowerCase()==='password'){
//         passFields[i].value='razvan'
//         passwordInput = passFields[i]
//         userData.password="yes"
//         console.log("has password")
//         // alert(passFields[i].name)
//     }
// }

// let buttons = document.getElementsByTagName("button")

// for(let i=0;i<buttons.length; i++){
//     if(buttons[i].value.toString().includes("log") || buttons[i].type === 'submit'){
//         buttons[i].addEventListener("click",()=>alert("tried to log"))
//     }
// }


// if(userData.password==='yes'){
//     for(let i=0;i<buttons.length; i++){
//     if(buttons[i].value.toString().includes("log") || buttons[i].type === 'submit'){
//         buttons[i].addEventListener("click",()=>{
//            chrome.runtime.sendMessage({message : 'showNotification', password: passwordInput.value, userEmail:  },function(response){})
//         })
//     }
// }
// }
    // for(let i=0; i< passFields.length;i++){
    //     if (passFields[i].type.toLowerCase()==='submit'){
    //         passFields[i].addEventListener("click", ()=>{
    //             chrome.notifications.create("", {
    //                 type:    "basic",
    //                 iconUrl: "./icon16.png",
    //                 title:   "REMINDER",
    //                 message: "It's time to go to this super-cool site !\nProceed ?",
    //                 contextMessage: "It's about time...",
    //                 buttons: [{
    //                     title: "Yes, get me there",
    //                 }, {
    //                     title: "Get out of my way",
    //                 }]
    //             }, function(id) {
    //                 myNotificationID = id;
    //             })
    //         })
    //     }
    // }

        


// //for log session
// chrome.storage.sync.set({"Test":"Logged"},()=>console.log("Set token"))

// chrome.storage.sync.get(["Test"], (result)=>console.log(result))
// chrome.storage.sync.remove(["Test"],(result)=>console.log("Removed"))
// //TO-DO:
// // when logging in -> set to synced storage the object: "Logged:Username"
