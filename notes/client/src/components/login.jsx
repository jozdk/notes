import Header from "./header.jsx";

const Login = () => {
    return (
        <>  
            <Header />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 btn-group-vertical" role="group">
                        <form method="POST" action="/users/login">
                            <div className="mb-3">
                                <label htmlFor="username" className="form-label">Username</label>
                                <input type="text" id="username" name="username" value="" placeholder="Your username" className="form-control" />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Password</label>
                                <input type="password" id="password" name="password" value="" placeholder="Your password" className="form-control" />
                            </div>
                            <button type="submit" className="btn btn-secondary">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        </>

    )
}

export default Login;