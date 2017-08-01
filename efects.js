Crafty.c("Damage", {
    init: function () {
        this.addComponent("2D", "Canvas", "dmg");

        var that = this;

        setTimeout(function () {
            that.destroy();
            Crafty.audio.stop("damage");
        }, 200);
    }
});


Crafty.c("DieExplosion", {
    init: function () {
        var e = this.addComponent("2D", "Canvas", "SpriteAnimation", "explosion1")
            .reel("explode1", 1000, 0, 0, 16)
            .animate("explode1")
            .bind("AnimationEnd", function () {
                this.destroy();
                console.log("AnimationEnd");
            });

        Crafty.audio.play("explode", 1, 1);
    }
});

Crafty.c("MayinExplosion", {
    init: function () {

        var e = this.addComponent("2D", "Canvas", "SpriteAnimation", "fireballexplosion")
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

        Crafty.audio.play("explode", 1, 1);
    }
});

Crafty.c("Flicker", {
    flicker: true,
    init: function () {
        this.flicker = true;
        this.bind("EnterFrame", function (frame) {
            if (this.flicker) {
                if (frame.frame % 5 == 0) {
                    if (this.alpha == 0.0) {
                        this.alpha = 1.0;
                    } else {
                        this.alpha = 0.0;
                    }
                }
            }
            else {
                this.alpha = 1.0;
            }
        });
    }

});

