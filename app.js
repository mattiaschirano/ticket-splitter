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

let extraA = sumA % TICKET_VALUE
let extraB = sumB % TICKET_VALUE

document.getElementById("summaryA").innerHTML = `
Totale: €${sumA.toFixed(2)}<br>
Ticket: ${ticketsA}<br>
Fuori ticket: €${extraA.toFixed(2)}
`

document.getElementById("summaryB").innerHTML = `
Totale: €${sumB.toFixed(2)}<br>
Ticket: ${ticketsB}<br>
Fuori ticket: €${extraB.toFixed(2)}
`

}