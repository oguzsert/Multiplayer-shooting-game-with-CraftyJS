Crafty.c("Player", {
    // This function will be called when the component is added to an entity
    // So it sets up the things that both our entities had in common
    init: function() {
        this.addComponent("2D, Canvas, Color, Twoway");

        this._playerId = new Date().getTime();

        this.w = 16;
        this.h = 16;
        this.z = 1;
        this.rotation = 0;
    },

    remove: function() {
        Crafty.log('Tank was removed!');
    },

    place: function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    },

    addWeapon: function(type){
        this.origin('center');
        if(type == 'rifle'){
            var rifle = Crafty.e("2D, Canvas, Color").attr({x:16, y:5, w:8, h:5,z:2}).color('red');
			this.attach(rifle);
        }

        return this;
    },

    name: function(name) {
            this.name = name;
        this.attach(Crafty.e("2D, DOM, Text").attr({ x: 10, y: 20 }).text(name).textColor(name).textFont({ size: '11px', weight: 'bold' }));
        return this;
    }
});

Crafty.c("ControlablePlayer", {
    
    init: function() {
        this.addComponent("Player");

        this.bind('KeyDown', function(e) {
            if(e.key == Crafty.keys.LEFT_ARROW) {
                this.rotatePlayer("left");
            } else if (e.key == Crafty.keys.RIGHT_ARROW) {
                this.rotatePlayer("right");
            } else if (e.key == Crafty.keys.UP_ARROW) {
                this.movePlayer("forward");
            } else if (e.key == Crafty.keys.DOWN_ARROW) {
                this.movePlayer("backward");
            } else if(e.key == Crafty.keys.SPACE)	{
                this.shoot();
            }
        });

		this.bind('KeyUp', function(e) {
            if(e.key == Crafty.keys.LEFT_ARROW) {
                this.rotatePlayer("stopRotate");
            } else if (e.key == Crafty.keys.RIGHT_ARROW) {
                this.rotatePlayer("stopRotate");
            } else if (e.key == Crafty.keys.UP_ARROW) {
                this.movePlayer("stopMovement");
            } else if (e.key == Crafty.keys.DOWN_ARROW) {
                this.movePlayer("stopMovement");
            }								
        });
    },

    movePlayer:	function(direction, _player){	
        console.log(direction);
        
        var that = this;

        window.clearInterval(this._movementInterval);
        
        if(direction == "stopMovement"){
		    return;
        }
        
		this._movementInterval = window.setInterval(function(){
            if(direction == "forward"){
                var newX = that.x + 2 * Math.cos(that.rotation * Math.PI / 180);
                var newY = that.y + 2 * Math.sin(that.rotation * Math.PI / 180);

                that.place(newX, newY);
            }
            else if(direction == "backward"){
                var newX = that.x - 2 * Math.cos(that.rotation * Math.PI / 180);
                var newY = that.y - 2 * Math.sin(that.rotation * Math.PI / 180);

                that.place(newX, newY);
            }
        },1);
    },

    rotatePlayer: function (direction){
        var that = this;

        window.clearInterval(this._rotateInterval);

        if(direction == "stopRotate"){
            return;
        }

        this._rotateInterval = window.setInterval(function(){
            if(direction == "right"){
                that.rotation += 0.5;
            }
            else if(direction == "left"){
                that.rotation -= 0.5;
            }
        },1);
    },

    shoot: function (){
        var _x = this.x;
        var _y = this.y;
        var _rotation = this.rotation;
        
        _x += (2 * Math.cos(_rotation * Math.PI / 180)) + 16;
        _y += (2 * Math.sin(_rotation * Math.PI / 180)) + 16;
        
        var bullet = Crafty.e("2D, Canvas, Color, Tween").attr({ x:_x, y:_y, w:8, h:8,z:1, rotation: this.rotation }).color("orange");
        
        window.setInterval(function(){									
            bullet.x += 2 * Math.cos(_rotation * Math.PI / 180);
            bullet.y += 2 * Math.sin(_rotation * Math.PI / 180);										
        },1);
    }
});