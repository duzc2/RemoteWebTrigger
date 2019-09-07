(function () {
    class Client extends EventTarget {
        constructor(ws) {
            super();
            this.ws = ws;
            this.on = this.addEventListener;
            this.off = this.removeEventListener;
            this.clients = []
        }

        result(result, req) {
        }
        error(error, req) {
        }
        sendCmd(cid, js) {
            this.ws.send(JSON.stringify({ type: 'cmd', clientId: cid, cmd: js }));
        }
    };

    let client;
    function online(info) {
        info.opened = false;
        info.connected = true;
        client.clients.push(info);
        console.log(info);
        let evt = new Event('online');
        evt.client = info;
        client.dispatchEvent(evt);
    }
    let msgHandlers = {
        onlineInit: function (msg) {
            for (let k in msg.list) {
                let info = msg.list[k]
                online(info)
            }
            console.log(msg.list);
        },
        online: function (msg) {
            msg.info.opened = false;
            online(msg.info)
        },
        offline: function (msg) {
            let clientId = msg.clientId;
            let elements = client.clients;
            console.log('offline ' + clientId)
            for (var i = elements.length - 1; i >= 0; i--) {
                if (elements[i].clientId == clientId) {
                    let e = elements[i]
                    e.connected = false;
                    elements.splice(i, 1);
                    let evt = new Event('offline');
                    evt.client = e;
                    client.dispatchEvent(evt);
                    return;
                }
            }
        },
        result: function (msg) {
            let evt = new Event('result');
            evt.message = msg;
            client.dispatchEvent(evt);
        }
    };
    function init() {
        var ws = new WebSocket('ws://' + location.host + '/ws/manager');
        ws.onopen = function (event) {
            let evt = new Event('open');
            evt.webSocket = ws
            client.dispatchEvent(evt);
        }
        ws.onmessage = function (event) {
            let data = JSON.parse(event.data);
            if (msgHandlers[data.type]) {
                msgHandlers[data.type](data);
            } else {
                console.log('no handler for ' + data.type);
                console.log(data);
            }
        }
        client = new Client(ws);
    }
    init();
    window.DebugClient = client;
})()