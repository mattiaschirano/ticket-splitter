let scanner
let scannerRunning = false
let lastBarcode = null

let products = []



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

document.getElementById("cameraContainer").classList.add("hidden")

}



async function onScanSuccess(decodedText){

lastBarcode = decodedText

await stopScanner()

document.getElementById("productNameInput").value = ""

document.getElementById("priceInput").value = ""

document.getElementById("priceSheet").classList.add("active")

}



function saveProduct(){

const name =
document.getElementById("productNameInput").value || "Prodotto"

const price =
parseFloat(document.getElementById("priceInput").value)

if(!price) return

products.push({
name:name,
price:price
})

renderProducts()

document.getElementById("priceSheet").classList.remove("active")

}



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

document.getElementById("splitBtn").classList.remove("hidden")

}

}



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