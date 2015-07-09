define(['app/keyboard', 'io'], function(kb, io) {
    // var socket = io();

    function init() {
        var scores = 10;
        stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms

        // align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.right = '0px';
        stats.domElement.style.top = '0px';

        document.body.appendChild(stats.domElement);

        displayWidth = window.innerWidth;
        displayHeight = window.innerHeight;

        stage = new PIXI.Container();

        var joyStickLayer = new PIXI.Container();
        var buttonLayer = new PIXI.Container();
        var ta ='';

      // buttonLayer.x = displayWidth / 2;

     

     
        

        for (var i = 0; i < 15; i++) {
            var _btn = new PIXI.Graphics();
            _btn.beginFill(0x999999);
            _btn.drawCircle(0, 0, 50);
            _btn.interactive = true;
            _btn.buttonMode = true;
            _btn.x = Math.floor(Math.random()*750);
            _btn.y = Math.floor(Math.random()*500);
            buttonLayer.addChild(_btn);
            _btn.name = i;

            _btn.on('mousedown', showJoystick)
            .on('touchstart', showJoystick)
            .on('mouseup', hideJoystick)
            .on('mouseupoutside', hideJoystick)
            .on('touchend', hideJoystick)
            .on('touchendoutside', hideJoystick)
            .on('mousemove', joystickMove)
            .on('touchmove', joystickMove);




        }

        /*shoot.on('mousedown', _shooting)
            .on('touchstart', _shooting);*/

        //需要劃一個area 做touch area
      //  joyStickLayer.hitArea = new PIXI.Rectangle(0, 0, displayWidth / 2, displayHeight);

       // joyStickLayer.interactive = true;
//        joyStickLayer.buttonMode = true;


        renderer = PIXI.autoDetectRenderer(displayWidth, displayHeight, {
            backgroundColor: 0xFFFFFF
        });

        document.getElementById("gameView").appendChild(renderer.view);

        var joystick = new PIXI.Sprite.fromFrame('joystick_base.png');

        var stick = new PIXI.Sprite.fromFrame('joystick.png');

        var score = createScore();

        score.text =  1999;



        /*stick.anchor.x = 0.5;
        stick.anchor.y = 0.5;*/

        joystick.anchor.x = 0.5;
        joystick.anchor.y = 0.5;
        stick.anchor.x = 0.5;
        stick.anchor.y = 0.5;

        joystick.addChild(stick);
        joyStickLayer.addChild(joystick)
        stage.addChild(joyStickLayer);
        stage.addChild(buttonLayer);


        joystick.x = joystick.width / 2 + 100;
        joystick.y = joystick.height / 2 + 100;

        /*stick.x = joystick.width / 2 - stick.width / 2;
        stick.y = joystick.height / 2 - stick.height / 2;*/
        joystick.visible = false
        stick.interactive = true;
        stick.buttonMode = true;


        /* joyStickLayer.on('mousedown', showJoystick)
            .on('touchstart', showJoystick)
            .on('mouseup', hideJoystick)
            .on('mouseupoutside', hideJoystick)
            .on('touchend', hideJoystick)
            .on('touchendoutside', hideJoystick)
            .on('mousemove', joystickMove)
            .on('touchmove', joystickMove);
*/



        function showJoystick(event) {
           
           //$('body').append(event.data.identifier);
           // event.data.originalEvent.preventDefault();
           //event.name = Math.random()*999;
           console.log(event);
          ta+=event.data.identifier;
          score.text = "A"+ta;
            var _tp = event.data.getLocalPosition(this);
            this.alpha = 0.5;
         

            //onDragStart.call(stick, event);
            this.data = event.data;
            //this.alpha = 0.5;
            this.dragging = true;

            this.sx = this.data.getLocalPosition(this).x * this.scale.x;
            this.sy = this.data.getLocalPosition(this).y * this.scale.y;


          

        }

        function hideJoystick(event) {
           
            // joystick.visible = false;
            this.dragging = false;
            // set the interaction data to null
            this.data = null;
           
            socketEmit(0, 0);
           
        }

        function joystickMove() {
            if (this.dragging) {
                var newPosition = this.data.getLocalPosition(this.parent),
                    _px = newPosition.x - this.sx,
                    _py = newPosition.y - this.sy,
                    _returnPostion = {
                        x: 0,
                        y: 0
                    };

                this.x = _px;
                this.y = _py;
              
            }
        }

        function _shooting() {
            //   socket.emit('shooting',currentId);
        }

        //var socket = io();
        /*
        socket.on('get score', function(msg) {
            if (msg.id == currentId) {
                score.text = msg.score;
            }
        })
    */
        var left = kb.keyboard(37),
            up = kb.keyboard(38),
            right = kb.keyboard(39),
            down = kb.keyboard(40);

        //Left arrow key `press` method
        left.press = function() {
            socketEmit(-5, 0);
        };

        //Left arrow key `release` method
        left.release = function() {
            if (!right.isDown) {
                socketEmit(0, 0);
            }
        };

        //Up
        up.press = function() {
            socketEmit(0, -5);
        };
        up.release = function() {
            if (!down.isDown) {
                socketEmit(0, 0);
            }
        };

        //Right
        right.press = function() {
            socketEmit(5, 0);
        };
        right.release = function() {
            if (!left.isDown) {
                socketEmit(0, 0);
            }
        };

        //Down
        down.press = function() {
            socketEmit(0, 5);
        };
        down.release = function() {
            if (!up.isDown) {
                socketEmit(0, 0);
            }
        };

        //Set the game state

        animate();

        function createButton() {
            var _btn = new PIXI.Graphics();
            _btn.beginFill(0x999999);
            _btn.drawCircle(0, 0, 100);

            buttonLayer.addChild(_btn);
            return _btn;
        }

        function createScore() {
            var _scoreLayer = new PIXI.Container();
            var _sTitle = new PIXI.Text("score:", {
                font: '50px Arial',
                fill: 0xaaaaaa
            });
            var _score = new PIXI.Text("0", {
                font: '50px Arial',
                fill: 0x333333
            });
            _scoreLayer.addChild(_sTitle);
            _scoreLayer.addChild(_score);
            _score.x = _sTitle.width + 10;
            stage.addChild(_scoreLayer);

            _scoreLayer.x = displayWidth / 2;

            return _score;
        }

    }

    function animate() {
        stats.begin();
        renderer.render(stage);
        // state();
        stats.end();
        requestAnimFrame(animate);
    }

    function socketEmit(_x, _y) {

        /* socket.emit('update', {
             x: _x,
             y: _y,
             id: currentId
         });*/
    }

    /* requestAnimFrame */
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();






    return {
        init: init
    }
})
