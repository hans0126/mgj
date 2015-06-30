/**/
requirejs.config({
    baseUrl: "js",
    paths: {
        jquery: "https://code.jquery.com/jquery-2.1.4.min",
        pixi: "lib/pixi.js/bin/pixi",
        TweenLite: "lib/greensock-js/src/minified/TweenLite.min",
        TweenMax: "lib/greensock-js/src/minified/TweenMax.min",
        EasePack: "lib/greensock-js/src/minified/easing/EasePack.min",
        datas: "app/datas",
        helps: "app/helps",
        attackModel: "app/attack_model",
        ui: "app/ui",
        init: "app/init",
        map: "app/map",
        role: "app/role",
        attack: "app/attack",
        findpath: "app/findpath",
        enemy: "app/enemy",
        meter: "lib/stats.js-master/build/stats.min",
        ui_item:"app/ui/ui_item_manager",
        help:"app/help"

    }
})


requirejs(['init', 'jquery', 'pixi', 'TweenMax', 'EasePack','meter'], function(init) {

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
    loader.add("map", "images/map.json");
    loader.add("ui", "images/ui.json");
    loader.add("role", "images/role.json");
    loader.add("blade", "images/effect_blade.json");
    loader.add("police_bg", "images/police_bg.jpg");
    loader.add("crackhouse", "images/crackhouse.fnt");

    loader.on("complete", complete);
    loader.load();

    function complete(loader, re) {
        resource = re;

     

        init.init();
    }


})
