Crafty.c("Player", {
    hp: {
        current: 10,
        max: 10
    },

    init: function () {
        this.addComponent("2D, Canvas, Collision, Flicker, StatusBar");

        this.playerType = "none";

        this._playerId = new Date().getTime();
        this._sessionId = new Date().getTime();

        this.isActive = true;
        this.w = 32;
        this.h = 24;
        this.z = 10;
        this.rotation = 0;

        this.engine = {
            move: 'none',
            movespeed: 10,
            rotate: 'none'
        };

        Crafty.audio.add(this.audioFiles.ENGINE_IDLE(this), "asset/sound/engine/090913-009.mp3");
        Crafty.audio.add(this.audioFiles.ENGINE(this), "asset/sound/engine/090913-002.mp3");
        Crafty.audio.add(this.audioFiles.SHOOT(this), "asset/sound/shoot/M4A1_Single-Kibblesbob-8540445.mp3");
        Crafty.audio.add(this.audioFiles.SHOOT3(this), "asset/sound/shoot/shoot002.mp3");
        Crafty.audio.add(this.audioFiles.EXPLODE(this), "asset/sound/explode.mp3");
        Crafty.audio.add(this.audioFiles.DAMAGE(this), "asset/sound/explodemini.mp3");

        this.origin('center');

        this.bind("EnterFrame", function (frame) {

            var rotationspeed = this.engine.move == 'none' ? 2 : 5;

            if (this.engine.rotate == 'right') {
                this.rotation += rotationspeed;
            }

            if (this.engine.rotate == 'left') {
                this.rotation -= rotationspeed;;
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
        });

        this.bind("Hurt", function (data) {

            Crafty.e("Damage").attr({
                x: this.x,
                y: this.y
            });

            this.hp.current -= data.dmg;

            this.updateBar('healthBar', this.hp.current / this.hp.max * 100);

            if (this.playerType == "mine") {
                this.socket.emit("hurt", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId, dmg: data.dmg, hitterId: data.hitterId });
            }

            if (this.hp.current <= 0) {
                if (this.playerType == "mine") {
                    this.socket.emit("die", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId, hitterId: data.hitterId });
                    this.die();
                }
            }
        });

        this.bind("RemoveComponent", function (c) {
            console.log("RemoveComponent", c);

            if (this.weaponFrameHandler) {
                console.log('unbind weaponFrameHandler');
                this.unbind('EnterFrame', this.weaponFrameHandler);
            }

        });

        this.initBar('healthBar', {
            width: 48,
            colors: {
                max: 'green',
                medium: 'orange',
                min: 'red'
            }
        });

        this.initBar('shootBar', {
            width: 48,
            colors: {
                max: 'indigo',
                medium: 'darkslateblue',
                min: 'powderblue'
            }
        });

        this.selectWeapon('Tabanca');
    },

    insideBoard: function (newX, newY) {
        return newX >= 0 && newX <= Crafty.viewport.width && newY >= 0 && newY <= Crafty.viewport.height
    },

    setColor: function (color) {
        this.color = color;
        this.addComponent(color + "tank");
        return this;
    },

    color: function () {
        return this.color;
    },

    reset: function () {
        this.isActive = true;
        this.flicker = true;
        this.x = Crafty.viewport.width / 2 - this.w / 2;
        this.y = 36;
        this.rotation = 0;

        this.hp = { current: 10, max: 10 };

        this.updateBar('healthBar', 100);

        var that = this;

        setTimeout(function () {
            that.flicker = false;
        }, 2000);

        return this;
    },

    die: function () {
        Crafty.e("DieExplosion").attr({
            x: this.x - 60,
            y: this.y - 40
        });

        this.isActive = false;

        this.x = 1000000;
        this.y = 1000000;

        this.movePlayer("stopMovement");
        this.rotatePlayer("stopRotate");
        //this.stopShoot();

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

        if (direction == "stopMovement") {
            this.engine.move = 'none';
            if (this.playerType == 'mine') {
                Crafty.audio.stop(this.audioFiles.ENGINE(this));
            }
        } else if (direction == "forward") {
            this.engine.move = 'forward';
            if (this.playerType == 'mine') {
                Crafty.audio.play(this.audioFiles.ENGINE(this), -1, 1);
            }
        } else if (direction == "backward") {
            this.engine.move = 'backward';
            if (this.playerType == 'mine') {
                Crafty.audio.play(this.audioFiles.ENGINE(this), -1, 1);
            }
        }
    },

    rotatePlayer: function (direction) {

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

    selectWeapon: function (weapon) {

        if (this.selectedWeapon == weapon) return;

        console.log('selectWeapon', weapon);

        if (this.playerType == 'mine') console.log('myplayer', this);

        this.removeComponent(this.selectedWeapon, false);
        this.addComponent(weapon);

        this.selectedWeapon = weapon;
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

Crafty.c("StatusBar", {

    init: function () {
        this.requires("2D");

        this.healthBar = {
            currentValue: 100,
            maxValue: 100,
            filledFraction: 1,

            width: 30,
            height: 3,

            blockWidth: 30,

            upBlock: null,
            downBlock: null,

            marginY: 16,

            colors: {}
        };

        this.shootBar = {
            currentValue: 100,
            maxValue: 100,
            filledFraction: 1,

            width: 30,
            height: 3,

            blockWidth: 30,

            upBlock: null,
            downBlock: null,

            marginY: 22
        };
    },

    initBar: function (barType, props) {

        var bar = this[barType];

        if (!bar) return;

        bar.width = props.width;
        bar.colors = props.colors;

        bar.blockWidth = bar.width * bar.filledFraction;

        bar.upBlock = Crafty.e("2D, Canvas, Color").color('green').attr({
            w: bar.blockWidth,
            h: bar.height,

            x: this._x,
            y: this._y + this.h + bar.marginY,
            z: 10000
        });

        bar.downBlock = Crafty.e("2D, Canvas, Color").color('gray').attr({
            w: bar.width,
            h: bar.height,

            x: this._x,
            y: this._y + this.h + bar.marginY,
            z: 1000
        });;

        this.attach(bar.upBlock);
        this.attach(bar.downBlock);

        return this;
    },

    updateBar: function (barType, val) {

        var bar = this[barType];

        if (!bar) return;

        bar.currentValue = val;

        bar.filledFraction = bar.currentValue / bar.maxValue;

        bar.blockWidth = bar.width * bar.filledFraction;

        bar.upBlock.attr({
            w: bar.blockWidth,
            z: 10000
        });

        if (bar.filledFraction >= 0.8 && bar.filledFraction <= 1)
            bar.upBlock.color(bar.colors.max)
        else if (bar.filledFraction <= 0.2) {
            bar.upBlock.color(bar.colors.min)
        } else {
            bar.upBlock.color(bar.colors.medium)
        }

        return this;
    }
});
