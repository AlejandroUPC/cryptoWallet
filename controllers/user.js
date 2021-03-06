const User = require('../models/user');


module.exports.loginForm = (req, res) => {
    res.render('wallets/login')
}

module.exports.loginUser = (req, res) => {
    req.flash('success', 'welcome back!')
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.userLogout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out!')
    res.redirect('/campgrounds');
}