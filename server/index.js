var express = require('express');
var config = require('config')
var helmet = require('helmet')
var bodyParser = require('body-parser')
var session = require('express-session')
var MemoryStore = require('memorystore')(session)
var compression = require('compression')
var app = express();
var expressWs = require('express-ws')(app);

app.all('*', function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", req.headers.origin);
    // res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.header("X-Powered-By", ' RemoteJSDebugger')
    if (req.method == 'OPTIONS') {
        //让options请求快速返回
        res.sendStatus(200);
    } else {
        next();
    }
});
app.use(helmet());
app.use(compression({
    level: 9
}));

app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.text({
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.raw({
    limit: '50mb',
    type: '*/*'
}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('trust proxy', 1); // trust first proxy 

app.use(session({
    secret: 'fh9432nhpg349',
    resave: true,
    rolling: true,
    saveUninitialized: true,
    cookie: {
        // secure: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 60
    },
    store: new MemoryStore({
        max: 300000,
        checkPeriod: 86400000 // prune expired entries every 24h
    })
}));
app.use(express.static('../web', {
    maxAge: 0
}));
let debuggerWS = require('./debuggerWS')(expressWs);
app.use('/ws', debuggerWS)
var port = config.get('port')
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});
