exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        next();
    }else{
        res.status(403).send(`
            로그인 필요<br/>
            <a href='/'>Home</a>
        `);
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        next();
    }else{
        res.redirect('/');
    }
}