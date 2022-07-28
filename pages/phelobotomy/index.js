import Header from "../../components/header";

function AccessAuthPhelo () {
    return(
        <>
           <div className='--login-prism'>
               <div className="error"></div>
               <div className="--login-prism-group">
                    <input  tabIndex='1' type='text' required placeholder="username" id="username"  ></input>
                    <input tabIndex='2' type='password' required placeholder="password" id='password' ></input>
                    <button  type='button' tabIndex='3' className="">Login</button>
               </div>
           </div>
        </>
    )
}

export default AccessAuthPhelo;





AccessAuthPhelo.getLayout = function(page){
    return(
        <>
           <Header/>
           {page}
        </>
    )
}