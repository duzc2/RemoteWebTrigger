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
let vm = new Vue({
    el: '#app',
    data: function () {
        return {
            currentCli: null,
            openedClis: [],
            cliCount: 0
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
                cli.history = [];
                this.openedClis.push(cli);
            }
            this.currentCli = cli;
        }
    }
});
DebugClient.on('online', evt => {
    vm.cliCount++;
})
DebugClient.on('offline', evt => {
    vm.cliCount--;
})