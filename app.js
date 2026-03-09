let scanner
let scannerRunning = false
let lastBarcode = null

let products = []

let receiptA = []
let receiptB = []

const TICKET_VALUE = 8



/* ---------------- CACHE ---------------- */

function getCache(){

let cache = localStorage.getItem("productCache")

if(!cache) return {}

return JSON.parse(cache)

}

function saveCache(cache){

localStorage.setItem("productCache", JSON.stringify(cache))

}



/* ---------------- API PRODUCT NAME ---------------- */

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



/* ---------------- SCANNER ---------------- */

async function startScanner(){

const camera = document.getElementById("cameraContainer")

camera.classList.remove("hidden")

if(!scanner){

scanner = new Html5Qrcode("reader")

}

if(scannerRunning) return


await scanner.start(

{ facingMode:"environment" },

{
fps:10,
qrbox:250
},

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



/* ---------------- SCAN SUCCESS ---------------- */

async function onScanSuccess(decodedText){

lastBarcode = decodedText

await stopScanner()

const name = await fetchProductName(decodedText)

document.getElementById("productNameInput").value = name
document.getElementById("priceInput").value = ""

document.getElementById("priceSheet").classList.add("active")

}



/* ---------------- SAVE PRODUCT ---------------- */

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



/* ---------------- RENDER PRODUCTS ---------------- */

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



/* ---------------- SPLIT SHOPPING ---------------- */

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

renderReceipts()

}



/* ---------------- RENDER RECEIPTS ---------------- */

function renderReceipts(){

const list = document.getElementById("productList")

list.innerHTML = ""

receiptA.forEach(p=>{

const row = document.createElement("div")

row.className = "product-row"

row.innerHTML = `
<span>${p.name}</span>
<span>€${p.price.toFixed(2)}</span>
`

list.appendChild(row)

})

}



/* ---------------- EVENTS ---------------- */

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

})