(function () {
    let client = {
        result: function (result, req) {
            client.ws.send(JSON.stringify({ type: "result", data: result, manId: req.manId }));
        },
        error: function (error, req) {
            client.ws.send(JSON.stringify({ type: "error", data: error.message, manId: req.manId }));
        }
    };
    let msgHandlers = {
        cmd: function (data) {
            var func = new Function('client', 'req', data.cmd);
            try {
                let ret = func(client, data);
                client.result(ret, data);
            } catch (e) {
                client.error(e, data);
            }
        }
    };
    function init() {
        let dom = document.getElementsByName('RemoteJSDebugger');
        if (dom.length != 1) {
            console.log("RemoteJSDebugger exit");
            return;
        }
        dom = dom[0];
        let src = dom.src;
        src = 'ws' + src.substring(src.indexOf('//') - 1, src.indexOf('/', 10) + 1) + 'ws/client';
        console.log(src);
        var ws = new WebSocket(src);
        ws.onopen = function (event) {
            ws.send(JSON.stringify({ type: 'online', location: window.location.href }));
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
        client.ws = ws;
    }
    init();
})()