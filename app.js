let products = []
let receiptA = []
let receiptB = []

const TICKET_VALUE = 8

let scanner = null
let scannerRunning = false
let lastBarcode = null



async function fetchProductName(barcode){
  try{
    let res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
    let data = await res.json()
    if(data.status === 1){
      return data.product.product_name || ""
    }
  }catch(e){}
  return ""
}



function renderProductList(){
  const container = document.getElementById("productList")
  container.innerHTML = ""

  products.forEach(p=>{
    const row = document.createElement("div")
    row.className = "product-row"

    row.innerHTML = `
      <span>${p.name}</span>
      <span>€${p.price.toFixed(2)}</span>
    `

    container.appendChild(row)
  })

  if(products.length > 0){
    document.getElementById("splitBtn").classList.remove("hidden")
  }
}



function splitShopping(){

  receiptA = []
  receiptB = []

  let sumA = 0
  let sumB = 0

  products.forEach(p=>{
    if(sumA <= sumB){
      receiptA.push(p)
      sumA += p.price
    }else{
      receiptB.push(p)
      sumB += p.price
    }
  })

  document.getElementById("productList").classList.add("hidden")
  document.getElementById("tabs").classList.remove("hidden")
  document.getElementById("summaryCard").classList.remove("hidden")

  document.querySelector(".bottom-actions").classList.add("hidden")

  renderReceipts()
}



function renderReceipts(){

  const list = document.getElementById("receiptList")
  list.innerHTML = ""
  list.classList.remove("hidden")

  const tabA = document.getElementById("tabA")
  const activeA = tabA.classList.contains("active")

  const receipt = activeA ? receiptA : receiptB

  receipt.forEach(p=>{
    const row = document.createElement("div")
    row.className = "product-row"

    row.innerHTML = `
      <span>${p.name}</span>
      <span>€${p.price.toFixed(2)}</span>
    `

    list.appendChild(row)
  })

  updateSummary()
}



function updateSummary(){

  const total = products.reduce((s,p)=>s+p.price,0)
  const tickets = Math.floor(total / TICKET_VALUE)
  const extra = total - tickets*TICKET_VALUE

  document.getElementById("ticketSummary").innerText =
    `€${total.toFixed(2)} · ${tickets} ticket`

  document.getElementById("extraText").innerText =
    `€${extra.toFixed(2)} da pagare tramite carta`
}



function openSheet(){
  document.getElementById("priceSheet").classList.add("active")
}

function closeSheet(){
  document.getElementById("priceSheet").classList.remove("active")
}



async function startScanner(){

  const reader = document.getElementById("reader")
  reader.classList.remove("hidden")

  if(!scanner){
    scanner = new Html5Qrcode("reader")
  }

  if(scannerRunning) return

  await scanner.start(
    { facingMode: "environment" },
    { fps:10, qrbox:250 },
    onScanSuccess
  )

  scannerRunning = true
}



async function stopScanner(){

  if(scanner && scannerRunning){
    await scanner.stop()
    scannerRunning = false
  }

  document.getElementById("reader").classList.add("hidden")
}



async function onScanSuccess(decodedText){

  lastBarcode = decodedText

  await stopScanner()

  const name = await fetchProductName(decodedText)

  document.getElementById("productNameInput").value = name
  document.getElementById("priceInput").value = ""

  openSheet()
}



function saveProduct(){

  const name = document.getElementById("productNameInput").value || "Prodotto"
  const price = parseFloat(document.getElementById("priceInput").value)

  if(!price) return

  products.push({
    barcode:lastBarcode,
    name:name,
    price:price
  })

  closeSheet()

  renderProductList()
}



function setupEvents(){

  document.getElementById("scanBtn").addEventListener("click", startScanner)

  document.getElementById("splitBtn").addEventListener("click", splitShopping)

  document.getElementById("savePrice").addEventListener("click", saveProduct)

  document.getElementById("cancelPrice").addEventListener("click", closeSheet)

  document.getElementById("tabA").addEventListener("click", ()=>{
    document.getElementById("tabA").classList.add("active")
    document.getElementById("tabB").classList.remove("active")
    renderReceipts()
  })

  document.getElementById("tabB").addEventListener("click", ()=>{
    document.getElementById("tabB").classList.add("active")
    document.getElementById("tabA").classList.remove("active")
    renderReceipts()
  })

}



document.addEventListener("DOMContentLoaded", setupEvents)