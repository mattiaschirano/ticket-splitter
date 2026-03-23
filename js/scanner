let scanner
let scannerRunning = false
let lastBarcode = null



async function startScanner(){

if (typeof Html5Qrcode === "undefined") {
alert("Scanner non disponibile. Ricarica la pagina.")
return
}

if(scannerRunning) return

document
.getElementById("scannerSheet")
.classList.remove("hidden")

try{

if(!scanner){
scanner = new Html5Qrcode("reader")
}

await scanner.stop().catch(()=>{})
await scanner.clear().catch(()=>{})

await scanner.start(
{ facingMode:"environment" },
{ fps:10, qrbox:350 },
onScanSuccess
)

scannerRunning = true

}catch(err){

console.error("Errore avvio scanner:", err)
alert("Impossibile avviare la fotocamera")

stopScanner()

}

}



async function stopScanner(){

try{

if(scanner && scannerRunning){
await scanner.stop()
await scanner.clear().catch(()=>{})
}

}catch(err){
console.warn("Errore stop scanner:", err)
}

scannerRunning = false

document
.getElementById("scannerSheet")
.classList.add("hidden")

}



/* SCAN SUCCESS */

async function onScanSuccess(decodedText){

console.log("Barcode letto:", decodedText)

if(decodedText === lastBarcode) return

lastBarcode = decodedText

await stopScanner()

const name = await fetchProductName(decodedText)

const priceCache = getPriceCache()
const cachedPrice = priceCache[decodedText]

document.getElementById("productNameInput").value = name

if(cachedPrice){
document.getElementById("priceInput").value = cachedPrice
}else{
document.getElementById("priceInput").value = ""
}

quantity = 1
updateQuantityUI()

document
.getElementById("priceSheet")
.classList.add("active")

}