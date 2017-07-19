Crafty.c("Damage", {
    init: function () {
        this.addComponent("2D", "Canvas", "dmg");

        Crafty.audio.play("damage", 1, 1);

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
