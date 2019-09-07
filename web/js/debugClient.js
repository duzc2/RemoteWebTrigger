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
        sendCmd(targetClientConnectionId, cmd) {

        }
    };

    let client;
    function online(info) {
        info.opened = false;
        client.clients.push(info);
        console.log(info);
        client.dispatchEvent(new Event('online', { client: info }));
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
                    elements.splice(i, 1);
                    client.dispatchEvent(new Event('offline', { client: e }));
                    return;
                }
            }
        }
    };
    function init() {
        var ws = new WebSocket('ws://' + location.host + '/ws/manager');
        ws.onopen = function (event) {
            client.dispatchEvent(new Event('open', { webSocket: ws }));
        }
        ws.onmessage = function (event) {
            let data = JSON.parse(event.data);
            if (msgHandlers[data.type]) {
                msgHandlers[data.type](data);
            } else {
                console.log('no handler for ' + data.type);
            }
        }
        client = new Client(ws);
    }
    init();
    window.DebugClient = client;
})()