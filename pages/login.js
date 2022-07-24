export default function Login() {
    return (
        <div className="login">
            <div className="login__container">
                <div className="login__logo">
                    {/* <image src='../pages/logo.png' alt="logo" /> */}
                </div>
                <div className="login__form">
                    <div className="login__form__title">
                        <div className="login-group">
                            <h2>Welcome back!</h2>
                            <p>Sign in to your account</p>
                        </div>
                    </div>
                    <div className="login__form__input">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" />
                    </div>
                    <div className="login__form__input">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" />
                    </div>
                    <div className="login__form__button">
                        <button>Sign in</button>
                    </div>
                    <div className="login__form__forgot">
                        <a href="/forgotpassword?email">Forgot your password?</a>
                    </div>
                </div>
            </div>
        </div>
    )
}