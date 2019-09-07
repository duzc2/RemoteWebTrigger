var express = require('express');
var router = express.Router();
let expws;
var connectionId = 0
var clients = {}
var managers = {}
function broadcastManagers(msg1) {
    let msg = JSON.stringify(msg1);
    for (let k in managers) {
        let manager = managers[k];
        manager.send(msg);
    }
}
let clientMsgHandlers = {
    online: function (msg, ws) {
        ws.location = msg.location;
        let mgrmsg = { type: 'online', info: { clientId: ws.connectionId, userAgent: ws.userAgent, location: ws.location, sessionID: ws.sessionID } };
        broadcastManagers(mgrmsg);
    },
    result: function (msg, ws) {
        let manId = msg.manId;
        let man = managers[manId];
        if (man) {
            msg.clientId = ws.connectionId
            man.send(JSON.stringify(msg))
        }
    },
    error: function (msg, ws) {
        let manId = msg.manId;
        let man = managers[manId];
        if (man) {
            msg.clientId = ws.connectionId
            man.send(JSON.stringify(msg))
        }
    }
}
let managerMsgHandlers = {
    cmd: function (msg, ws) {
        let cli = clients[msg.clientId];
        if (cli) {
            msg.manId = ws.connectionId;
            cli.send(JSON.stringify(msg));
        }
    }
}
router.ws('/client', function (ws, req) {
    ws.on('message', function (msg1) {
        let msg = JSON.parse(msg1);
        let type = msg.type;
        if (clientMsgHandlers[type]) {
            clientMsgHandlers[type](msg, ws)
        } else {
            console.log('no handler for client ' + msg.type)
            console.log(msg1);
        }
    })
    ws.on('close', function (evt) {
        let mgrmsg = { type: 'offline', clientId: ws.connectionId };
        broadcastManagers(mgrmsg);
        delete clients[ws.connectionId]
    })
    console.log(ws);
    console.log(req);
    ws.connectionId = connectionId;
    ws.userAgent = req.headers['user-agent']
    ws.sessionID = req.sessionID;
    clients[connectionId] = ws;
    connectionId++;
    // ws.send(JSON.stringify({ type: 'cmd', cmd: 'client.result(Object.keys(window),req)' }))
});
router.ws('/manager', function (ws, res) {
    ws.on('message', function (msg1) {
        let msg = JSON.parse(msg1);
        let type = msg.type;
        if (managerMsgHandlers[type]) {
            managerMsgHandlers[type](msg, ws)
        } else {
            console.log('no handler for manager ' + msg.type)
            console.log(msg1);
        }
    })
    ws.on('close', function (evt) {
        delete managers[ws.connectionId]
    })
    ws.connectionId = connectionId;
    managers[connectionId] = ws
    connectionId++

    let mgrmsg = { type: 'onlineInit', list: [] };
    for (let i in clients) {
        let cws = clients[i]
        mgrmsg.list.push({ clientId: cws.connectionId, userAgent: cws.userAgent, location: cws.location, sessionID: cws.sessionID });
    }
    ws.send(JSON.stringify(mgrmsg));
});
module.exports = function (_expws) {
    expws = _expws;
    return router;
}
