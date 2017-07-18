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
            .addComponent("Bullet")
            .bind("EnterFrame", function (frame) {
                this.x += this.xspeed;
                this.y += this.yspeed;
            })
            .attr({
                dmg: 2,
                w: 5,
                h: 5
            });
    }
});