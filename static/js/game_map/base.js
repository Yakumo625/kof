import { GameObject } from "../gameobj/base.js";
import { Controller } from "../controller/base.js";

class GameMap extends GameObject {
    constructor(root) {
        super()

        this.root = root

        /** @type {HTMLCanvasElement} */

        this.$canvas = $('<canvas width="1280" height="720" tabindex=0></canvas>')
        this.ctx = this.$canvas[0].getContext('2d')
        this.root.$kof.append(this.$canvas)
        this.$canvas.focus()

        this.controller = new Controller(this.$canvas)

        this.root.$kof.append($(`<div class="kof-head">
        <div class="kof-head-hp0"><div><div></div></div></div>
        <div class="kof-head-timer"><div></div></div>
        <div class="kof-head-hp1"><div><div></div></div></div>
    </div>`))

        
        this.time_left = 120000
        this.$time = this.root.$kof.find(`.kof-head-timer`)
    }

    start() {

    }

    update() {

        this.time_left -= this.timedelta
        if (this.time_left < 0) this.time_left = 0

        if (this.time_left === 0) {
            for (let i of this.root.players){
                i.speedx = i.vx = 0
            }
        }
        this.$time.text(parseInt(this.time_left / 1000))
        this.render()
    }

    render() {
        //this.ctx.fillStyle = 'black'
        //this.ctx.fillRect(0, 0, this.$canvas.width(), this.$canvas.height())
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    }
}

export {
    GameMap
}