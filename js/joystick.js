/**/
requirejs.config({
    baseUrl: "js",
    paths: {
        jquery: "https://code.jquery.com/jquery-2.1.4.min",
        io: "https://cdn.socket.io/socket.io-1.3.5",
        pixi: "lib/pixi.js/bin/pixi",
        TweenMax: "lib/greensock-js/src/minified/TweenMax.min",
        EasePack: "lib/greensock-js/src/minified/easing/EasePack.min",
        init: "app/joystick_init",
        meter: "lib/stats.js-master/build/stats.min"
    }
})

requirejs(['init', 'io', 'jquery', 'pixi', 'TweenMax', 'EasePack', 'meter'], function(init, io) {

    PIXI.Container.prototype.updateLayersOrder = function() {
        this.children.sort(function(a, b) {
            a.zIndex = a.zIndex || 0;
            b.zIndex = b.zIndex || 0;
            return a.zIndex - b.zIndex
        });
    }

    Object.defineProperties(PIXI.Container.prototype, {
        scaleX: {
            get: function() {
                return this.scale.x;
            },
            set: function(v) {
                this.scale.x = v;
            }
        },
        scaleY: {
            get: function() {
                return this.scale.y;
            },
            set: function(v) {
                this.scale.y = v;
            }
        }
    });



    loader = new PIXI.loaders.Loader();
    loader.add("joystick", "images/joystick.json");
    loader.on("complete", complete);
    loader.load();

    function complete(loader, re) {
        resource = re;
        // init.init();

        $('#joinBtn').on('click', joinGame);


        function joinGame() {
            currentId = Math.floor(Math.random() * 1000) + "_" + Math.floor(Math.random() * 1000);
            window.localStorage['id'] = currentId;

            var socket = io();

            socket.emit('register', {
                id: currentId
            });

            $(this).hide();
            init.init();

        };
    }



})
