export function toHex(message){
    let result=''
    for (let i=0;i<message.length;i++){
        result+=message[i].toString(16).padStart(2,'0')
    }
    return result
}

export function printText(message){
    let result=''
    for (let i=0;i<message.length;i++){
        result+=String.fromCharCode(message[i])
    }
    console.log(result)
}

export function getCharcodeArray(hexVal) {
    var commaSeperated = '';
  
    for (var i = 0; i < hexVal.length; i++) {
      commaSeperated += hexVal.charAt(i);
      commaSeperated += (i % 2 == 1 && i != (hexVal.length - 1)) ? ',' : '';
    }

    let array= commaSeperated.split(',');
    for(let i=0;i<array.length;i++){
        array[i]=parseInt(array[i],16)
    }
    return array
}

export function generateKey(password){
    const characters = "abcdefghijklmnopqrstuvwxyz/,.-+=~`<>ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:|[](){}:;'"
    let key =""
    let passLength = password.length
    if(passLength%10===passLength){
        key+="0"+passLength
    }else{
        key+=passLength
    }
    for(let i=2;i<16;i++){
        key+=characters.charAt(Math.floor(Math.random()*characters.length))
    }
    return key
}

export function padPassword(password){
    let initialLength=password.length
    let paddingLength=parseInt(initialLength/16+1)*16
    if(initialLength%16 !==0){
        let padded = password.padEnd(paddingLength,"0")
        return padded
    }else {
        return password
    }
}

export function unpadPassword(paddedPassword, key){
    let initialLength=parseInt(key.slice(0,2))
    let unpaddedPassword=""
    unpaddedPassword+=paddedPassword.slice(0,initialLength)
    return unpaddedPassword
}