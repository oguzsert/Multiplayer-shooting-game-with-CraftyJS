Crafty.c("Player", {
    hp: {
        current: 10,
        max: 10
    },

    init: function () {
        this.addComponent("2D, Canvas, Color, Collision, Flicker, HealthBar");

        this.playerType = "none";
        this._playerId = new Date().getTime();
        this._sessionId = new Date().getTime();

        this.isActive = true;
        this.w = 20;
        this.h = 20;
        this.z = 10;
        this.rotation = 0;
        this.isShooting = false;

        this.engine = {
            move: 'none',
            movespeed: 10,
            rotate: 'none'
        };

        this.weapon = {
            bullet: "BasicBullet",
            bulletspeed: 20,
            bulletcolor: "orange",
            firerate: 10,
        };

        Crafty.audio.add(this.audioFiles.ENGINE_IDLE(this), "asset/sound/engine/090913-009.mp3");
        Crafty.audio.add(this.audioFiles.ENGINE(this), "asset/sound/engine/090913-002.mp3");
        Crafty.audio.add(this.audioFiles.SHOOT(this), "asset/sound/shoot/M4A1_Single-Kibblesbob-8540445.mp3");
        Crafty.audio.add(this.audioFiles.SHOOT3(this), "asset/sound/shoot/shoot002.mp3");
        Crafty.audio.add(this.audioFiles.EXPLODE(this), "asset/sound/explode.mp3");
        Crafty.audio.add(this.audioFiles.DAMAGE(this), "asset/sound/explodemini.mp3");

        this.insideBoard = function (newX, newY) {
            return newX >= 0 && newX <= Crafty.viewport.width && newY >= 0 && newY <= Crafty.viewport.height
        };

        this.bind("EnterFrame", function (frame) {

            if (frame.frame % 5 == 0) {
                if (this.isShooting) {
                    this.shoot();
                }
            }

            if (this.engine.rotate == 'right') {
                this.rotation += 5;
            }

            if (this.engine.rotate == 'left') {
                this.rotation -= 5;
            }

            if (this.engine.move == 'forward') {
                newX = this.x + this.engine.movespeed * Math.cos(this.rotation * Math.PI / 180);

                // if (newX > Crafty.viewport.width) {
                //     newX = 0;
                // }

                newY = this.y + this.engine.movespeed * Math.sin(this.rotation * Math.PI / 180);

                // if (newY > Crafty.viewport.height) {
                //     newY = 0;
                // }

                if (this.insideBoard(newX, newY)) this.place(newX, newY);
            }
            else if (this.engine.move == 'backward') {
                newX = this.x - this.engine.movespeed * Math.cos(this.rotation * Math.PI / 180);
                newY = this.y - this.engine.movespeed * Math.sin(this.rotation * Math.PI / 180);

                // if (newX > Crafty.viewport.width) {
                //     newX = 0;
                // }

                // if (newY > Crafty.viewport.height) {
                //     newY = 0;
                // }

                if (this.insideBoard(newX, newY)) this.place(newX, newY);
            }
        })
            .bind("Hurt", function (dmg) {

                Crafty.e("Damage").attr({
                    x: this.x,
                    y: this.y
                });

                this.hp.current -= dmg;

                this.updateHealthBar(this.hp.current / this.hp.max * 100);

                if (this.playerType == "mine") {
                    this.socket.emit("hurt", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId, dmg: dmg });
                }

                console.log("player:" + this.name, this.playerType, "hp:" + this.hp.current);

                if (this.hp.current <= 0) {
                    if (this.playerType == "mine") {
                        this.socket.emit("die", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId });
                        this.die();
                    }
                }
            });

        Crafty.audio.play(this.audioFiles.ENGINE_IDLE(this), -1, 0.2);
    },

    reset: function () {
        this.isActive = true;
        this.flicker = true;
        this.x = Crafty.viewport.width / 2 - this.w / 2;
        this.y = 36;
        this.rotation = 0;

        this.hp = { current: 10, max: 10 };

        this.updateHealthBar(100);

        var that = this;

        setTimeout(function () {
            console.log("flicker off", that.flicker);
            that.flicker = false;
        }, 3000);

        return this;
    },

    die: function () {
        Crafty.e("DieExplosion").attr({
            x: this.x - 60,
            y: this.y - 40
        });

        this.isActive = false;
        this.z = -1;
        this.x = 1000000;
        this.y = 1000000;

        this.movePlayer("stopMovement");
        this.rotatePlayer("stopRotate");
        this.stopShoot();

        var that = this;
        setTimeout(function () {
            that.respawn();
            that.socket.emit("respawn", { x: that.x, y: that.y, rotation: that.rotation, playerId: that._playerId });
        }, 1000);

        return this;
    },

    respawn: function () {
        this.reset();

        return this;
    },

    place: function (x, y, r) {
        this.x = x;
        this.y = y;

        if (r != undefined)
            this.rotation = r;

        return this;
    },

    addWeapon: function (type) {
        this.origin('center');

        if (type == 'rifle') {
            var rifle = Crafty.e("2D, Canvas, Color").attr({ x: this.w, y: this.h / 3, w: this.w / 2, h: this.h / 3, z: 10 }).color(this.color());
            this.attach(rifle);
        }

        return this;
    },

    setName: function (name) {
        this.name = name;
        return this;
    },

    showName: function (name) {

        this.attach(Crafty.e("2D, DOM, Text").attr({ x: this.x, y: this.y + this.h + 2 }).text(this.name).textColor("black").textFont({ size: '10px', weight: 'bold' }));

        return this;
    },

    movePlayer: function (direction) {

        console.log(direction);

        if (this.playerType == 'mine') {
            Crafty.audio.stop(this.audioFiles.ENGINE(this));
            Crafty.audio.stop(this.audioFiles.ENGINE_IDLE(this));
        }

        if (direction == "stopMovement") {
            this.engine.move = 'none';
            if (this.playerType == 'mine') {
                Crafty.audio.play(this.audioFiles.ENGINE_IDLE(this), -1, 0.2);
            }
        } else if (direction == "forward") {
            this.engine.move = 'forward';
            if (this.playerType == 'mine') {
                Crafty.audio.play(this.audioFiles.ENGINE(this), -1, 0.2);
            }
        } else if (direction == "backward") {
            this.engine.move = 'backward';
            if (this.playerType == 'mine') {
                Crafty.audio.play(this.audioFiles.ENGINE(this), -1, 0.2);
            }
        }
    },

    rotatePlayer: function (direction) {

        console.log(direction);

        if (direction == "stopRotate") {
            this.engine.rotate = 'none';
        }
        else if (direction == "right") {
            this.engine.rotate = 'right';
        }
        else if (direction == "left") {
            this.engine.rotate = 'left';
        }
    },

    startShoot: function (shooter) {
        this.isShooting = true;
    },

    stopShoot: function () {
        this.isShooting = false;
    },

    shoot: function () {

        var bullet = Crafty.e(this.weapon.bullet).color(this.color());

        bullet.attr({
            ownerId: this._playerId,
            x: this.x,
            y: this.y,
            rotation: this.rotation,
            xspeed: this.weapon.bulletspeed * Math.cos(this.rotation * Math.PI / 180),
            yspeed: this.weapon.bulletspeed * Math.sin(this.rotation * Math.PI / 180)
        });

        if (this.playerType == 'mine') {
            Crafty.audio.stop(this.audioFiles.SHOOT(this));
            Crafty.audio.play(this.audioFiles.SHOOT(this));
        }
    },

    shoot3: function () {

        Crafty.e("BigBullet").color(this.color())
            .attr({
                ownerId: this._playerId,
                x: this.x,
                y: this.y,
                rotation: this.rotation,
                xspeed: this.weapon.bulletspeed * Math.cos(this.rotation * Math.PI / 180),
                yspeed: this.weapon.bulletspeed * Math.sin(this.rotation * Math.PI / 180)
            });

        Crafty.e("BigBullet").color(this.color())
            .attr({
                ownerId: this._playerId,
                x: this.x + 10,
                y: this.y,
                rotation: this.rotation + 45,
                xspeed: this.weapon.bulletspeed * Math.cos((this.rotation + 45) * Math.PI / 180),
                yspeed: this.weapon.bulletspeed * Math.sin((this.rotation + 45) * Math.PI / 180)
            });

        Crafty.e("BigBullet").color(this.color())
            .attr({
                ownerId: this._playerId,
                x: this.x + 50,
                y: this.y,
                rotation: this.rotation - 45,
                xspeed: this.weapon.bulletspeed * Math.cos((this.rotation - 45) * Math.PI / 180),
                yspeed: this.weapon.bulletspeed * Math.sin((this.rotation - 45) * Math.PI / 180)
            });

        if (this.playerType == 'mine') {
            Crafty.audio.stop(this.audioFiles.SHOOT3(this));
            Crafty.audio.play(this.audioFiles.SHOOT3(this));
        }
    },

    audioFiles: {
        ENGINE: function (that) { return "engine_" + that._sessionId; },
        ENGINE_IDLE: function (that) { return "engine-idle_" + that._sessionId; },
        SHOOT: function (that) { return "shoot_" + that._sessionId; },
        SHOOT3: function (that) { return "shoot3_" + that._sessionId; },
        EXPLODE: function (that) { return "explode"; },
        DAMAGE: function (that) { return "damage"; },
    },
});

Crafty.c("MyPlayer", {

    init: function () {

        this.addComponent("Player")
            .onHit("Bullet", function (hitData) {
                if (this.flicker) return;
                var bulletOwnerId = hitData[0].obj.ownerId;
                if (this._playerId != bulletOwnerId) {
                    this.trigger("Hurt", hitData[0].obj.dmg);
                    hitData[0].obj.destroy();
                }
            })
            .bind('KeyDown', function (e) {

                if (e.key == Crafty.keys.HOME && !this.isActive) {
                    this.respawn();
                    this.socket.emit("respawn", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId });
                };

                if (!this.isActive) {
                    return false;
                }

                if (e.key == Crafty.keys.ESC) {
                    this.socket.emit("die", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId });
                    this.die();
                } else if (e.key == Crafty.keys.LEFT_ARROW) {
                    this.socket.emit("rotate-left", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId });
                    this.rotatePlayer("left");
                } else if (e.key == Crafty.keys.RIGHT_ARROW) {
                    this.rotatePlayer("right");
                    this.socket.emit("rotate-right", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId });
                } else if (e.key == Crafty.keys.UP_ARROW) {
                    this.socket.emit("move-forward", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId });
                    this.movePlayer("forward");
                } else if (e.key == Crafty.keys.DOWN_ARROW) {
                    this.socket.emit("move-backward", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId });
                    this.movePlayer("backward");
                } else if (e.key == Crafty.keys.SPACE) {
                    this.socket.emit("start-shoot", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId });
                    this.startShoot();
                } else if (e.key == Crafty.keys.X) {
                    this.shoot3();
                }
            })
            .bind('KeyUp', function (e) {

                if (!this.isActive) {
                    return false;
                }

                if (e.key == Crafty.keys.LEFT_ARROW || e.key == Crafty.keys.RIGHT_ARROW) {
                    this.socket.emit("stop-rotate", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId });
                    this.rotatePlayer("stopRotate");
                } else if (e.key == Crafty.keys.UP_ARROW || e.key == Crafty.keys.DOWN_ARROW) {
                    this.socket.emit("stop-movement", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId });
                    this.movePlayer("stopMovement");
                } else if (e.key == Crafty.keys.SPACE) {
                    this.socket.emit("stop-shoot", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId });
                    this.stopShoot();
                }
            });

        this.playerType = "mine";

        this.socket = null;

        this.onSocketBinded = function (socket) { }
    },

    bindSocket: function (socketObject) {
        this.socket = socketObject;
        if (this.onSocketBinded) this.onSocketBinded(this.socket);
        return this;
    }

});

Crafty.c("HealthBar", {
    init: function () {
        this.requires("2D");

        this._pbMaxValue = 100;
        this._pbFilledFraction = 1;
        this._pbHeight = 3;
        this._pbY = 40;
    },

    initHealthBar: function (totalWidth, filledColor) {

        this._pbTotalWidth = totalWidth;

        this._pbBlockWidth = this._pbTotalWidth * this._pbFilledFraction;

        this._pbLowerBlock = Crafty.e("2D, Canvas, Color").color('green').attr({
            x: this._x,
            y: this._y + this._pbY,
            w: this._pbBlockWidth,
            h: this._pbHeight,
            z: 100
        });

        this._pbHigherBlock = Crafty.e("2D, Canvas, Color").color(filledColor == 'gray' ? 'black' : 'gray').attr({
            x: this._x,
            y: this._y + this._pbY,
            w: this._pbBlockWidth,
            h: this._pbHeight,
            z: 1
        });;

        this.attach(this._pbLowerBlock);
        this.attach(this._pbHigherBlock);

        return this;
    },

    updateHealthBar: function (val) {

        this._pbFilledFraction = val / this._pbMaxValue;

        this._pbBlockWidth = this._pbTotalWidth * this._pbFilledFraction;

        this._pbLowerBlock.attr({
            w: this._pbBlockWidth,
        });

        if (this._pbFilledFraction >= 0.8 && this._pbFilledFraction <= 1)
            this._pbLowerBlock.color('green')
        else if (this._pbFilledFraction <= 0.2) {
            this._pbLowerBlock.color('red')
        } else {
            this._pbLowerBlock.color('orange')
        }

        return this;
    }
});
