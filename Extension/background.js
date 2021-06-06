
const notificationsByID = {};

chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
    if (!notificationsByID[ notifId ]) { return null }
    if(notificationsByID[ notifId ].password){
        if (btnIdx === 0) {
            let account ={
                username : notificationsByID[ notifId ].username,
                password : notificationsByID[ notifId ].password,
                key: "abcd",
                site : notificationsByID[ notifId ].website
            }
            console.log('inserting')
            try{
                fetch (`http://localhost:8080/users/${ notificationsByID[ notifId ].userEmail }/accounts`,{
                    method:'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body:JSON.stringify(account)
                })
            }catch(err){
                console.log(err);
            }
            delete notificationsByID[ notifId ] 
        } else if (btnIdx === 1) {
            
            delete notificationsByID[ notifId ] 
        }
    }else{
        if(btnIdx===0){
            try{
                fetch (`http://localhost:8080/users/${notificationsByID[notifId].userEmail}/accounts/${notificationsByID[notifId].website}`,{
                    method:'DELETE',
                    headers: {
                        'Content-Type':'application/json'
                    },
                })
            }catch(err){
                
            }
            chrome.runtime.sendMessage({message:'display'})
        }else{
            
            delete notificationsByID[ notifId ] 
        }
    }
});

chrome.notifications.onClosed.addListener((notifId) => {
    if (notificationsByID[ notifId ]) { delete notificationsByID[ notifId ]; }
});

const displayNotification=(userEmail, password, website,username) =>{
    chrome.notifications.create("", {
        type:    "basic",
        iconUrl: "./icon128.png",
        title:   "PERMISSION",
        requireInteraction: true,
        message: "Do you want save password for this site?",
        buttons: [{ title: "YES", }, { title: "NO", }]
    }, function(id) {
        notificationsByID[ id ] = { userEmail, password, website,username };
    })
}

const displayDeleteNotification=(userEmail, website) =>{
    chrome.notifications.create("", {
        type:    "basic",
        iconUrl: "./icon128.png",
        title:   "PERMISSION",
        requireInteraction: true,
        message: `Do you want to delete account for ${website}?`,
        buttons: [{ title: "YES", }, { title: "NO", }]
    }, function(id) {
        notificationsByID[ id ] = { userEmail, website };
    })
}


chrome.runtime.onMessage.addListener((message, sender, response)=>{
    if(message.message === 'showNotification'){
        console.log('received insert')
        displayNotification(message.userEmail,message.password, message.currentSite,message.username)
        response({status:"received"})    
    }else{
        displayDeleteNotification(message.userEmail,message.currentSite)
        response({status:"deleted"}) 
    }
})

// chrome.runtime.onMessage.addListener(async (message, sender, response)=>{
//     if(message.message==='deleteNotification'){
//         displayDeleteNotification(message.userEmail, message.currentSite)
//         response({status:"deleted"})
        
//     }
// })

// const displayDeleteNotification = (email, site)=>{
//     chrome.notifications.create("", {
//         type:    "basic",
//         iconUrl: "./icon128.png",
//         title:   "PERMISSION",
//         requireInteraction: true,
//         message: `Are you sure You want to delete the account for ${site}?`,
//         buttons: [{
//             title: "YES",
//         }, {
//             title: "NO",
//         }]
//     }, function(id) {
//         deleteNotificationID = id;
//     })

//     chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
//         if (notifId === deleteNotificationID) {
//             console.log('deleting')
//                 try{
//                     fetch (`http://localhost:8080/users/${email}/accounts/${site}`,{
//                         method:'DELETE',
//                         headers: {
//                             'Content-Type':'application/json'
//                         },
//                     })
//                 }catch(err){
                    
//                 }
//                 chrome.runtime.sendMessage({message:'display'})
//             } else if (btnIdx === 1) {
//                 console.log('clearing')
//                 chrome.notifications.clear(deleteNotificationID)
//             }
//         })
//     }

// const displayNotification=(userEmail, password, website,username) =>{
//     chrome.notifications.create("", {
//         type:    "basic",
//         iconUrl: "./icon128.png",
//         title:   "PERMISSION",
//         requireInteraction: true,
//         message: "Do you want to save password for this site?",
//         buttons: [{
//             title: "YES",
//         }, {
//             title: "NO",
//         }]
//     }, function(id) {
//         myNotificationID = id;
//     })
//     chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
//         if (notifId === myNotificationID) {
//             if (btnIdx === 0) {
//                 let account ={
//                     username : username,
//                     password : password,
//                     key: "abcd",
//                     site : website
//                 }
//                 console.log('inserting')
//                 try{
//                     fetch (`http://localhost:8080/users/${userEmail}/accounts`,{
//                         method:'POST',
//                         headers: {
//                             'Content-Type': 'application/json'
//                          },
//                         body:JSON.stringify(account)
//                     })
//                 }catch(err){
                    
//                 }
//                 chrome.notifications.onButtonClicked.removeListener()
//             } else if (btnIdx === 1) {
//                 console.log('clearing')
//                 chrome.notifications.onButtonClicked.removeListener()
//                 chrome.notifications.clear(myNotificationID)
//             }
//         }
//     })
// }