let products = []

let scanningLocked = false

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
li.innerText = `${p.barcode} - €${p.price}`

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

function addProduct(barcode){

let price = prompt("Prezzo prodotto:")

if(!price){
scanningLocked = false
return
}

let product = {
barcode:barcode,
price:parseFloat(price)
}

products.push(product)

updateTotals()

// riattiva scanner dopo 1.5 secondi
setTimeout(()=>{
scanningLocked = false
},1500)
}

function onScanSuccess(decodedText){

if(scanningLocked) return

scanningLocked = true

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