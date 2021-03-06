/*
* TODO: add a clip size and R for reload
*
* TODO: try to find if i can use default params anywhere.
*/
(function() {
    // game constructor

    class Game {
        constructor(canvasId) {
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
            // var self = this;

            var tick = () => {
                // game logic
                /* 
                * this will delegate to the other update functions 
                * so they can independatly do what they need to do
                */
                this.update();
                // draw game
                this.draw(screen, gameSize);
                // "run this in the near future and the browser aims for 60 times a second"
                // this is what runs the code 60 times a second
                requestAnimationFrame(tick);
            };

            // initial run of tick()
            tick();
        }

        update() {
            var notCollidindWithAnything = (b1) => {
                return this.bodies.filter(function(b2) { 
                    // keep all the ones that are colliding
                    return colliding(b1, b2); }).length === 0;
            };

            this.bodies = this.bodies.filter(notCollidindWithAnything);

            for(let i = 0; i < this.bodies.length; i++) {
                this.bodies[i].update();
            }
        }

        draw(screen, gameSize) {
            screen.clearRect(0, 0, gameSize.x, gameSize.y);
            // draw player   
            for(let i = 0; i < this.bodies.length; i++) {
                drawRect(screen, this.bodies[i]);
            }
        }

        addBody(body) {
            this.bodies.push(body);
        }

        invadersBelow(invader) {
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
    }

    class Player {
        constructor(game, gameSize) {
            this.game = game;
            this.size = { x: 15, y: 15 };
            this.center = { 
                x: gameSize.x / 2, 
                y: gameSize.y - this.size.x
            };
            // instantiate keyboarder
            this.keyboarder = new Keyboarder(); 
        }

        update() {
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

    }

    class Bullet {
        constructor(center, velocity) {
            this.size = { x: 3, y: 3};
            this.center = center;
            this.velocity = velocity;
        }

        update() {
            this.center.x += this.velocity.x;
            this.center.y += this.velocity.y;
        }
    }

    class Invader {
        constructor(game, center) {
            this.game = game;
            this.size = { x: 12, y: 12 };
            this.center = center;
            this.patrolX = 0;
            this.speedX = 0.3;
        }

        update() {
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
    }

    var createInvaders = (game) => {
        var invaders = [];

        for(let i = 0; i < 24; i++) {
            // 8 columns, spaced 30 apart
            var x = 30 + (i % 8) * 30;
            // 3 rows, spaced 30 apart
            var y = 30 + (i % 3) * 30;
            invaders.push(new Invader(game, { x: x, y: y }))
        }

        return invaders;
    };

    var drawRect = (screen, body) => {
        screen.fillRect(
            body.center.x - body.size.x / 2, 
            body.center.y - body.size.y / 2,
            body.size.x, 
            body.size.y
        );
    }

    // player movement
    class Keyboarder {
        constructor () {
            var keyState = {};

            window.onkeydown = (e) => keyState[e.keyCode] = true;

            window.onkeyup = (e) => keyState[e.keyCode] = false;

            this.isDown = (keyCode) => keyState[keyCode] === true;

            this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32 };
        }
    }

    // if any 5 conditions are true, the bodies are NOT colliding
    var colliding = (b1, b2) => !(b1 === b2 || 
                                b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
                                b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
                                b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
                                b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2);

    window.onload = () => new Game("screen");

})();