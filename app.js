let scanner
let scannerRunning = false
let lastBarcode = null

let products = []
let receiptA = []
let receiptB = []

let editingIndex = null
let quantity = 1

const TICKET_VALUE = 8



/* CACHE NOMI */

function getCache(){
let cache = localStorage.getItem("productCache")
if(!cache) return {}
return JSON.parse(cache)
}

function saveCache(cache){
localStorage.setItem("productCache", JSON.stringify(cache))
}



/* CACHE PREZZI */

function getPriceCache(){
let cache = localStorage.getItem("priceCache")
if(!cache) return {}
return JSON.parse(cache)
}

function savePriceCache(cache){
localStorage.setItem("priceCache", JSON.stringify(cache))
}



/* API PRODOTTO */

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

let p = data.product

let name =
p.product_name_it ||
p.product_name ||
p.generic_name ||
p.brands ||
""

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

document.getElementById("cameraContainer").classList.remove("hidden")

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



/* SCAN SUCCESS */

async function onScanSuccess(decodedText){

if(decodedText === lastBarcode) return

lastBarcode = decodedText

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

document.getElementById("priceSheet").classList.add("active")

}



/* QUANTITY */

function updateQuantityUI(){
document.getElementById("qtyValue").innerText = quantity
}



/* SAVE PRODUCT */

function saveProduct(){

const name =
document.getElementById("productNameInput").value || "Prodotto"

const price =
parseFloat(document.getElementById("priceInput").value)

if(!price) return

const product = {
barcode:lastBarcode,
name:name,
price:price,
quantity:quantity
}

if(editingIndex !== null){
products[editingIndex] = product
editingIndex = null
}else{
products.push(product)
}

let priceCache = getPriceCache()
priceCache[lastBarcode] = price
savePriceCache(priceCache)

document.getElementById("priceSheet").classList.remove("active")

quantity = 1
updateQuantityUI()

renderProducts()

lastBarcode = null

}



/* LISTA SPESA */

function renderProducts(){

const list = document.getElementById("productList")
list.innerHTML = ""

products.forEach((p,index)=>{

const row = document.createElement("div")
row.className = "product-row"

row.innerHTML = `
<span>${p.name} x${p.quantity}</span>
<span>€${(p.price*p.quantity).toFixed(2)}</span>
`

row.addEventListener("click",()=>{

editingIndex = index
lastBarcode = p.barcode

document.getElementById("productNameInput").value = p.name
document.getElementById("priceInput").value = p.price

quantity = p.quantity
updateQuantityUI()

document.getElementById("priceSheet").classList.add("active")

})

let startX = 0

row.addEventListener("touchstart",(e)=>{
startX = e.touches[0].clientX
})

row.addEventListener("touchend",(e)=>{

let endX = e.changedTouches[0].clientX

if(startX - endX > 80){
products.splice(index,1)
renderProducts()
}

})

list.appendChild(row)

})

if(products.length > 0){
document.getElementById("splitBtn").classList.remove("hidden")
}

}



/* SPLIT */

function splitShopping(){

if(products.length === 0) return

let bestMask = 0
let bestScore = -Infinity

let n = products.length

for(let mask = 0; mask < (1<<n); mask++){

let sumA = 0
let sumB = 0

for(let i=0;i<n;i++){

let value = products[i].price * products[i].quantity

if(mask & (1<<i)){
sumA += value
}else{
sumB += value
}

}

let ticketsA = Math.floor(sumA / TICKET_VALUE)
let ticketsB = Math.floor(sumB / TICKET_VALUE)

let totalTickets = ticketsA + ticketsB
let ticketDiff = Math.abs(ticketsA - ticketsB)
let priceDiff = Math.abs(sumA - sumB)

let score =
(totalTickets * 1000)
- (ticketDiff * 100)
- priceDiff

if(score > bestScore){
bestScore = score
bestMask = mask
}

}

receiptA = []
receiptB = []

for(let i=0;i<n;i++){

if(bestMask & (1<<i)){
receiptA.push(products[i])
}else{
receiptB.push(products[i])
}

}

document.getElementById("productList").classList.add("hidden")
document.getElementById("tabs").classList.remove("hidden")
document.getElementById("receiptList").classList.remove("hidden")

document.querySelector(".bottom-actions").classList.add("hidden")
document.getElementById("summaryCard").classList.remove("hidden")

renderReceipts()

}



/* RECEIPTS */

function renderReceipts(){

const list = document.getElementById("receiptList")
list.innerHTML = ""

let activeA =
document.getElementById("tabA").classList.contains("active")

let receipt = activeA ? receiptA : receiptB

receipt.forEach(p=>{

const row = document.createElement("div")

row.className = "product-row"

row.innerHTML = `
<span>${p.name} x${p.quantity}</span>
<span>€${(p.price*p.quantity).toFixed(2)}</span>
`

list.appendChild(row)

})

updateSummary()

}



/* SUMMARY */

function updateSummary(){

let total =
products.reduce((sum,p)=>sum+(p.price*p.quantity),0)

let totalTickets =
Math.floor(total / TICKET_VALUE)

let covered =
totalTickets * TICKET_VALUE

let extra =
total - covered

let extraPerPerson =
extra / 2


let totalA =
receiptA.reduce((sum,p)=>sum+(p.price*p.quantity),0)

let totalB =
receiptB.reduce((sum,p)=>sum+(p.price*p.quantity),0)


let ticketsA =
Math.floor(totalA / TICKET_VALUE)

let ticketsB =
Math.floor(totalB / TICKET_VALUE)


let activeA =
document.getElementById("tabA").classList.contains("active")

let tickets =
activeA ? ticketsA : ticketsB

document.getElementById("ticketSummary").innerText =
`Usa ${tickets} ticket`

document.getElementById("extraText").innerText =
`€${extraPerPerson.toFixed(2)} da pagare a testa`

}



/* EVENTS */

document.addEventListener("DOMContentLoaded",()=>{

document.getElementById("scanBtn")
.addEventListener("click",startScanner)

document.getElementById("savePrice")
.addEventListener("click",saveProduct)

document.getElementById("splitBtn")
.addEventListener("click",splitShopping)

document.getElementById("cancelPrice")
.addEventListener("click",()=>{

document.getElementById("priceSheet").classList.remove("active")

})

document.getElementById("qtyPlus")
.addEventListener("click",()=>{
quantity++
updateQuantityUI()
})

document.getElementById("qtyMinus")
.addEventListener("click",()=>{
if(quantity>1){
quantity--
updateQuantityUI()
}
})

document.getElementById("tabA")
.addEventListener("click",()=>{

document.getElementById("tabA").classList.add("active")
document.getElementById("tabB").classList.remove("active")

renderReceipts()

})

document.getElementById("tabB")
.addEventListener("click",()=>{

document.getElementById("tabB").classList.add("active")
document.getElementById("tabA").classList.remove("active")

renderReceipts()

})

})