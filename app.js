let scanner
let scannerRunning = false
let lastBarcode = null

let products = []



/* ------------------------------
CACHE PRODOTTI (localStorage)
-------------------------------- */

function getProductCache(){

let cache = localStorage.getItem("productCache")

if(!cache){
return {}
}

return JSON.parse(cache)

}

function saveProductCache(cache){

localStorage.setItem("productCache", JSON.stringify(cache))

}



/* ------------------------------
API OPEN FOOD FACTS
-------------------------------- */

async function fetchProductName(barcode){

let cache = getProductCache()

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
saveProductCache(cache)

}

return name

}

}catch(e){

console.log("API error", e)

}

return ""

}



/* ------------------------------
SCANNER
-------------------------------- */

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



/* ------------------------------
SCAN SUCCESS
-------------------------------- */

async function onScanSuccess(decodedText){

lastBarcode = decodedText

await stopScanner()

const name = await fetchProductName(decodedText)

document
.getElementById("productNameInput")
.value = name

document
.getElementById("priceInput")
.value = ""

document
.getElementById("priceSheet")
.classList.add("active")

}



/* ------------------------------
SALVATAGGIO PRODOTTO
-------------------------------- */

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



/* salva anche nella cache */

let cache = getProductCache()

if(lastBarcode && name){

cache[lastBarcode] = name
saveProductCache(cache)

}



renderProducts()

document
.getElementById("priceSheet")
.classList.remove("active")

}



/* ------------------------------
RENDER LISTA PRODOTTI
-------------------------------- */

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



/* ------------------------------
EVENTI
-------------------------------- */

document.addEventListener("DOMContentLoaded", ()=>{

document
.getElementById("scanBtn")
.addEventListener("click", startScanner)

document
.getElementById("savePrice")
.addEventListener("click", saveProduct)

document
.getElementById("cancelPrice")
.addEventListener("click", ()=>{

document
.getElementById("priceSheet")
.classList.remove("active")

})

})