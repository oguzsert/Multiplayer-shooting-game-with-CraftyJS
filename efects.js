Crafty.c("Damage",{
    init:function(){
        this.addComponent("2D","Canvas","dmg");
        var that = this;
        setTimeout(function(){that.destroy()},100);
        // .delay(function(){this.destroy()},100);
        
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

        Crafty.audio.play("explode", 1, 0.5);
    }
});
