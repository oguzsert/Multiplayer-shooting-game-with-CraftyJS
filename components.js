Crafty.c("Player", {

    init: function () {
        this.addComponent("2D, Canvas, Color, Twoway");

        this._playerId = new Date().getTime();
		this.socket = null;
        this.w = 16;
        this.h = 16;
        this.z = 10;
        this.rotation = 0;
    },

    place: function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    },

    addWeapon: function (type) {
        this.origin('center');
        if (type == 'rifle') {
            var rifle = Crafty.e("2D, Canvas, Color").attr({ x: 16, y: 5, w: 8, h: 5, z: 10 }).color('red');
            this.attach(rifle);
        }

        return this;
    },

    setName: function (name) {
        this.name = name;
        return this;
    },

    showName: function (name) {
        this.attach(Crafty.e("2D, DOM, Text").attr({ x: this.x, y: this.y + 20 }).text(this.name).textColor('black').textFont({ size: '11px', weight: 'bold' }));
        return this;
    },
	
	setId: function(id){
		if(id !== undefined){
			this._playerId = id;
		}
		return this;
	},
	
	bindSocket:function(socketObject){
		this.socket = socketObject;
		this.onSocketBinded(this.socket);
		return this;
	}
	
	
});

Crafty.c("ControlablePlayer", {

    init: function () {
        this.addComponent("Player");
        this.engineStarted = false;
        this.movingForward = false;
        this.movingBackward = false;
		var that =this;
		this.onSocketBinded = function(socket){
			socket.on("player-engine-on",function(id){
				console.log(that._playerId,that.name,"ENGINE-ON",id);
				if(id == that._playerId){
					that.startEngine();
				}
			});
		
			socket.on("player-engine-off",function(id){
				console.log(that._playerId,that.name,"ENGINE-OFF",id);
				if(id == that._playerId){
					that.stopEngine();
				}
			});
			
			socket.on("player-move-forward",function(id){
				console.log(that._playerId,that.name,"MOVING-FORWARD");
				if(id == that._playerId){
					that.movePlayer("forward");
				}
			});
			
			
			socket.on("player-move-backward",function(id){
				console.log(that._playerId,that.name,"MOVING-BACKWARD");
				if(id == that._playerId){
					that.movePlayer("backward");
				}
			});
			
			
			socket.on("player-stop-movement",function(id){
				console.log(that._playerId,that.name,"STOP-MOVEMENT");
				if(id == that._playerId){
					that.movePlayer("stopMovement");
				}
			});
			
			socket.on("player-rotate-right",function(id){
				console.log(that._playerId,that.name,"ROTATE-RIGHT");
				if(id == that._playerId){
					that.rotatePlayer("right");
				}
			});
			
			
			socket.on("player-rotate-left",function(id){
				console.log(that._playerId,that.name,"ROTATE-LEFT");
				if(id == that._playerId){
					that.rotatePlayer("left");
				}
			});
			
			
			socket.on("player-rotate-stop",function(id){
				console.log(that._playerId,that.name,"ROTATE-STOP");
				if(id == that._playerId){
					that.rotatePlayer("stopRotate");
				}
			});
			
			
		}
		
	

        this.bind('KeyDown', function (e) {
            if (e.key == Crafty.keys.E) {
                if (!this.engineStarted) {
                    this.startEngine();
					this.socket.emit("engine-on",this._playerId);
                } else {
                    this.stopEngine();
					this.socket.emit("engine-off",this._playerId);
                }				
            } else if (e.key == Crafty.keys.LEFT_ARROW) {
				this.socket.emit("rotate-left",this._playerId);
                this.rotatePlayer("left");
            } else if (e.key == Crafty.keys.RIGHT_ARROW) {
                this.rotatePlayer("right");
				this.socket.emit("rotate-right",this._playerId);
            } else if (e.key == Crafty.keys.UP_ARROW) {
				this.socket.emit("move-forward",this._playerId);
                this.movePlayer("forward");
            } else if (e.key == Crafty.keys.DOWN_ARROW) {
				this.socket.emit("move-backward",this._playerId);
                this.movePlayer("backward");
            } else if (e.key == Crafty.keys.SPACE) {
                //this.shoot();
                this.startShoot(this.shoot);
            } else if (e.key == Crafty.keys.X) {
                this.shoot3();
            }
        });

        this.bind('KeyUp', function (e) {			
            if (e.key == Crafty.keys.LEFT_ARROW) {
				this.socket.emit("stop-rotate",this._playerId);
                this.rotatePlayer("stopRotate");
            } else if (e.key == Crafty.keys.RIGHT_ARROW) {
				this.socket.emit("stop-rotate",this._playerId);
                this.rotatePlayer("stopRotate");
            } else if (e.key == Crafty.keys.UP_ARROW) {
				this.socket.emit("stop-movement",this._playerId);
                this.movePlayer("stopMovement");
            } else if (e.key == Crafty.keys.DOWN_ARROW) {
				this.socket.emit("stop-movement",this._playerId);
                this.movePlayer("stopMovement");
            } else if (e.key == Crafty.keys.SPACE) {
                this.stopShoot();
            }
        });
    },

    movePlayer: function (direction) {

        window.clearInterval(this._movementInterval);

        if (!this.engineStarted) return;

        console.log(direction);

        if (direction == "stopMovement") {
            this.movingForward = false;
            this.movingBackward = false;

            Crafty.audio.stop("engine");
            Crafty.audio.stop("engine-idle");
            Crafty.audio.play("engine-idle", -1);

            return;
        }

        var that = this;

        this._movementInterval = window.setInterval(function () {
            if (direction == "forward") {
                if (!that.movingForward) {
                    Crafty.audio.stop("engine-idle");
                    Crafty.audio.play("engine", -1);

                    that.movingForward = true;
                    that.movingBackward = false;
                }

                var newX = that.x + 2 * Math.cos(that.rotation * Math.PI / 180);
                var newY = that.y + 2 * Math.sin(that.rotation * Math.PI / 180);

                that.place(newX, newY);
            }
            else if (direction == "backward") {

                if (!that.movingBackward) {
                    Crafty.audio.stop("engine-idle");
                    Crafty.audio.play("engine", -1);

                    that.movingBackward = true;
                    that.movingForward = false;
                }

                var newX = that.x - 2 * Math.cos(that.rotation * Math.PI / 180);
                var newY = that.y - 2 * Math.sin(that.rotation * Math.PI / 180);

                that.place(newX, newY);
            }
        }, 1);
    },

    rotatePlayer: function (direction) {
        var that = this;

        window.clearInterval(this._rotateInterval);

        if (direction == "stopRotate") {
            return;
        }

        this._rotateInterval = window.setInterval(function () {
            if (direction == "right") {
                that.rotation += 0.5;
            }
            else if (direction == "left") {
                that.rotation -= 0.5;
            }
        }, 1);
    },

    shoot: function () {
        Crafty.audio.stop("shoot");
        Crafty.audio.play("shoot");

        var _x = this.x;
        var _y = this.y;
        var _rotation = this.rotation;

        var speed = 3;

        var incrementX = speed * Math.cos(_rotation * Math.PI / 180);
        var incrementY = speed * Math.sin(_rotation * Math.PI / 180)

        _x += incrementX;
        _y += incrementY + 4;

        var bullet = Crafty.e("2D, Canvas, Color, Tween").attr({ x: _x, y: _y, w: 5, h: 5, z: 1, rotation: _rotation }).color("orange");
        
        window.setInterval(function () {
            bullet.x += incrementX;
            bullet.y += incrementY;
        }, 1);
    },

    startShoot: function (shooter) {
        shooter.apply(this);
        var that = this;
        this.autoShootInterval = window.setInterval(function () {
            shooter.apply(that);
        }, 200);
    },

    stopShoot: function () {
        window.clearInterval(this.autoShootInterval);
    },

    shoot3: function () {
        Crafty.audio.stop("shoot3");
        Crafty.audio.play("shoot3");

        var _x = this.x;
        var _y = this.y;
        var _rotation = this.rotation;

        var speed = 1;

        _x += (16 * Math.cos(_rotation * Math.PI / 180));
        _y += (16 * Math.sin(_rotation * Math.PI / 180)) + 4;

        var bullet1 = Crafty.e("2D, Canvas, Color").attr({ x: _x, y: _y, w: 5, h: 5, z: 1, rotation: this.rotation }).color("orange");
        var bullet2 = Crafty.e("2D, Canvas, Color").attr({ x: _x, y: _y, w: 5, h: 5, z: 1, rotation: this.rotation + 45 }).color("orange");
        var bullet3 = Crafty.e("2D, Canvas, Color").attr({ x: _x, y: _y, w: 5, h: 5, z: 1, rotation: this.rotation - 45 }).color("orange");

        window.setInterval(function () {

            bullet1.x += speed * Math.cos(bullet1.rotation * Math.PI / 180);
            bullet1.y += speed * Math.sin(bullet1.rotation * Math.PI / 180);

            bullet2.x += speed * Math.cos(bullet2.rotation * Math.PI / 180);
            bullet2.y += speed * Math.sin(bullet2.rotation * Math.PI / 180);

            bullet3.x += speed * Math.cos(bullet3.rotation * Math.PI / 180);
            bullet3.y += speed * Math.sin(bullet3.rotation * Math.PI / 180);
        }, 5);
    },

    startEngine: function () {
        this.engineStarted = true;
        Crafty.audio.stop("engine-idle");
        Crafty.audio.play("engine-idle", -1, 0.5);

        return this;
    },

    stopEngine: function () {
        this.engineStarted = false;
        Crafty.audio.stop("engine");
        Crafty.audio.stop("engine-idle");
        window.clearInterval(this._movementInterval);
        return this;
    },

    toggleEngine: function () {
        if (!this.engineStarted) {
            this.startEngine();
        } else {
            this.stopEngine();
        }
    }

});