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

document
.getElementById("priceSheet")
.classList.remove("active")

quantity = 1
updateQuantityUI()

renderProducts()

lastBarcode = null

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