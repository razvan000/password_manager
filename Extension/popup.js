const loggedUser = document.querySelector('#logged-email')
const currentHost = document.querySelector('#currentWebsite')
const passwordToCopy=document.querySelector('#hiddenPassword')
const clipboardBtn = document.querySelector('#clipboardPNG')
const deleteAccountBtn = document.querySelector('#deleteAccountBtn')
chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    let url = tabs[0].url;
    currentHost.value=url.split('/')[2]
    chrome.storage.sync.get(["Logged"], async (result) =>{
        try{
            const response =await fetch(`http://localhost:8080/users/${Object.values(result)[0]}/accounts/${url.split('/')[2]}`,{
            method: 'GET',
        });
        const data = await response.json(); 
        if(data){
            if(data.password){
                passwordToCopy.value = data.password
            }else{
                passwordToCopy.type='text'
                passwordToCopy.value = 'No Password Saved'
                passwordToCopy.style.border='none'
                clipboardBtn.style.visibility = 'hidden'
                deleteAccountBtn.style.visibility = 'hidden'
            }
        }
        }catch(err){

        }
    })
});
const displayLayout=()=>{
   chrome.storage.sync.get(["Logged"], (result) =>{
        if(Object.keys(result).length !== 0){
            document.querySelector('.Sign-up').style.display='none'
            document.querySelector('.Logged-in').style.display='block'
            loggedUser.innerHTML=Object.values(result)[0]
        }else{
            document.querySelector('.Logged-in').style.display='none'
            document.querySelector('.Sign-up').style.display='block'
        }
    })
}

displayLayout()

const loginBtn = document.querySelector("#btnLog")
const btnCreateAccount = document.querySelector('#btnCreateAccount')
const btnRegister = document.querySelector('#btnRegister')
const btnCancel = document.querySelector('#cancel')
const btnLogout = document.querySelector('#logoutBtn')
const loggingSection = document.querySelector('#credentials')
const registerSection = document.querySelector('#userRegister')
const loginEmail = document.querySelector('#loginName')
const loginPassword = document.querySelector('#loginPass')
const registerEmaill = document.querySelector('#registerUsername')
const registerPassword = document.querySelector('#registerPassword')
const registerPasswordConfirm = document.querySelector('#registerPasswordConfirm')

btnCreateAccount.addEventListener("click",()=>{
    loggingSection.classList.remove('active')
    loggingSection.classList.add('inactive')
    registerSection.classList.remove('inactive')
    registerSection.classList.add('active')
    
})

btnCancel.addEventListener("click",()=>{
    registerSection.classList.remove('active')
    registerSection.classList.add('inactive')
    loggingSection.classList.remove('inactive')
    loggingSection.classList.add('active')
})

loginBtn.addEventListener("click",async ()=>{
    let email = loginEmail.value
    let password = loginPassword.value
    let user= {
        email:email,
        password:password
    }
    try{
        let response = await fetch ('http://localhost:8080/users/login',{
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
              },
            body:JSON.stringify(user)
        })
        const data = await response.json()
        if(data.message === "Accepted"){
            chrome.storage.sync.set({'Logged':email})
            loggedUser.value=email
            displayLayout()
        }else{
            document.querySelector('#errorToastLog').classList.add('show')
            setTimeout(() => {
                document.querySelector('#errorToastLog').classList.remove('show')
            }, 3500);
        }
    }catch(err){
        console.warn(err)
    }
})


btnRegister.addEventListener("click",async ()=>{
    let email = registerEmaill.value
    let password = registerPassword.value
    let confirmPass = registerPasswordConfirm.value
    if(!(email.includes('@') && email.includes('.'))){
        document.querySelector('#errorInvalidEmail').classList.add('show')
            setTimeout(() => {
                document.querySelector('#errorInvalidEmail').classList.remove('show')
            }, 3500);
    }else if(password.length >=6){
        if(password === confirmPass){
            let user= {
                email:email,
                password:password
            }
            try{
                let response = await fetch ('http://localhost:8080/users',{
                    method:'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body:JSON.stringify(user)
                })
                const data = await response.json()
                if(data.message === "created"){
                    chrome.storage.sync.set({'Logged':email})
                    loggedUser.value=email
                    displayLayout()
                }else{
                    document.querySelector('#errorServer').classList.add('show')
                    setTimeout(() => {
                        document.querySelector('#errorServer').classList.remove('show')
                    }, 3500);
                }
            }catch(err){
                console.warn(err)
            }
        }else{
            document.querySelector('#errorPasswordsMatch').classList.add('show')
                    setTimeout(() => {
                        document.querySelector('#errorPasswordsMatch').classList.remove('show')
                    }, 3500);
        }
    }else{
        document.querySelector('#errorShortPassword').classList.add('show')
                    setTimeout(() => {
                        document.querySelector('#errorShortPassword').classList.remove('show')
                    }, 3500);
    }
})

btnLogout.addEventListener("click",()=>{
    chrome.storage.sync.remove(["Logged"])
    displayLayout()
})

clipboardBtn.addEventListener("click",()=>{
    navigator.clipboard.writeText(passwordToCopy.value)
})

deleteAccountBtn.addEventListener("click",()=>{
    console.log('deleting')
    chrome.runtime.sendMessage({message : 'deleteNotification', userEmail: loggedUser.innerText,currentSite :currentHost.value},
        function(response){
            if(response.status==='deleted'){
                chrome.runtime.onMessage.addListener(function(request, sender) {
                if (request.message === "display"){
                    document.querySelector('#successDeleteAccount').classList.add('show')
                    setTimeout(() => {
                        document.querySelector('#successDeleteAccount').classList.remove('show')
                    }, 3500);
                    passwordToCopy.type='text'
                    passwordToCopy.value = 'No Password Saved'
                    passwordToCopy.style.border='none'
                    clipboardBtn.style.visibility = 'hidden'
                    deleteAccountBtn.style.visibility = 'hidden'
                }
            })
            // return true
        }
    })
    
})