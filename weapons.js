Crafty.c("Bullet", {
    dmg: 0,
    xspeed: 10,
    yspeed: 10,
    init: function () {
        this.addComponent("2D", "Canvas", "Color", "Collision")
            .bind("EnterFrame", function (frame) {
                if (this.x > Crafty.viewport.width + this.w ||
                    this.x < -this.w ||
                    this.y < -this.h ||
                    this.y > Crafty.viewport.height + this.h) {
                    this.destroy();
                }
            })
            .onHit("Bullet", function (ent) {
                if (this.ownerId != ent[0].obj.ownerId) {
                    this.destroy();
                    ent[0].obj.destroy();
                    console.log("bullets destroyed");
                }
            });
    }
});

Crafty.c("BasicBullet", {
    init: function () {
        this
            .addComponent("Bullet, laser1")
            .bind("EnterFrame", function (frame) {
                this.x += this.xspeed;
                this.y += this.yspeed;
            })
            .attr({
                dmg: 1,
                w: 13,
                h: 5
            });
    }
});

Crafty.c("FireBall", {
    init: function () {
        this
            .addComponent("Bullet", "SpriteAnimation", "fireball")
            .reel("fire", 500, 0, 0, 10)
            .animate("fire")
            .bind("AnimationEnd", function () {
                this.destroy();
                console.log("FireBall destroyed");
            })
            .bind("EnterFrame", function (frame) {
                this.x += this.xspeed;
                this.y += this.yspeed;
            })
            .attr({
                dmg: 9,
                w: 32,
                h: 32
            });
    }
});

Crafty.c("Tabanca", {
    init: function () {

        this.weapon = {
            bullet: "BasicBullet",
            bulletspeed: 20,
            firerate: 5,
            shooting: false,
            heat: {
                overheated: false,
                current: 0,
                max: 100,
                heatPerShoot: 4
            }
        };

        this.updateBar('shootBar', 100);

        this.weaponFrameHandler = function (frame) {

            console.log('Tabanca handler');

            if (frame.frame % this.weapon.firerate == 0) {
                if (this.weapon.shooting) {
                    if (!this.weapon.heat.overheated) this.shoot();
                }

                if (!this.weapon.shooting || this.weapon.heat.overheated) {
                    if (this.weapon.heat.current > 0) { //cooldown
                        this.weapon.heat.current -= this.weapon.heat.heatPerShoot / 2;
                    }
                }

                if (this.weapon.heat.overheated) {
                    if (this.weapon.heat.current < 20) {
                        this.weapon.heat.overheated = false;
                        if (this.playerType == 'mine') Crafty.trigger("HideText");
                    }
                }

                if (this.weapon.heat.current < 0) this.weapon.heat.current = 0;

                this.updateBar('shootBar', this.weapon.heat.max - this.weapon.heat.current)
            }
        };

        this.bind("EnterFrame", this.weaponFrameHandler);
    },

    shoot: function () {

        if (this.flicker) return;

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
            Crafty.audio.play(this.audioFiles.SHOOT(this), 1, 0.1);
        }

        if (this.weapon.heat.current < this.weapon.heat.max)
            this.weapon.heat.current += this.weapon.heat.heatPerShoot;

        if (this.weapon.heat.current >= this.weapon.heat.max) {
            this.weapon.heat.current = this.weapon.heat.max;
            this.weapon.heat.overheated = true;
            if (this.playerType == 'mine') Crafty.trigger("ShowText", "Weapon Overheated!");
        }
    },

    startShoot: function () {
        this.weapon.shooting = true;
    },

    stopShoot: function () {
        this.weapon.shooting = false;
    },
});


Crafty.c("Sapan", {
    init: function () {

        this.weapon = {
            bullet: 'FireBall',
            bulletspeed: 20,
            bulletspeedbase: 20,
            load: {
                loading: false,
                ready: false,
                power: 0,
                maxPower: 100,
                powerLimitToShoot: 50,
            },
            resetLoad: function () {
                this.loading = false;
                this.ready = false;
                this.power = 0;
            }
        };

        this.weaponFrameHandler = function (frame) {

            if (this.flicker) return;

            console.log('Sapan handler');

            if (this.weapon.load.loading) {
                this.weapon.load.power += 2;
            } else if (this.weapon.load.power > 0 && !this.weapon.load.ready) {
                this.weapon.load.power -= 0.5;
                if (this.weapon.load.power < 0) this.weapon.load.power = 0;
            }

            if (this.weapon.load.power > this.weapon.load.maxPower + 40) {
                this.weapon.load.ready = true;
                this.weapon.load.power = this.weapon.load.maxPower
            }

            if (this.weapon.load.ready) {

                if (this.weapon.load.power > this.weapon.load.powerLimitToShoot) {
                    if (this.weapon.load.power > this.weapon.load.maxPower) {
                        this.weapon.load.power = this.weapon.load.maxPower;
                    }

                    console.log('shoot power:', this.weapon.load.power);
                    this.weapon.bulletspeed = this.weapon.bulletspeedbase * this.weapon.load.power / this.weapon.load.maxPower;
                    this.shoot();

                    this.weapon.resetLoad.apply(this.weapon.load);
                }

                this.weapon.load.ready = false;
            }

            var bar = this.weapon.load.maxPower - this.weapon.load.power;

            this.updateBar('shootBar', bar < 0 ? 0 : bar);
        };

        this.bind("EnterFrame", this.weaponFrameHandler);

    },

    shoot: function () {

        if (this.flicker) return;

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
            Crafty.audio.play(this.audioFiles.SHOOT(this), 1, 0.1);
        }
    },

    startShoot: function () {
        console.log('startShoot');
        this.weapon.load.loading = true;
        this.weapon.load.ready = false;
    },

    stopShoot: function () {
        console.log('stopShoot');
        this.weapon.load.loading = false;
        this.weapon.load.ready = true;
    },
});
