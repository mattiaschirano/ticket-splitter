function updateQuantityUI(){
document.getElementById("qtyValue").innerText = quantity
}



/* LISTA PRODOTTI */

function renderProducts(){

const list = document.getElementById("productList")
list.innerHTML = ""

products.forEach((p,index)=>{

const wrapper = document.createElement("div")
wrapper.className = "swipe-row"

const row = document.createElement("div")
row.className = "product-row"

row.innerHTML = `
<span>${p.name} x${p.quantity}</span>
<span>€${(p.price*p.quantity).toFixed(2)}</span>
`

const deleteBtn = document.createElement("div")
deleteBtn.className = "delete-action"
deleteBtn.innerHTML = "🗑️"

wrapper.appendChild(deleteBtn)
wrapper.appendChild(row)

list.appendChild(wrapper)



row.addEventListener("click",()=>{

editingIndex = index
lastBarcode = p.barcode

document.getElementById("productNameInput").value = p.name
document.getElementById("priceInput").value = p.price

quantity = p.quantity
updateQuantityUI()

document.getElementById("priceSheet").classList.add("active")

})



deleteBtn.addEventListener("click",()=>{

products.splice(index,1)
renderProducts()

})



let startX = 0

row.addEventListener("touchstart",(e)=>{
startX = e.touches[0].clientX
})

row.addEventListener("touchend",(e)=>{

let endX = e.changedTouches[0].clientX
let diff = startX - endX

if(diff > 60){
row.style.transform = "translateX(-80px)"
}else{
row.style.transform = "translateX(0)"
}

})

})

if(products.length > 0){
document.getElementById("splitBtn").classList.remove("hidden")
}

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