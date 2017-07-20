Crafty.c("Player", {
    hp: {
        current: 10,
        max: 10
    },

    init: function () {
        this.addComponent("2D, Canvas, Collision, Flicker, HealthBar");

        this.playerType = "none";
        this._playerId = new Date().getTime();
        this._sessionId = new Date().getTime();

        this.isActive = true;
        this.w = 32;
        this.h = 24;
        this.z = 10;
        this.rotation = 0;
        this.isShooting = false;
        this.origin('center');
        var colour = "";
        this.color = function () {
            return colour;
        }

        this.engine = {
            move: 'none',
            movespeed: 10,
            rotate: 'none'
        };

        this.setColor = function (color) {
            colour = color;
            this.addComponent(color + "tank");
            return this;
        }

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
                newY = this.y + this.engine.movespeed * Math.sin(this.rotation * Math.PI / 180);

                if (newX > Crafty.viewport.width) {
                    newX = 0;
                }

                if (newX < 0) {
                    newX = Crafty.viewport.width;
                }

                if (newY > Crafty.viewport.height) {
                    newY = 0;
                }

                if (newY < 0) {
                    newY = Crafty.viewport.height;
                }

                if (this.insideBoard(newX, newY)) this.place(newX, newY);
            }
            else if (this.engine.move == 'backward') {
                newX = this.x - this.engine.movespeed * Math.cos(this.rotation * Math.PI / 180);
                newY = this.y - this.engine.movespeed * Math.sin(this.rotation * Math.PI / 180);
                if (this.insideBoard(newX, newY)) this.place(newX, newY);
            }
        })
            .bind("Hurt", function (dmg,hitterId) {

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


        return this;
    },

    setName: function (name) {
        this.name = name;
        return this;
    },

    showName: function (name) {

        this.attach(Crafty.e("2D, DOM, Text").attr({ x: this.x, y: this.y + this.h + 2 }).text(this.name).textColor("white").textFont({ size: '11px', weight: 'bold' }));

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
                // Crafty.audio.play(this.audioFiles.ENGINE_IDLE(this), -1, 0.5);
            }
        } else if (direction == "forward") {
            this.engine.move = 'forward';
            if (this.playerType == 'mine') {
                Crafty.audio.play(this.audioFiles.ENGINE(this), -1, 0.5);
            }
        } else if (direction == "backward") {
            this.engine.move = 'backward';
            if (this.playerType == 'mine') {
                Crafty.audio.play(this.audioFiles.ENGINE(this), -1, 0.5);
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

        var bullet = Crafty.e(this.weapon.bullet);

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

Crafty.c("HealthBar", {
    init: function () {
        this.requires("2D");

        this._pbMaxValue = 100;
        this._pbFilledFraction = 1;
        this._pbHeight = 3;
        this._pbY = 38;
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
