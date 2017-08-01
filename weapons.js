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
                var explosion = Crafty.e("FireBallExplosion");
                explosion.x = this.x - 64;
                explosion.y = this.y - 64;
                explosion.ownerId = this.ownerId;
                explosion.dmg = 2000;
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

Crafty.c("FireBallExplosion", {
    init: function () {
        this.addComponent("Bullet", "SpriteAnimation", "fireballexplosion")
            .reel("fireball_explosion_action", 100, [
                [0, 0], [0, 1], [0, 2], [0, 3],
                [1, 0], [1, 1], [1, 2], [1, 3],
                [2, 0], [2, 1], [2, 2], [2, 3],
                [3, 0], [3, 1], [3, 2], [3, 3],
            ])
            .animate("fireball_explosion_action")
            .bind("AnimationEnd", function () {
                Crafty.audio.play("fireballexplode", 1, 1);
                this.destroy();
            }).attr({
                w: 128,
                h: 128,
                x: 0,
                y: 0,
                z: 1

            });
    }
});

Crafty.c("GuidedMissile", {
    init: function () {

        this
            .addComponent("Bullet")

            .bind("EnterFrame", function (frame) {
                if (!this.releaseStatus && !this.locked) {
                    var that = this;
                    this.x += this.xspeed();
                    this.y += this.yspeed();

                    var circle = new Crafty.circle(this.x, this.y, 300);

                    if (!this.locked) {
                        Crafty("Player").each(function (player) {
                            console.log(this.__c);
                            if (this._playerId != that.ownerId && circle.containsPoint(this.x, this.y)) {
                                that.locked = true;
                                that.targetPlayer = this;
                            }
                        });
                    }

                }
                else if (this.releaseStatus && !this.locked) {
                    this.x = this.xspeed();
                    this.y = this.yspeed();
                    this.rotation += 15;
                    if (this.rotation > 1080) {
                        this.releaseStatus = false;
                    }
                }
                else if (this.locked) {
                    this.lastRotation = Math.atan2(this.targetPlayer.y - this.y, this.targetPlayer.x - this.x) * 180 / Math.PI;

                    this.x += this.xspeed();
                    this.y += this.yspeed();

                    var circle = new Crafty.circle(this.x, this.y, 20);
                    if (circle.containsPoint(this.targetPlayer.x, this.targetPlayer.y)) {
                        var explosion = Crafty.e("FireBallExplosion");
                        explosion.x = this.x - 64;
                        explosion.y = this.y - 64;
                        explosion.ownerId = this.ownerId;
                        explosion.dmg = 2000;
                        this.destroy();
                    }

                }
            })
            .attr({
                dmg: 5,
                w: 8,
                h: 8
            }).color("red").origin("center");
    }
});


Crafty.c("Mayin", {
    dmg: 50,
    live: 100,
    init: function () {
        this
            .addComponent("2D", "Canvas", "Color", "Collision", "Flicker")
            .bind("EnterFrame", function (frame) {
                if (frame.frame % 5 == 0) {
                    if (this.live > 0) {
                        this.live -= 1;
                    }

                    if (this.live < 20) this.flicker = true;

                    if (this.live <= 0) {
                        this.destroy();
                    }
                }
            })
            .onHit("Bullet", function (ent) {

                this.live -= ent[0].obj.dmg * 5;

                ent[0].obj.destroy();

                if (this.live <= 0) {
                    
                    this.destroy();

                    Crafty.e("DieExplosion").attr({
                        x: this.x - 64,
                        y: this.y - 64
                    });

                    console.log("mayin patlatıldı");
                }
            })
            .attr({
                w: 24,
                h: 24
            });

        this.flicker = false;
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

            //console.log('Tabanca handler');

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

        var bulletRotation = this.rotation;
        var bulletX = this.x + this._origin.x;
        var bulletY = this.y + this._origin.y;
        
        bullet.attr({
            ownerId: this._playerId,
            x: bulletX,
            y: bulletY,
            rotation: bulletRotation,
            xspeed: this.weapon.bulletspeed * Math.cos(bulletRotation * Math.PI / 180),
            yspeed: this.weapon.bulletspeed * Math.sin(bulletRotation * Math.PI / 180)
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

Crafty.c("GuidedMissileLauncher", {
    init: function () {

        this.weapon = {
            bullet: "GuidedMissile",
            bulletspeed: 1,
            load: {
                loading: false,
                ready: false,
                power: 0,
                maxPower: 100,
                powerLimitToShoot: 50,
            }
        };

        this.weaponFrameHandler = function (frame) {
            if (this.weapon.load.ready) {
                this.shoot();
                this.weapon.load.ready = false;
            }
        };

        this.bind("EnterFrame", this.weaponFrameHandler);


    },
    shoot: function () {
        if (this.flicker) return;
        var that = this;
        that.weapon.bulletspeed = 1;
        var bullet = Crafty.e(this.weapon.bullet);
        var release = true;

        var lastX = that.x + 40;
        var lastY = that.y;
        var lastRotation = that.rotation;

        bullet.attr({
            lastRotation: lastRotation,
            releaseStatus: release,
            ownerId: this._playerId,
            x: this.x,
            y: this.y,
            rotation: this.rotation,
            xspeed: function () {
                if (!this.releaseStatus) {
                    that.weapon.bulletspeed += 0.3;
                    return that.weapon.bulletspeed * Math.cos(this.lastRotation * Math.PI / 180);
                }
                else {
                    return lastX;
                }
            },
            yspeed: function () {
                if (!this.releaseStatus) {
                    return that.weapon.bulletspeed * Math.sin(this.lastRotation * Math.PI / 180);
                }
                else {
                    return lastY;
                }
            }
        });


    },
    startShoot: function () {
        console.log('startShoot');
        this.weapon.load.ready = true;
    },
    stopShoot: function () {
        console.log('stopShoot');
        this.weapon.load.ready = false;
    }
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

            //console.log('Sapan handler');

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

Crafty.c("MayinLauncher", {
    init: function () {

        this.weapon = {
            bullet: "Mayin",
            bulletspeed: 0,
            shooting: false,
            heat: {
                overheated: false,
                current: 0,
                max: 100,
                heatPerShoot: 100
            }
        };

        this.updateBar('shootBar', 100);

        this.weaponFrameHandler = function (frame) {

            if (this.weapon.shooting) {
                //if (this.weapon.heat.current <= 0) this.shoot();

                this.shoot();
            }

            this.weapon.shooting = false;

            if (this.weapon.heat.current > 0) { //cooldown
                this.weapon.heat.current -= 1;
            }

            if (this.weapon.heat.current < 0) this.weapon.heat.current = 0;

            this.updateBar('shootBar', this.weapon.heat.max - this.weapon.heat.current)
        };

        this.bind("EnterFrame", this.weaponFrameHandler);
    },

    shoot: function () {

        if (this.flicker) return;

        var bullet = Crafty.e(this.weapon.bullet);

        bullet.attr({
            ownerId: this._playerId,
            x: this.x - 75 * Math.cos(this.rotation * Math.PI / 180),
            y: this.y - 75  * Math.sin(this.rotation * Math.PI / 180),
            rotation: this.rotation,
        }).color('brown');

        if (this.playerType == 'mine') {
            Crafty.audio.stop(this.audioFiles.SHOOT(this));
            Crafty.audio.play(this.audioFiles.SHOOT(this), 1, 0.1);
        }

        if (this.weapon.heat.current < this.weapon.heat.max)
            this.weapon.heat.current += this.weapon.heat.heatPerShoot;

        if (this.weapon.heat.current >= this.weapon.heat.max) {
            this.weapon.heat.current = this.weapon.heat.max;
        }
    },

    startShoot: function () {
        this.weapon.shooting = true;
    },

    stopShoot: function () {
        this.weapon.shooting = false;
    },
});
