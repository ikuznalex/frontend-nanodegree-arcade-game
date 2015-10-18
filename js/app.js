// Enemies our player must avoid
var Enemy = function(x, y, speedOfMovement /*msec*/) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
        
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
  
    this.x = x || this.startXPosition;
    this.y = y || this.startYPosition;
    this.sprite = 'images/enemy-bug.png';
    this.speedOfMovement = speedOfMovement || 0;
};

//prototypal variables loaded to mamory once.
Enemy.prototype.maxX = 404;
Enemy.prototype.minY = 83;
Enemy.prototype.maxY = 332;
Enemy.prototype.xStep = 101;
Enemy.prototype.yStep = 83;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt, newX, newY) {
    //TODO Use dt parameter
    this.x = typeof(newX) === "undefined" ? this.x : newX;
    this.y = typeof(newY) === "undefined" ? this.y : newY;
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.canUnitChangePosition = function() {
    if (this.x <= this.maxX && this.x >= 0 && this.y <= this.maxY && this.y >= -10) {
        return true;
    } else {
        return false;
    }
};

//Set timeout example
// setTimeout(function() { alert('0.5 секунды') }, 500)


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(x, y, speedOfMovement) {
    Enemy.call(this, x, y, speedOfMovement);
    this.sprite = 'images/char-boy.png';
};

Function.prototype.inheritsFrom = function(superClass) {
   this.prototype = Object.create(superClass.prototype);
   this.prototype.constructor = this;
};

//Inherits update() and render() methods from superclass
Player.inheritsFrom(Enemy);

//Static player variables.
Player.prototype.startXPosition = 202;
Player.prototype.startYPosition = 405; 
Player.prototype.maxX = 404;
Player.prototype.maxY = 405;

Player.prototype.handleInput = function(key) {
    //invokes even if not reqiure
    //TODO: coordinates before change should be checked.
  switch (key) {
      case "left":
          //TODO dt should be passed here instead null
           this.update(undefined,  this.x - this.xStep);
          break;
      case "up":
            this.update(undefined, undefined, this.y - this.yStep);
            console.log(this.y);
          break;
      case "right": 
            this.update(undefined, this.x + this.xStep);
          break;
      case "down":
           this.update(undefined, undefined, this.y + this.yStep);
          break;
  }
  if (!this.canUnitChangePosition()) { 
      this.update(undefined, this.startXPosition, this.startYPosition);
  }
  this.render();
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var player = new Player();
var allEnemies = [ new Enemy(0, 83, 30) ];

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
