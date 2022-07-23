import {data} from '../pages/api/hello';
let columns = [
  'id',
  'title',
  'url',
  'thumbnailUrl'
]


const constructSortableFace = function(sclass,) {
    // add a unique color to column when its header (th) is clicked
    let firstChild = document.querySelectorAll("th");


    for (let i = 0; i < firstChild.length; i++) {
        firstChild[i].addEventListener('click', function() {
            let id = firstChild[i].getAttribute('data-th-id');
            
            let hoverable = document.querySelectorAll('td');

            for (let j = 0; j < hoverable.length; j++) {
                hoverable[j].classList.remove(sclass);
                if(hoverable[j].getAttribute('sorting-id') === id) {
                    hoverable[j].setAttribute('class',sclass);
                }
            }
        })
    }
}


export function createTableHead() {
  // create a checkbox,append it first and create
  // rhe remaining td tag and append to tr and finally thead tag
  let thead = document.createElement('thead')
  let tr = document.createElement('tr')

  //    make first child a check box

  let check = document.createElement('input')

  check.setAttribute('type', 'checkbox')
  check.style.marginLeft ='7px'
  let th = document.createElement('th');
  th.setAttribute("class",'sorting sorting_asc')
  
  th.appendChild(check)
  tr.appendChild(th)

  for (let i = 0; i < columns.length; i++) {
    let th = document.createElement('th')
    th.innerHTML = columns[i];
    th.classList.add('sorting')
    th.setAttribute("data-th-id",i)
    tr.appendChild(th)
  }

  let theader = thead.appendChild(tr)
  theader.setAttribute('class', 'thead-dark')
  console.log(theader)

  return theader
}

// create a table footer
export function TableTopFooter() {
  let input = document.createElement('input')
  input.setAttribute('type', 'search')
  input.setAttribute('placeholder', 'filter')
  input.setAttribute('id', 'filter')

  let button = document.createElement('button')
  button.setAttribute('type', 'button')

  return input
}

export function createTableBody() {
  let tbody = document.createElement('tbody')

  for (let i = 0; i < data.length; i++) {
    let tr = document.createElement('tr')

    let checkbox = document.createElement('input')

    checkbox.setAttribute('type', 'checkbox')

    const tdElement = document.createElement('td')

    tdElement.appendChild(checkbox)

    tr.appendChild(tdElement)

    if(i%2 == 0) {
        tr.setAttribute("class","even")
      } else {
        tr.setAttribute("class","odd")
      }

    for (let j = 0; j < columns.length; j++) {
      let td = document.createElement('td')
      td.innerHTML = data[i][columns[j]]
      td.setAttribute("sorting-id",j)
      tr.appendChild(td)
    }
    tbody.appendChild(tr)
  }


  return tbody
}



export function createTableFooter() {
  let tfoot = document.createElement('tfoot')

  return tfoot
}


export function createTable(target) {
    let toxic = document.getElementById(target);
        toxic.appendChild(createTableHead());
        toxic.appendChild(createTableBody());
        toxic.appendChild(createTableFooter())
    
    constructSortableFace('sorting_1');
            
}
