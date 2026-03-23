function initApp(){

document
.getElementById("scanBtn")
.addEventListener("click",startScanner)

document
.getElementById("closeScanner")
.addEventListener("click",stopScanner)

document
.getElementById("savePrice")
.addEventListener("click",saveProduct)

document
.getElementById("splitBtn")
.addEventListener("click",splitShopping)

document
.getElementById("cancelPrice")
.addEventListener("click",()=>{
document.getElementById("priceSheet").classList.remove("active")
})

document
.getElementById("qtyPlus")
.addEventListener("click",()=>{
quantity++
updateQuantityUI()
})

document
.getElementById("qtyMinus")
.addEventListener("click",()=>{
if(quantity>1){
quantity--
updateQuantityUI()
}
})

document
.getElementById("tabA")
.addEventListener("click",()=>{
document.getElementById("tabA").classList.add("active")
document.getElementById("tabB").classList.remove("active")
renderReceipts()
})

document
.getElementById("tabB")
.addEventListener("click",()=>{
document.getElementById("tabB").classList.add("active")
document.getElementById("tabA").classList.remove("active")
renderReceipts()
})

}

document.addEventListener("DOMContentLoaded", initApp)