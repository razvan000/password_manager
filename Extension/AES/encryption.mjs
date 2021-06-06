
import { tables } from './lookupTables.mjs'
import { generateKey, toHex, printText, padPassword, unpadPassword, getCharcodeArray } from '../utils.mjs'

const numberRounds = 9


let keyExpansionCore = (input, substitutionConstant)=>{
    let temp = input[0]
	input[0] = input[1]
	input[1] = input[2]
	input[2] = input[3]
	input[3] = temp;

	input[0] = tables.substitutionTable[input[0]]
	input[1] = tables.substitutionTable[input[1]]
	input[2] = tables.substitutionTable[input[2]]
	input[3] = tables.substitutionTable[input[3]]

	input[0] ^= tables.roundConstant[substitutionConstant]
   
    return input
}

let expandKey =(key) =>{
    let expandedKey= new Array(176)

    for (let i = 0; i < 16; i++) {
		expandedKey[i]=key.charCodeAt(i);
	}

	let byteCount = 16;
	let rconIterator = 1;
	let coreByte=new Array(4);

	while (byteCount < 176) {
		for (let i = 0; i < 4; i++) {
			coreByte[i] = expandedKey[i + byteCount - 4];
            
		} 

		if (byteCount % 16 == 0) {
			coreByte=keyExpansionCore(coreByte, rconIterator);
			rconIterator+=1;
		}

		for (let c = 0; c < 4; c++) { 
			expandedKey[byteCount] = expandedKey[byteCount - 16] ^ coreByte[c];
			byteCount++;
		}
	}
    return expandedKey
}


let substituteBytes = (state) =>{
    for(let i=0;i<16;i++){
        state[i]=tables.substitutionTable[state[i]]
    }
    return state
}

let shiftRows = (state) =>{
    let shifted = new Array(16)
    shifted[0] = state[0]
	shifted[1] = state[5]
	shifted[2] = state[10]
	shifted[3] = state[15]

	shifted[4] = state[4]
	shifted[5] = state[9]
	shifted[6] = state[14]
	shifted[7] = state[3]

	shifted[8] = state[8]
	shifted[9] = state[13]
	shifted[10] = state[2]
	shifted[11] = state[7]

	shifted[12] = state[12]
	shifted[13] = state[1]
	shifted[14] = state[6]
	shifted[15] = state[11]

    return shifted
}

let mixColumns = (state) => {
    let mixedColumns = new Array(16)
    for (let i = 0; i <= 12; i += 4) {
        mixedColumns[i] = tables.galoisField2[state[i]] ^ tables.galoisField3[state[i+1]] ^ state[i+2] ^ state[i+3]
        mixedColumns[i + 1] = state[i] ^ tables.galoisField2[state[i+1]] ^ tables.galoisField3[state[i+2]] ^ state[i+3]
        mixedColumns[i + 2] = state[i] ^ state[i+1] ^ tables.galoisField2[state[i+2]] ^ tables.galoisField3[state[i+3]]
        mixedColumns[i + 3] = tables.galoisField3[state[i]] ^ state[i+1] ^ state[i+2] ^ tables.galoisField2[state[i+3]]
    }
    return mixedColumns
}

let addRoundKey = (state, roundKey) =>{
    for(let i=0; i<16;i++){
        state[i] ^= roundKey[i]
    }
    return state;
}


let encrypt = (password, key)=>{
    let encryptedPassword = new Array(16)
    for(let i=0;i<16;i++){
        encryptedPassword[i]=password[i]
    }
    let expandedKey= expandKey(key)
    encryptedPassword= addRoundKey(encryptedPassword, key)
    
    for(let i=0;i<numberRounds;i++){
        encryptedPassword= substituteBytes(encryptedPassword)
        encryptedPassword= shiftRows(encryptedPassword)
        encryptedPassword= mixColumns(encryptedPassword)
        encryptedPassword= addRoundKey(encryptedPassword, expandedKey.slice((i+1)*16,((i+1)*16)+16))
    }

    encryptedPassword= substituteBytes(encryptedPassword)
    encryptedPassword= shiftRows(encryptedPassword)
    encryptedPassword= addRoundKey(encryptedPassword, expandedKey.slice(160))

  
    return encryptedPassword
}



//DELETE THESE COMMENTS
/*
usage: generate the key from the password -> pad password -> transform into charcode array to simulate bytes (0-255) -> encrypt
*/
let pass= "skate999ordie"
let key = generateKey(pass)
console.log(key)
pass=padPassword(pass)
let test=pass
let toEncrypt = new Array(pass.length)
for(let i=0;i<pass.length;i++){
    toEncrypt[i]=pass.charCodeAt(i)
}
console.log("pass: ",pass)
console.log(toEncrypt)
console.log(key)
let temp=new Array(16)

for(let i=0;i<toEncrypt.length;i+=16){
    console.log(toEncrypt.slice(i*16,(i*16)+16))
    temp=encrypt(toEncrypt.slice(i,i+16),key)
    for(let j=0; j<16; j++){
        toEncrypt[i+j]=temp[j]
    }  
}
// toEncrypt=encrypt(toEncrypt,key)
let hexxed=toHex(toEncrypt)
console.log(hexxed)
printText(toEncrypt)
console.log("encrypted: ",toEncrypt)

console.log("bf08f0f8d73e5f8bf778eb28b0825708".length)

console.log(getCharcodeArray("eafc2b3ae004da771f065c755d13c52c"))





