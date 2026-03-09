let products = []

let receiptA = []
let receiptB = []

const TICKET_VALUE = 8

let scanner
let scannerRunning = false
let lastBarcode = null


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



function renderProductList(){

let container = document.getElementById("productList")
container.innerHTML=""

products.forEach(p=>{

let row = document.createElement("div")
row.className="product-row"

row.innerHTML = `
<span>${p.name}</span>
<span>€${p.price.toFixed(2)}</span>
`

container.appendChild(row)

})

if(products.length>0){
document.getElementById("splitBtn").classList.remove("hidden")
}

}



function splitShopping(){

receiptA=[]
receiptB=[]

let sumA=0
let sumB=0

products.forEach(p=>{

if(sumA<=sumB){

receiptA.push(p)
sumA+=p.price

}else{

receiptB.push(p)
sumB+=p.price

}

})

renderReceipts()

document.getElementById("tabs").classList.remove("hidden")
document.getElementById("summaryCard").classList.remove("hidden")
document.getElementById("productList").classList.add("hidden")

}



function renderReceipts(){

let list=document.getElementById("receiptList")
list.innerHTML=""
list.classList.remove("hidden")

let active="A"

if(document.getElementById("tabB").classList.contains("active")){
active="B"
}

let receipt=active==="A"?receiptA:receiptB

receipt.forEach(p=>{

let row=document.createElement("div")
row.className="product-row"

row.innerHTML=`
<span>${p.name}</span>
<span>€${p.price.toFixed(2)}</span>
`

list.appendChild(row)

})

updateSummary()

}



function updateSummary(){

let sum=products.reduce((s,p)=>s+p.price,0)

let tickets=Math.floor(sum/TICKET_VALUE)
let extra=sum-tickets*TICKET_VALUE

document.getElementById("ticketSummary").innerText=
`€${sum.toFixed(2)} · ${tickets} ticket`

document.getElementById("extraText").innerText=
`€${extra.toFixed(2)} da pagare tramite carta`

}



function openSheet(){
document.getElementById("priceSheet").classList.add("active")
}

function closeSheet(){
document.getElementById("priceSheet").classList.remove("active")
}



async function startScanner(){

document.getElementById("reader").classList.remove("hidden")

if(!scanner){
scanner=new Html5Qrcode("reader")
}

if(scannerRunning) return

await scanner.start(
{facingMode:"environment"},
{fps:10,qrbox:250},
onScanSuccess
)

scannerRunning=true

}



async function stopScanner(){

if(scanner && scannerRunning){

await scanner.stop()
scannerRunning=false

document.getElementById("reader").classList.add("hidden")

}

}



async function onScanSuccess(decodedText){

lastBarcode=decodedText

await stopScanner()

let name=await fetchProductName(decodedText)

document.getElementById("productNameInput").value=name

openSheet()

}



document.getElementById("savePrice").onclick=()=>{

let name=document.getElementById("productNameInput").value||"Prodotto"
let price=parseFloat(document.getElementById("priceInput").value)

if(!price) return

products.push({
barcode:lastBarcode,
name:name,
price:price
})

document.getElementById("priceInput").value=""

closeSheet()

renderProductList()

}



document.getElementById("cancelPrice").onclick=()=>{

closeSheet()

}



document.getElementById("scanBtn").onclick=()=>{

startScanner()

}



document.getElementById("splitBtn").onclick=()=>{

splitShopping()

}



document.getElementById("tabA").onclick=()=>{

document.getElementById("tabA").classList.add("active")
document.getElementById("tabB").classList.remove("active")

renderReceipts()

}



document.getElementById("tabB").onclick=()=>{

document.getElementById("tabB").classList.add("active")
document.getElementById("tabA").classList.remove("active")

renderReceipts()

}