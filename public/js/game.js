/*
* TODO: add a clip size and R for reload
*/
(function() {
    // game constructor
    var Game = function (canvasId) {
        var canvas = document.getElementById(canvasId);
        var screen = canvas.getContext('2d');
        // store width and height of canvas for later use
        var gameSize = {
            x: canvas.width, 
            y: canvas.height 
        }; 

        // boddies are players, invaders, bullets
        // players params = the game and size => putting player in the right place 
        // .concat merges two arrays
        this.bodies = createInvaders(this).concat(new Player(this, gameSize));

        // runs all main game logic 60 times a second
        var self = this;

        var tick  = function() {
            // game logic
            /* 
            * this will delegate to the other update functions 
            * so they can independatly do what they need to do
            */
            self.update();
            // draw game
            self.draw(screen, gameSize);
            // "run this in the near future and the browser aims for 60 times a second"
            // this is what runs the code 60 times a second
            requestAnimationFrame(tick);
        };

        // initial run of tick()
        tick();

    };

    
    Game.prototype = {
        update: function() {
            var bodies = this.bodies;
            var notCollidindWithAnything = function(b1) {
                return bodies.filter(function(b2) { 
                    // keep all the ones that are colliding
                    return colliding(b1, b2); }).length === 0;
            };

            this.bodies = this.bodies.filter(notCollidindWithAnything);

            for(var i = 0; i < this.bodies.length; i++) {
                this.bodies[i].update();
            }
        },

        draw: function(screen, gameSize) {
            screen.clearRect(0, 0, gameSize.x, gameSize.y);
            // draw player   
            for(var i = 0; i < this.bodies.length; i++) {
                drawRect(screen, this.bodies[i]);
            }
        }, 

        addBody: function(body) {
            this.bodies.push(body);
        }, 

        // this prevents invaders from shooting if there are invaders below.
        invadersBelow: function(invader) {
            return this.bodies.filter(function(b){
                /* conditions
                *   keep all bodies that are invaders
                *   are somewhere below
                *   are directly below
                */

                // this will return an array and if it is greater than zero, there are invaders below, so dont shoot
                return b instanceof Invader && 
                    b.center.y > invader.center.y &&
                    b.center.x - invader.center.x < invader.size.x;
            }).length > 0;
        }
    };
    
    // player constructor
    var Player = function(game, gameSize) {
        this.game = game;
        this.size = { x: 15, y: 15 };
        this.center = { 
            x: gameSize.x / 2, 
            y: gameSize.y - this.size.x
        };
        // instantiate keyboarder
        this.keyboarder = new Keyboarder(); 
    };

    Player.prototype = {
        update: function () {
            if(this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
                this.center.x -= 2; 
            } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
                this.center.x += 2;
            }

            if(this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
                // just above the character
                var center = { x: this.center.x, y: this.center.y - this.size.x / 2 };
                var velocity = {x: 0, y: -6};

                var bullet = new Bullet(center, velocity);

                this.game.addBody(bullet);
            }
        }
    };

    var Bullet = function (center, velocity) {
        this.size = { x: 3, y: 3};
        this.center = center;
        this.velocity = velocity;
    };

    Bullet.prototype = {
        update: function() {
            this.center.x += this.velocity.x;
            this.center.y += this.velocity.y;
        }
    };

    var Invader = function(game, center) {
        this.game = game;
        this.size = { x: 12, y: 12 };
        this.center = center;
        this.patrolX = 0;
        this.speedX = 0.3;
    };

    Invader.prototype = {
        update: function () {
            if(this.patrolX < 0 || this.patrolX > 40) {
                this.speedX = -this.speedX;
            } 

            this.center.x += this.speedX;
            this.patrolX += this.speedX;
           
            if(Math.random() > 0.995 && !this.game.invadersBelow(this)) {
                var center = { x: this.center.x, y: this.center.y + this.size.x / 2 };
                var velocity = {x: Math.random() - .5, y: 2 };

                var bullet = new Bullet(center, velocity);

                this.game.addBody(bullet);
            }
        }
    };

    var createInvaders = function(game) {
        var invaders = [];

        for( var i = 0; i < 24; i++) {
            // 8 columns, spaced 30 apart
            var x = 30 + (i % 8) * 30;
            // 3 rows, spaced 30 apart
            var y = 30 + (i % 3) * 30;
            invaders.push(new Invader(game, { x: x, y: y }))
        }

        return invaders;
    };

    var drawRect = function (screen, body) {
        screen.fillRect(
            body.center.x - body.size.x / 2, 
            body.center.y - body.size.y / 2,
            body.size.x, 
            body.size.y
        );
    }

    // player movement
    var Keyboarder = function () {
        // records any key pressed is down or up right now
        var keyState = {};

        window.onkeydown = function(e) {
            keyState[e.keyCode] = true;
        };

        window.onkeyup = function(e) {
            keyState[e.keyCode] = false;
        };

        this.isDown = function(keyCode) {
            return keyState[keyCode] === true;
        };

        this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32 };
    };

    // if any 5 conditions are true, the bodies are NOT colliding
    var colliding = function(b1, b2) {
        // the bottom 4 checks are as follows: 
        // if the right side of a b1 is to the left of the left side of b2
        // if the bottom of b1 is above top of b2
        // etc
        return !(b1 === b2 || 
                b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
                b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
                b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
                b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2);
    };

    window.onload = function() {
        new Game("screen");
    };
})();