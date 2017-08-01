Crafty.c("MyPlayer", {

    init: function () {

        this.addComponent("Player")
            .onHit("Bullet", function (hitData) {
                if (this.flicker) return;

                var bullet = hitData[0].obj;
                if (this._playerId != bullet.ownerId) {
                    this.trigger("Hurt", { dmg: bullet.dmg, hitterId: bullet.ownerId });
                    bullet.destroy();
                }
            })
            .onHit("Mayin", function (hitData) {
                if (this.flicker) return;

                var mayin = hitData[0].obj;

                this.trigger("Hurt", { dmg: mayin.dmg, hitterId: mayin.ownerId });

                mayin.destroy();

                Crafty.e("DieExplosion").attr({
                    x: this.x,
                    y: this.y
                });
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
                } else if (e.key == Crafty.keys['1']) {
                    this.socket.emit("select-weapon", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId, weapon: 'Tabanca' });
                    this.selectWeapon('Tabanca');
                } else if (e.key == Crafty.keys['2']) {
                    this.socket.emit("select-weapon", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId, weapon: 'Sapan' });
                    this.selectWeapon('Sapan');
                }
                else if (e.key == Crafty.keys['3']) {
                    this.socket.emit("select-weapon", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId, weapon: 'GuidedMissileLauncher' });
                    this.selectWeapon('GuidedMissileLauncher');
                }
                else if (e.key == Crafty.keys['4']) {
                    this.socket.emit("select-weapon", { x: this.x, y: this.y, rotation: this.rotation, playerId: this._playerId, weapon: 'MayinLauncher' });
                    this.selectWeapon('MayinLauncher');
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

        this.z = 1000;

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
