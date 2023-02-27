let GAME_OBJECT = []

class GameObject {
    constructor() {
        GAME_OBJECT.push(this)

        this.timedelta = 0
        this.has_call_start = false
    }
    start() { // init

    }

    update() { // excute once per frame (except for the first time)

    }

    destroy() { // delete object
        for (let i in GAME_OBJECT) {
            if (GAME_OBJECT[i] === this) {
                GAME_OBJECT.splice(i, 1)
                break
            }
        }
    }
}

let last_timestamp

let GAME_OBJECT_FRAME = (timestamp) => {
    for (let obj of GAME_OBJECT) {
        if (!obj.has_call_start) {
            obj.start()
            obj.has_call_start = true
        } else {
            obj.timedelta = timestamp - last_timestamp
            obj.update()
        }
    }

    last_timestamp = timestamp
    requestAnimationFrame(GAME_OBJECT_FRAME)
}

requestAnimationFrame(GAME_OBJECT_FRAME)

export {
    GameObject
}