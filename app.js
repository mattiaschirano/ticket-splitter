let products = []

let scanner
let scannerRunning = false
let lastBarcode = null

const TICKET_VALUE = 8


async function fetchProductName(barcode){

try{

let res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
let data = await res.json()

if(data.status === 1){
return data.product.product_name || ""
}

return ""

}catch{
return ""
}

}


function updateShoppingList(){

let list = document.getElementById("shoppingList")

list.innerHTML = ""

products.forEach(p=>{

let li = document.createElement("li")
li.innerText = `${p.name} - €${p.price}`

list.appendChild(li)

})

if(products.length > 0){
document.getElementById("splitButton").classList.remove("hidden")
}

}


function splitShopping(){

let total = products.reduce((sum,p)=>sum+p.price,0)

let target = total / 2

let sorted = [...products].sort((a,b)=>b.price-a.price)

let receiptA = []
let receiptB = []

let sumA = 0
let sumB = 0

sorted.forEach(p=>{

if(sumA + p.price <= target){

receiptA.push(p)
sumA += p.price

}else{

receiptB.push(p)
sumB += p.price

}

})

renderReceipts(receiptA,receiptB,sumA,sumB)

document.getElementById("shoppingSection").classList.add("hidden")

document.getElementById("receipts").classList.remove("hidden")

}


function renderReceipts(A,B,sumA,sumB){

let listA = document.getElementById("receiptA")
let listB = document.getElementById("receiptB")

listA.innerHTML = ""
listB.innerHTML = ""

A.forEach(p=>{

let li = document.createElement("li")
li.innerText = `${p.name} - €${p.price}`
listA.appendChild(li)

})

B.forEach(p=>{

let li = document.createElement("li")
li.innerText = `${p.name} - €${p.price}`
listB.appendChild(li)

})

let ticketsA = Math.ceil(sumA / TICKET_VALUE)
let ticketsB = Math.ceil(sumB / TICKET_VALUE)

document.getElementById("ticketsA").innerText = `${ticketsA} ticket`
document.getElementById("ticketsB").innerText = `${ticketsB} ticket`

}


function openSheet(){
document.getElementById("priceSheet").classList.add("active")
}

function closeSheet(){
document.getElementById("priceSheet").classList.remove("active")
}


async function startScanner(){

if(!scanner){
scanner = new Html5Qrcode("reader")
}

if(scannerRunning) return

await scanner.start(
{ facingMode: "environment" },
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

}


async function onScanSuccess(decodedText){

lastBarcode = decodedText

await stopScanner()

let name = await fetchProductName(decodedText)

document.getElementById("productNameInput").value = name

openSheet()

}


document.getElementById("savePrice").onclick = () => {

let name = document.getElementById("productNameInput").value || "Prodotto"
let price = parseFloat(document.getElementById("priceInput").value)

if(!price) return

products.push({
barcode:lastBarcode,
name:name,
price:price
})

document.getElementById("priceInput").value = ""

closeSheet()

updateShoppingList()

}


document.getElementById("cancelPrice").onclick = () => {

closeSheet()

}


document.getElementById("startScan").onclick = () => {

startScanner()

}


document.getElementById("splitButton").onclick = () => {

splitShopping()

}