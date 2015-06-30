define(['app/keyboard', 'io'], function(kb, io) {
    var socket = io();
    function init() {

        var socket = io();


        var left = kb.keyboard(37),
            up = kb.keyboard(38),
            right = kb.keyboard(39),
            down = kb.keyboard(40);

        //Left arrow key `press` method
        left.press = function() {
            //Change the playerRole's velocity when the key is pressed
            // playerRole.vx = -5;
            // playerRole.vy = 0;
           // console.log("A");
           socketEmit(-5,0);
        };

        //Left arrow key `release` method
        left.release = function() {

            //If the left arrow has been released, and the right arrow isn't down,
            //and the playerRole isn't moving vertically:
            //Stop the playerRole
            
            if (!right.isDown) {
               socketEmit(0,0);
            }


        };

        //Up
        up.press = function() {         
             socketEmit(0,-5);
        };
        up.release = function() {
             if (!down.isDown) {
               socketEmit(0,0);
             }
        };

        //Right
        right.press = function() {        

             socketEmit(5,0);
        };
        right.release = function() {
            if (!left.isDown) {
                socketEmit(0,0);
            }
        };

        //Down
        down.press = function() {
             socketEmit(0,5);
        };
        down.release = function() {
             if (!up.isDown) {
                 socketEmit(0,0);
             }
        };

        //Set the game state



    }

    function animate() {
        stats.begin();
        renderer.render(stage);
        state();
        stats.end();
        requestAnimFrame(animate);
    }

    function socketEmit(_x, _y) {

        socket.emit('update', {
            x: _x,
            y: _y
        });
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
