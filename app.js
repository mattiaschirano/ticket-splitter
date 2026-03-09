let products = []

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


function updateTotals(){

let total = products.reduce((sum,p)=>sum+p.price,0)

let scontrinoA = 0
let scontrinoB = 0

let listA = document.getElementById("receiptA")
let listB = document.getElementById("receiptB")

listA.innerHTML = ""
listB.innerHTML = ""

products.forEach(p=>{

let li = document.createElement("li")
li.innerText = `${p.name} - €${p.price}`

if(scontrinoA + p.price <= 64){

scontrinoA += p.price
listA.appendChild(li)

}else{

scontrinoB += p.price
listB.appendChild(li)

}

})

document.getElementById("totals").innerText =
`Totale €${total.toFixed(2)}
Scontrino A €${scontrinoA.toFixed(2)}
Scontrino B €${scontrinoB.toFixed(2)}`
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

updateTotals()

}


document.getElementById("cancelPrice").onclick = () => {

closeSheet()

}


document.getElementById("startScan").onclick = () => {

startScanner()

}