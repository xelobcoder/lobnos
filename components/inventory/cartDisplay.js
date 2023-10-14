import React from 'react'

export default function CART_DISPLAY_COMPONENT({ data, removeCartHandler, placeOrderHandler }) {
  return (
    <>
      <div  id='cart-place-order' className='br-5'>
        <div id='wrapper'>
          <div className='row'>
            <div className='col'>
              <h5>name</h5>
            </div>
            <div className='col'>
              <h5>quantity</h5>
            </div>
            <div className='col'>
              <h5>supplier</h5>
            </div>
            <div className='col'>
              <h5>purchase unit</h5>
            </div>
            <div className='col'>
              <h5>remove</h5>
            </div>
          </div>
        </div>
        {
          data.length === 0 ? <h3>cart is empty</h3> :
            data.map(item => {
              return (
                <div key={item.stockid} id='wrapper'>
                  <div className='row'>
                    <div className='col'>
                      <h5>{item.name}</h5>
                    </div>
                    <div className='col'>
                      <h5>{item.quantity}</h5>
                    </div>
                    <div className='col'>
                      <h5>{item.suppliername}</h5>
                    </div>
                    <div className='col'>
                      <h5>{item.purchaseunit}</h5>
                    </div>
                    <div className='col'>
                      <button className='btn btn-sm btn-danger'
                        onClick={(ev) => {
                          removeCartHandler(ev, item.stockid)
                        }}
                      >
                        remove</button>
                    </div>
                  </div>
                </div>
              )
            })
        }
      </div>
      {data.length > 0 && (
        <div style={{ margin: '20px' }}>
          <button className='btn btn-primary' onClick={(e) => { placeOrderHandler(e) }}>
            place order
          </button>
        </div>
      )}
    </>
  )
}


// <div className='col'>
// <button className='btn btn-sm btn-primary'
//   onClick={(e) => { placeOrderHandler(e, item.stockid) }}
// >place order
// </button>
// </div>