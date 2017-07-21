Crafty.c("OtherPlayer", {

    init: function () {

        this.addComponent("Player");

        this.playerType = "other";

        this.socket = null;

        this.onSocketBinded = function (socket) {
            var that = this;

            socket.on("player-correction", function (data) {
                if (data.playerId == that._playerId) {
                    that.x = data.x;
                    that.y = data.y;
                    that.rotation = data.rotation;
                    that.engine.move = data.movement;
                    that.engine.rotate = data.engine.rotate;
                    that.engine.isShooting = data.shoot;
                }

            });

            socket.on("player-respawn", function (playerInfo) {
                if (playerInfo.playerId == that._playerId) {
                    that.respawn({ x: playerInfo.x, y: playerInfo.y, rotaion: playerInfo.rotation });
                }
            });

            socket.on("player-hurt", function (data) {
                if (data.playerId == that._playerId) {
                    that.trigger("Hurt", { dmg: data.dmg, hitterId: data.hitterId });
                }
            });

            socket.on("player-die", function (playerInfo) {
                if (playerInfo.playerId == that._playerId) {
                    that.die();
                }
            });

            socket.on("player-move-forward", function (playerInfo) {
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.movePlayer("forward");
                }
            });

            socket.on("player-move-backward", function (playerInfo) {
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.movePlayer("backward");
                }
            });

            socket.on("player-stop-movement", function (playerInfo) {
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.movePlayer("stopMovement");
                }
            });

            socket.on("player-rotate-right", function (playerInfo) {
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.rotatePlayer("right");
                }
            });

            socket.on("player-rotate-left", function (playerInfo) {
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.rotatePlayer("left");
                }
            });

            socket.on("player-rotate-stop", function (playerInfo) {
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.rotatePlayer("stopRotate");
                }
            });

            socket.on("player-start-shoot", function (playerInfo) {
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.startShoot();
                }
            });

            socket.on("player-stop-shoot", function (playerInfo) {
                if (playerInfo.playerId == that._playerId) {
                    that.place(playerInfo.x, playerInfo.y, playerInfo.rotation);
                    that.stopShoot();
                }
            });
        }
    },

    setId: function (id) {
        if (id !== undefined) {
            this._playerId = id;
        }
        return this;
    },

    bindSocket: function (socketObject) {
        this.socket = socketObject;
        this.onSocketBinded(this.socket);
        return this;
    }

});