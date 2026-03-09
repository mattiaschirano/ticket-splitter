let products = []

function updateTotals(){

let total = products.reduce((sum,p)=>sum+p.price,0)

let scontrinoA = 0
let scontrinoB = 0

products.forEach(p=>{
if(scontrinoA + p.price <= 64){
scontrinoA += p.price
}else{
scontrinoB += p.price
}
})

document.getElementById("totals").innerText =
`Totale ${total.toFixed(2)}€
Scontrino A ${scontrinoA.toFixed(2)}€
Scontrino B ${scontrinoB.toFixed(2)}€`
}

function addProduct(barcode){

let price = prompt("Prezzo prodotto:")

let product = {
barcode:barcode,
price:parseFloat(price)
}

products.push(product)

let li = document.createElement("li")
li.innerText = barcode + " €" + price

document.getElementById("products").appendChild(li)

updateTotals()
}

function onScanSuccess(decodedText){
addProduct(decodedText)
}

let scanner = new Html5QrcodeScanner(
"reader",
{
fps:10,
qrbox:{width:250,height:250}
})

scanner.render(onScanSuccess)

document.getElementById("manual").onclick = ()=>{
addProduct("manual")
}