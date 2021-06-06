import { tables } from './lookupTables.mjs'

const numberRounds = 9;

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

let addRoundKey = (state, roundKey) =>{
    for(let i=0; i<16;i++){
        state[i] ^= roundKey[i]
    }
    return state;
}

let reverseSubstituteBytes = (state) =>{
    for(let i=0;i<16;i++){
        state[i]=tables.reverseSubstitutionTable[state[i]]
    }
    return state
}

let reverseShiftRows = (state) =>{
    let shifted = new Array(16)
    shifted[0] = state[0]
	shifted[1] = state[13]
	shifted[2] = state[10]
	shifted[3] = state[7]

	shifted[4] = state[4]
	shifted[5] = state[1]
	shifted[6] = state[14]
	shifted[7] = state[11]

	shifted[8] = state[8]
	shifted[9] = state[5]
	shifted[10] = state[2]
	shifted[11] = state[15]

	shifted[12] = state[12]
	shifted[13] = state[9]
	shifted[14] = state[6]
	shifted[15] = state[3]

    return shifted
}

let reverseMixColumns = (state) => {
    let mixedColumns = new Array(16)
    for (let i = 0; i <= 12; i += 4) {
        mixedColumns[i] = tables.galoisField14[state[i]] ^ tables.galoisField11[state[i+1]] ^ tables.galoisField13[state[i+2]] ^ tables.galoisField9[state[i+3]]
        mixedColumns[i + 1] = tables.galoisField9[state[i]] ^ tables.galoisField14[state[i+1]] ^ tables.galoisField11[state[i+2]] ^ tables.galoisField13[state[i+3]]
        mixedColumns[i + 2] = tables.galoisField13[state[i]] ^ tables.galoisField9[state[i+1]] ^ tables.galoisField14[state[i+2]] ^ tables.galoisField11[state[i+3]]
        mixedColumns[i + 3] = tables.galoisField11[state[i]] ^ tables.galoisField13[state[i+1]] ^ tables.galoisField9[state[i+2]] ^ tables.galoisField14[state[i+3]]
    }
    return mixedColumns
}

export function decrypt (password, key){
    let decryptedPassword = new Array(16)
    for(let i=0;i<16;i++){
        decryptedPassword[i]=password[i]
    }
    let expandedKey= expandKey(key)
    decryptedPassword= addRoundKey(decryptedPassword, expandedKey.slice(160))
    decryptedPassword= reverseShiftRows(decryptedPassword)
    decryptedPassword= reverseSubstituteBytes(decryptedPassword)

    for(let i=0;i<numberRounds;i++){
        decryptedPassword= addRoundKey(decryptedPassword, expandedKey.slice(160-((i+1)*16),(160-(i+1)*16+16)))
        decryptedPassword= reverseMixColumns(decryptedPassword)
        decryptedPassword= reverseShiftRows(decryptedPassword)
        decryptedPassword= reverseSubstituteBytes(decryptedPassword)
    }

    decryptedPassword= addRoundKey(decryptedPassword, key)


    return decryptedPassword
}

let key ="27IjgWhVPxbTx{x0"
let toEncrypt =  [
    86,  44, 113,   9, 143, 165, 143, 251,
    13, 213, 105, 255, 238, 198, 189,  12,
   187, 199,   5,  10, 148,  86, 221, 142,
   237, 201,  34,  13, 146, 217, 171,  30
 ]

let temp=new Array(16)
// toEncrypt=decrypt(toEncrypt,key)
for(let i=0;i<toEncrypt.length;i+=16){
    temp=decrypt(toEncrypt.slice(i,i+16),key)
    for(let j=0; j<16; j++){
        toEncrypt[i+j]=temp[j]
    }  
}

console.log(toEncrypt)