import { GameObject } from "../gameobj/base.js";

class Player extends GameObject {
    constructor(root, info) {
        super()

        this.root = root
        this.id = info.id
        this.x = info.x
        this.y = info.y
        this.width = info.width
        this.height = info.height
        this.color = info.color

        this.direction = 1

        this.vx = 0
        this.vy = 0

        this.speedx = 400
        this.speedy = -1100

        this.hp = 100
        this.$hp = this.root.$kof.find(`.kof-head-hp${this.id}>div`)
        this.$hp_div = this.$hp.find(`div`)

        this.gravity = 50

        this.ctx = this.root.game_map.ctx

        this.status = 3 // 0: idle, 1: forward, 2: back, 3: jump, 4: attack, 5: be hitted, 6: dead

        this.pressed_keys = this.root.game_map.controller.pressed_keys

        this.animations = new Map()
        this.frame_current_cnt = 0
    }

    start() {

    }

    update() { // 更新对象状态
        this.update_control()
        this.update_move()
        this.updtae_direction()
        this.update_attack()
        this.render()
    }

    update_move() { // 更新角色坐标

        this.vy += this.gravity

        if (this.status !== 6) this.x += this.vx * this.timedelta / 1000
        this.y += this.vy * this.timedelta / 1000

        // 避免角色对象超出地图边界
        if (this.y > 450) {
            this.y = 450
            this.vy = 0

            if (this.status === 3) this.status = 0
        }

        if (this.x < 0) {
            this.x = 0
        } else if (this.x + this.width > this.root.game_map.$canvas.width()) {
            this.x = this.root.game_map.$canvas.width() - this.width
        }
    }

    update_control() { // 检测输入事件并改变对象状态
        let w, a, d, space
        if (this.id === 0) {
            w = this.pressed_keys.has('w')
            a = this.pressed_keys.has('a')
            d = this.pressed_keys.has('d')
            space = this.pressed_keys.has(' ')
        } else {
            w = this.pressed_keys.has('ArrowUp')
            a = this.pressed_keys.has('ArrowLeft')
            d = this.pressed_keys.has('ArrowRight')
            space = this.pressed_keys.has('Enter')
        }


        if (this.status === 0 || this.status === 1) {
            if (space) {
                this.status = 4
                this.vx = 0
                this.frame_current_cnt = 0
            } else if (w) {
                if (d) {
                    this.vx = this.speedx
                } else if (a) {
                    this.vx = -this.speedx
                } else {
                    this.vx = 0
                }
                this.vy = this.speedy
                this.status = 3
                this.frame_current_cnt = 0
            } else if (d) {
                this.vx = this.speedx
                this.status = 1
            } else if (a) {
                this.vx = -this.speedx
                this.status = 1
            } else {
                this.vx = 0
                this.status = 0
            }
        }
    }

    updtae_direction() { // 更新角色朝向
        let players = this.root.players

        if (players[0] && players[1]) {
            let me = this, you = players[1 - me.id]
            if (me.status !== 6) {
                if (me.x < you.x) me.direction = 1
                else me.direction = -1
            }
        }
    }

    update_attack() { // 碰撞检测
        if (this.status === 4 && this.frame_current_cnt === 18) {
            let me = this, you = this.root.players[1 - this.id]
            let r1, r2
            if (this.direction > 0) {
                r1 = {
                    x1: me.x + me.width,
                    y1: me.y + 45,
                    x2: me.x + me.width + 90,
                    y2: me.y + 45 + 20,
                }
            } else {
                r1 = {
                    x1: me.x - 90,
                    y1: me.y + 45,
                    x2: me.x,
                    y2: this.y + 45 + 20,
                }
            }

            r2 = {
                x1: you.x,
                y1: you.y,
                x2: you.x + you.width,
                y2: you.y + you.height
            }

            if (this.is_collision(r1, r2)) {
                you.is_attacked()
            }
        }

    }

    is_collision(r1, r2) { // 碰撞检测函数
        if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2))
            return false
        if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2))
            return false
        return true
    }

    is_attacked() {

        if (this.status !== 6) {
            this.status = 5

            this.hp = Math.max(this.hp - 10, 0)
            if (this.hp === 0) {
                this.status = 6
            }

            this.$hp.animate({
                width: this.$hp.parent().width() * this.hp / 100
            }, 800)

            this.$hp_div.animate({
                width: this.$hp.parent().width() * this.hp / 100
            }, 300)

            this.frame_current_cnt = 0
        }

    }

    render() { // 渲染角色图形

        // 碰撞盒子
        this.ctx.fillStyle = this.color
        this.ctx.fillRect(this.x, this.y, this.width, this.height)

        if (this.status === 4) {
            if (this.direction > 0) {
                this.ctx.fillStyle = this.color
                this.ctx.fillRect(this.x + this.width, this.y + 45, 90, 20)
            } else {
                this.ctx.fillStyle = this.color
                this.ctx.fillRect(this.x, this.y + 45, -90, 20)
            }
        }


        let status = this.status

        if (this.status === 1 && this.direction * this.vx < 0) status = 2

        let obj = this.animations.get(status)
        if (obj && obj.loaded) {

            if (this.direction > 0) {
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt
                if (this.status !== 0) console.log(`${k} : ${obj.frame_cnt} : ${this.frame_current_cnt}`)
                let image = obj.gif.frames[k].image
                this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale)
            } else {
                this.ctx.save()
                this.ctx.scale(-1, 1)
                this.ctx.translate(-this.root.game_map.$canvas.width(), 0)

                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt
                if (this.status !== 0) console.log(`${k} : ${obj.frame_cnt} : ${this.frame_current_cnt}`)
                let image = obj.gif.frames[k].image
                this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.x - this.width, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale)

                this.ctx.restore()
            }
        }

        if (this.status === 4 || this.status === 5 || this.status === 6) {
            if (this.frame_current_cnt === obj.frame_rate * (obj.frame_cnt - 1)) {
                if (this.status === 6) {
                    this.frame_current_cnt--
                } else {
                    this.status = 0
                }
            }
        }

        this.frame_current_cnt++
    }
}

export {
    Player
}