let scanner
let scannerRunning = false
let lastBarcode = null

let products = []
let receiptA = []
let receiptB = []

const TICKET_VALUE = 8



/* CACHE */

function getCache(){
let cache = localStorage.getItem("productCache")
if(!cache) return {}
return JSON.parse(cache)
}

function saveCache(cache){
localStorage.setItem("productCache", JSON.stringify(cache))
}



/* API */

async function fetchProductName(barcode){

let cache = getCache()

if(cache[barcode]){
return cache[barcode]
}

try{

let res = await fetch(
`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
)

let data = await res.json()

if(data.status === 1){

let name = data.product.product_name || ""

if(name){
cache[barcode] = name
saveCache(cache)
}

return name

}

}catch(e){
console.log(e)
}

return ""

}



/* SCANNER */

async function startScanner(){

document
.getElementById("cameraContainer")
.classList.remove("hidden")

if(!scanner){
scanner = new Html5Qrcode("reader")
}

if(scannerRunning) return

await scanner.start(
{ facingMode:"environment" },
{ fps:10, qrbox:250 },
onScanSuccess
)

scannerRunning = true

}

async function stopScanner(){

if(scanner && scannerRunning){
await scanner.stop()
scannerRunning = false
}

document
.getElementById("cameraContainer")
.classList.add("hidden")

}



/* SCAN SUCCESS */

async function onScanSuccess(decodedText){

lastBarcode = decodedText

await stopScanner()

const name = await fetchProductName(decodedText)

document.getElementById("productNameInput").value = name
document.getElementById("priceInput").value = ""

document
.getElementById("priceSheet")
.classList.add("active")

}



/* SAVE PRODUCT */

function saveProduct(){

const name =
document.getElementById("productNameInput").value || "Prodotto"

const price =
parseFloat(document.getElementById("priceInput").value)

if(!price) return

products.push({
barcode:lastBarcode,
name:name,
price:price
})

renderProducts()

document
.getElementById("priceSheet")
.classList.remove("active")

}



/* RENDER LISTA SPESA */

function renderProducts(){

const list = document.getElementById("productList")

list.innerHTML = ""

products.forEach(p=>{

const row = document.createElement("div")

row.className = "product-row"

row.innerHTML = `
<span>${p.name}</span>
<span>€${p.price.toFixed(2)}</span>
`

list.appendChild(row)

})

if(products.length > 0){

document
.getElementById("splitBtn")
.classList.remove("hidden")

}

}



/* SPLIT */

function splitShopping(){

receiptA = []
receiptB = []

let sumA = 0
let sumB = 0

products.forEach(p=>{

if(sumA <= sumB){
receiptA.push(p)
sumA += p.price
}else{
receiptB.push(p)
sumB += p.price
}

})

document
.getElementById("productList")
.classList.add("hidden")

document
.getElementById("tabs")
.classList.remove("hidden")

document
.getElementById("receiptList")
.classList.remove("hidden")

document
.querySelector(".bottom-actions")
.classList.add("hidden")

document
.getElementById("summaryCard")
.classList.remove("hidden")

renderReceipts()

}



/* RENDER RECEIPTS */

function renderReceipts(){

const list = document.getElementById("receiptList")

list.innerHTML = ""

let activeA =
document.getElementById("tabA")
.classList.contains("active")

let receipt = activeA ? receiptA : receiptB

receipt.forEach(p=>{

const row = document.createElement("div")

row.className = "product-row"

row.innerHTML = `
<span>${p.name}</span>
<span>€${p.price.toFixed(2)}</span>
`

list.appendChild(row)

})

updateSummary()

}



/* SUMMARY */

function updateSummary(){

let total = products.reduce((s,p)=>s+p.price,0)

let tickets = Math.floor(total / TICKET_VALUE)

let extra = total - tickets*TICKET_VALUE

document.getElementById("ticketSummary").innerText =
`€${total.toFixed(2)} · ${tickets} ticket`

document.getElementById("extraText").innerText =
`€${extra.toFixed(2)} da pagare tramite carta`

}



/* EVENTS */

document.addEventListener("DOMContentLoaded", ()=>{

document
.getElementById("scanBtn")
.addEventListener("click", startScanner)

document
.getElementById("savePrice")
.addEventListener("click", saveProduct)

document
.getElementById("splitBtn")
.addEventListener("click", splitShopping)

document
.getElementById("cancelPrice")
.addEventListener("click", ()=>{

document
.getElementById("priceSheet")
.classList.remove("active")

})

document
.getElementById("tabA")
.addEventListener("click", ()=>{

document.getElementById("tabA").classList.add("active")
document.getElementById("tabB").classList.remove("active")

renderReceipts()

})

document
.getElementById("tabB")
.addEventListener("click", ()=>{

document.getElementById("tabB").classList.add("active")
document.getElementById("tabA").classList.remove("active")

renderReceipts()

})

})