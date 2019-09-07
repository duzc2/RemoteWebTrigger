function loadHtmlSync(path) {
    let html;
    let err;
    $.ajax({
        type: 'GET',
        url: path,
        dataType: 'html',
        async: false,
        success: function (data, status, xhr) {
            html = data;
        },
        error: function (xhr, errorType, error) {
            err = error;
        }
    })
    if (err) {
        throw err;
    }
    return html;
}
Vue.component('clients', {
    props: ['value'],
    template: loadHtmlSync('shtml/clients.shtml'),
    data: function () {
        return { clients: DebugClient.clients };
    },
    methods: {
        openTerminal: function (cli) {
            console.log(cli);
            this.$root.openCli(cli);
        }
    }
})
Vue.component('terminal', {
    props: ['client'],
    template: loadHtmlSync('shtml/terminal.shtml'),
    data: function () {
        return {};
    },
    methods: {
    }
})
let vm = new Vue({
    el: '#app',
    data: function () {
        return {
            currentCli: null,
            openedClis: [],
            cliCount: 0,
            mutiline: false,
            jsscript: 'return Object.keys(window)'
        }
    },
    computed: {
        openedCliCount: function () {
            return this.openedClis.length;
        }
    },
    methods: {
        openCli: function (cli) {
            if (!cli.opened) {
                cli.opened = true;
                // cli.history = [];
                vm.$set(cli, 'history', [])
                this.openedClis.push(cli);
            }
            this.currentCli = cli;
        },
        runjs: function () {
            if (!this.currentCli) {
                return;
            }
            console.log(this.jsscript);
            DebugClient.sendCmd(this.currentCli.clientId, this.jsscript);
        },
        incCliCount: function () {
            this.cliCount++;
        },
        decCliCount: function () {
            this.cliCount--;
        },
        onResult: function (evt) {
            let msg = evt.message;
            let clientId = msg.clientId;
            for (let i = 0; i < this.openedClis.length; i++) {
                let cli = this.openedClis[i];
                if (cli.clientId == clientId) {
                    let result = JSON.stringify(msg.data, null, '  ');
                    cli.history.unshift(result);
                    return;
                }
            }
        }
    }
});
DebugClient.on('online', evt => {
    vm.incCliCount();
})
DebugClient.on('offline', evt => {
    vm.decCliCount();
})
DebugClient.on('result', evt => {
    vm.onResult(evt)
})