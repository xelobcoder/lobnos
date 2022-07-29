
/**
 * 
 * @returns {HTMLElement} returns a custom context menu for sorting in 
 * ascending and descending order of that column
 */
let menu = function () {
  // filtering input form
  let filter = document.createElement('input')
  filter.setAttribute('placeholder', 'filter')
  filter.setAttribute('class', 'form-control col-1')
  //  wrapper for the context menu
  let div = document.createElement('div')
  div.setAttribute('class', 'menu-dropdown-list')
  //  
  // create and append li elements
  let liasc = document.createElement('li')
  liasc.setAttribute('class', 'menu-dropdown-list-item')
  liasc.innerHTML = 'Sort Ascending'

  let lidesc = document.createElement('li')
  lidesc.setAttribute('class', 'menu-dropdown-list-item')
  lidesc.innerHTML = 'Sort Descending'

  let lifilter = document.createElement('li')
  lifilter.setAttribute('class', 'menu-dropdown-list-item')
  lifilter.appendChild(filter)

  // append li elements to parent ul
  let ul = document.createElement('ul')
  // append element to the Div
  ul.appendChild(liasc)
  ul.appendChild(lidesc)
  ul.appendChild(lifilter)

  div.appendChild(ul)

  return div
}

let contxtMenu = function () {
  document.querySelector('.meme').appendChild(menu())
  console.log(menu())
  let clickableElements = document.querySelectorAll('th')

  for (let i = 0; i < clickableElements.length; i++) {
    clickableElements[i].addEventListener('contextmenu', function (e) {
      e.preventDefault()
      let menu = document.querySelector('.menu-dropdown-list')
      menu.style.display = 'block'
      menu.style.left = e.pageX + 'px'
      menu.style.top = e.pageY + 'px'
      console.log('right clicked')
    })
  }
}

/**
 * 
 * @param {function} callback a callback function for sorting the column  
 * @returns {callback} 
 */
let sortAsc = function (fxn) {
  if (typeof fxn !='function') {
     throw new Error('fxn must be a function')
  }
   return fxn()
}

let sortDesc = function (fxn) {
  if(typeof fxn != 'function'){
    throw new Error('fxn must be a function')
  }
  return fxn()
}


const constructCaret = function () {
  let div = document.createElement('div')

  const caret = function (className) {
    let e = document.createElement('i')
    e.setAttribute('class', className)

    return e
  }

  let caretup = caret('bi bi-caret-up-fill')
  let caretdown = caret('bi bi-caret-down-fill')

  div.appendChild(caretup)
  div.appendChild(caretdown)

  return div
}

const constructSortableFace = function (sclass) {
  // add a unique color to column when its header (th) is clicked
  let firstChild = document.querySelectorAll('th')

  for (let i = 0; i < firstChild.length; i++) {
    firstChild[i].addEventListener('click', function () {
      let id = firstChild[i].getAttribute('data-th-id')

      let hoverable = document.querySelectorAll('td')

      for (let j = 0; j < hoverable.length; j++) {
        hoverable[j].classList.remove(sclass)
        if (hoverable[j].getAttribute('sorting-id') === id) {
          hoverable[j].setAttribute('class', sclass)
        }
      }
    })
  }
}

export function createTableHead(columns = []) {
  // create a checkbox,append it first and create
  // rhe remaining td tag and append to tr and finally thead tag
  let thead = document.createElement('thead')
  let tr = document.createElement('tr')

  //    make first child a check box

  let check = document.createElement('input')

  check.setAttribute('type', 'checkbox')
  check.style.marginLeft = '7px'
  let th = document.createElement('th')
  th.setAttribute('class', 'sorting sorting_asc')

  th.appendChild(check)
  tr.appendChild(th)

  for (let i = 0; i < columns.length; i++) {
    let th = document.createElement('th')
    th.innerHTML = columns[i]
    th.classList.add('sorting')
    th.setAttribute('data-th-id', i)
    th.appendChild(constructCaret())
    tr.appendChild(th)
  }

  thead.appendChild(tr)
  thead.setAttribute('class', 'thead-dark')

  return thead;
}

// create a table footer
export function TableTop() {
  // create a section to wrapall the query section
  
  let section = document.createElement('section');
  let filterField = document.createElement('input');
  let entriesField = document.createElement('select');


  filterField.setAttribute('class', 'col-4');

  entriesField.setAttribute('class', 'form-control col-1');
  entriesField.setAttribute('id', 'entries');

  let option1 = document.createElement('option');
  option1.setAttribute('value', '10');
  option1.innerHTML = '10';
  let option2 = document.createElement('option');
  option2.setAttribute('value', '25');
  option2.innerHTML = '25';
  let option3 = document.createElement('option');
  option3.setAttribute('value', '50');
  option3.innerHTML = '50';
  let option4 = document.createElement('option');
  option4.setAttribute('value', '100');
  option4.innerHTML = '100';

  entriesField.appendChild(option1);
  entriesField.appendChild(option2);
  entriesField.appendChild(option3);
  entriesField.appendChild(option4);

  let div1 = document.createElement('div');
  let div2 = document.createElement('div');

  div1.innerHTML ='show ';
  div1.appendChild(entriesField);
  div1.innerHTML += ' entries';
  div2.innerHTML = 'search: ';
  div2.appendChild(filterField);

  section.appendChild(div1);
  section.appendChild(div2)

  return section;

}

export function createTableBody(columns=[], data=[]) {
  let tbody = document.createElement('tbody')

  for (let i = 0; i < data.length; i++) {
    let tr = document.createElement('tr')

    let checkbox = document.createElement('input')

    checkbox.setAttribute('type', 'checkbox')

    const tdElement = document.createElement('td')

    tdElement.appendChild(checkbox)

    tr.appendChild(tdElement)

    if (i % 2 == 0) {
      tr.setAttribute('class', 'even')
    } else {
      tr.setAttribute('class', 'odd')
    }

    for (let j = 0; j < columns.length; j++) {
      let td = document.createElement('td')
      td.innerHTML = data[i][columns[j]]
      td.setAttribute('sorting-id', j)
      tr.appendChild(td)
    }
    tbody.appendChild(tr)
    
  }

  return tbody
  console.log(tbody)
}

export function createTableFooter() {
  let tfoot = document.createElement('tfoot')

  return tfoot
}



export function createTable(target,columns,data) {
  let toxic = document.getElementById(target);
  // document.getElementById(query).appendChild(TableTop());
  toxic.appendChild(createTableHead(columns))
  toxic.appendChild(createTableBody(columns,data))
  toxic.appendChild(createTableFooter())

  // constructSortableFace('sorting_1')
  // constructCaret()
  // contxtMenu()
}


