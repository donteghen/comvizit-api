const EventEmitter = require('events') 
class Emitter {
    constructor() {
        this.events = {};
        
    }
    addListener(type, listener) {
        // check if the listener is a function and throw error if it is not
        if (typeof listener !== "function") {
            throw new Error("Listener must be a function!");
        }
        // create the event listener property (array) if it does not exist.
        this.events[type] = this.events[type] || [];
        // adds listners to the events array.
        this.events[type].push(listener);
        console.log(this.events[type].length)
    }

    emit(type, data) {
        if (this.events[type]) {
            this.events[type].forEach(listener => {
                listener(data)
            });
        }
    }

    on(type, data) {
        this.events[type].forEach((listener, index) => {
            listener(type, data, index)         
        })
    }
}

const event1 = new Emitter()
event1.addListener('greet', function handler1(type, data, index) {
    console.log(`${type} ----> Listener${index} says: => ${data}`)
})
event1.addListener('greet', function handler2(type, data, index) {
    console.log(`${type} ----> Listener${index} says: => ${data}`)
})
event1.emit('greet', 'bonjour boss')
