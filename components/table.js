let columns = ['id','name','address','city','state','zip','phone','zip','phone'];

let data = [
    {id:1,name:'Toxic',address:'123 Main St',city:'New York',state:'NY',zip:'10001',phone:'123-456-7890',zip:'10001',phone:'123-456-7890'},   
    {id:2,name:'Toxic',address:'123 Main St',city:'New York',state:'NY',zip:'10001',phone:'123-456-7890'},
    {id:3,name:'Toxic',address:'123 Main St',city:'New York',state:'NY',zip:'10001',phone:'123-456-7890'},
    {id:4,name:'Toxic',address:'123 Main St',city:'New York',state:'NY',zip:'10001',phone:'123-456-7890'},
]

export function createTableHead() {
   let thead = document.createElement('thead');

   let tr = document.createElement('tr');
  
   for(let i = 0; i < columns.length; i++) {
     let th = document.createElement('th');
     th.innerHTML = columns[i];
     tr.appendChild(th);
   }

   let theader =thead.appendChild(tr)

   console.log(theader)

   return theader;
  
}

export function TableTopFooter () {
    let input = document.createElement('input');
    input.setAttribute('type','search');
    input.setAttribute('placeholder','filter');
    input.setAttribute('id','filter');

    let button = document.createElement('button');
    button.setAttribute('type','button');

   return input;
}

export function createTableBody() {
    let tbody = document.createElement('tbody');

    for(let i = 0; i < data.length; i++) {
       let tr = document.createElement('tr');
         for(let j = 0; j < columns.length; j++) {
              let td = document.createElement('td');
              td.innerHTML = data[i][columns[j]];
              tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }

    return tbody;
}


export function createTableFooter() {
    let tfoot = document.createElement('tfoot');

    return tfoot;
}