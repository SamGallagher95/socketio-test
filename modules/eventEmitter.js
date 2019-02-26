module.exports = class EventEmitter {
  constructor() {}

  on(eventString, callback) {
    if (!this.events) {
      this.events = new Map();
    }
    let array;
    if (this.events.get(eventString)) {
      array = this.events.get(eventString);
    } else {
      array = [];
    }
    array.push(callback);
    this.events.set(eventString, array);
  }

  emit(eventString, data) {
    if (this.events) {
      if (this.events.get(eventString)) {
        this.events.get(eventString).forEach(callback => {
          if (data) {
            callback(data);
          } else {
            callback();
          }
        });
      }
    }
  }
};
