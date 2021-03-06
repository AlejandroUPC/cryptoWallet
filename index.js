// server.js

// init project
var express = require("express");
const ejsMate = require('ejs-mate');
const path = require('path')
const passport = require('passport')
const localStrategy = require('passport-local');
const session = require('express-session')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session);
const User = require('./models/user');
const Wallet = require('./models/wallet');
const Transaction = require('./models/transaction');
const flash = require('connect-flash')
const bodyParser = require("body-parser");
const dotenv = require('dotenv')




dotenv.config()
var app = express();
var axios = require("axios");
const { ObjectId } = require("bson");
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())

//MONGO-MONGOOSE

const dbUrl = 'mongodb://mongodb:27017/jeiiwallet'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Connected to mongoB');
})
const store = new MongoStore({
    url: dbUrl,
    secret: `${process.env.SESSION_SECRET}`,
    touchAfter: 24 * 3600,
})

store.on('error', function (e) {
    console.log('Error', e)
})

const loadedPrices = {}

const sessionConfig = {
    store,
    secret: `${process.env.SESSION_SECRET}`,
    resave: false,
    saveUninitialized: true,
    cookie: {
        name: 'abc',
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        //secure:true YES WHEN DEPLOY
    }
}
app.use(session(sessionConfig));
app.use(flash());

//PASSPORT
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next()
})

app.get('/', (req, res) => {
    res.render('landing')
})

app.get('/login', function (req, res) {
    res.render('user/login')
})

app.get('/secret', (req, res) => {
    console.log(`The user is ${req.user}`)
    if (!req.isAuthenticated()) {
        res.send(`Not auth ${req.user}`)
    } else {
        res.send(`Auth as ${req.user}`)
    }
})
app.get("/wallet", async function (request, response) {
    const userData = await Wallet.findOne({ email: request.user.email }).populate('transactionList')
    axios
        .get(`https://api.nomics.com/v1/prices?key=${process.env.API_NOMICS_KEY}&exchange=binance`)
        .then(resp => {
            data = resp.data
            if (userData) {
                var presentCoins = []
                for (trans of userData.transactionList) {
                    if (!(presentCoins.includes(trans.currency))) {
                        presentCoins.push(trans.currency)
                    }
                }

            } else {
                return response.render('wallet/index', { data, userData: userData, presentCoins: {} });

            }
            return response.render('wallet/index', { data, userData: userData, presentCoins });
        })
        .catch(err => {
            console.log("Error fetching data from nomics", err);
        });

});

app.get('/wallet/historical/currency', async (req, res) => {
    const { cn, pd } = req.query;
    let stringQuery = `https://min-api.cryptocompare.com/data/histoday?fsym=${cn}&tsym=USD&limit=${pd}&api_key=${process.env.API_CRYPTOCOMPARE_KEY}`
    console.log(stringQuery)
    axios
        .get(stringQuery)
        .then((data) => {
            res.send(data.data)
        })
        .catch(err => {
            console.log(err)
        })
})

app.get('/wallet/graphs', async (req, res) => {
    const userData = await Wallet.findOne({ email: req.user.email }).populate('transactionList')
    function pieGraph(fullTransactions) {
        sumCurr = fullTransactions.reduce((acc, current) => {
            if (!acc[current.currency]) {
                acc[current.currency] = current.amount * current.currentPrice
            } else {
                acc[current.currency] += (current.amount * current.currentPrice)
            }
            return acc
        }, {})
        return sumCurr;
    }

    function radarChart(fullTransactions) {
        sumCurr = fullTransactions.reduce((acc, current) => {
            if (!acc[current.currency]) {
                acc[current.currency] = current.amount
            } else {
                acc[current.currency] += current.amount
            }
            return acc
        }, {})
        return sumCurr;

    }
    var plotDataPie = pieGraph(userData.transactionList)
    var plotDataChart = radarChart(userData.transactionList)
    const randomColor = () => {
        r = Math.floor(Math.random() * 255) + 1
        g = Math.floor(Math.random() * 255) + 1
        b = Math.floor(Math.random() * 255) + 1
        return `rgba(${r},${g},${b},0.4)`
    }
    var lineSets = []
    var lineDict = {}
    const histoData = async (cryptoList) => {
        for (let currentCrypto of cryptoList) {
            var currentHistorical = await axios
                .get(`https://min-api.cryptocompare.com/data/histoday?fsym=${currentCrypto}&tsym=USD&limit=90&api_key=${process.env.API_CRYPTOCOMPARE_KEY}`)
                .then(resp => {
                    var currentSet = {}
                    data_list = []
                    data = resp.data
                    for (item of data.Data) {
                        var convertedDt = new Date(item['time'] * 1000).toLocaleString('fr-CA', { year: 'numeric', month: 'numeric', day: 'numeric' })
                        lineDict[item['time']] = convertedDt
                        data_list.push(item['close'])
                    }
                    currentSet['borderColor'] = randomColor()
                    currentSet['data'] = data_list
                    currentSet['label'] = currentCrypto
                    currentSet['fill'] = false
                    currentSet['lineTension'] = 0
                    lineSets.push(currentSet)
                }).catch(err =>
                    console.log(err))
        }

        return { first: lineSets, second: Object.values(lineDict) }
    }

    const { first, second } = await histoData(Object.keys(plotDataPie))
    res.render('wallet/graphs', { userData: plotDataPie, dataSets: first, timeLines: second, radarGraph: plotDataChart })
})

app.get('/register', function (req, res) {
    res.render('user/register')
})

app.post('/wallet', (req, res) => {
    res.send('post detected')
})

app.post('/wallet/transactions', async (req, res) => {
    const newTransactions = req.body;
    const { _id, email } = req.user
    const transactionsRec = await Transaction.insertMany(newTransactions, _id)
    const updateTrans = new Transaction(transactionsRec);
    await updateTrans.updateWallet(transactionsRec, _id, email)

    //const findUser = await Users.findOne({_id:ObjectId(_id)})
})

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const newUser = new User({ username: username, email: username })
        const registerUser = await User.register(newUser, password);
        req.login(registerUser, async (err) => {
            if (err) next(err);
            const { _id } = registerUser
            const initWallet = new Wallet({ email: username, owner: ObjectId(_id), transactionList: [] })
            const registerWallet = await Wallet.findOne({ email: username })
            if (!registerWallet) {
                await Wallet.create(initWallet).then((data) => { console.log('Wallet created') }).catch((err) => { console.log(err) });
                res.redirect('/wallet')
            }
        });

    } catch (err) {
        console.log('error', err.message);
        res.redirect('/register')
    };
})


app.post("/login", passport.authenticate("local", {
    successRedirect: "/wallet",
    failureRedirect: "/login",
    failureFlash: true
}),
    function (req, res) {
    }
);

app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


// listen for requests :)
var listener = app.listen(3000, function () {
    console.log("Your app is listening on port 3000");
});
