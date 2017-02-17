const EventEmitter = require('events');

/**
 * A class representing a stream of events generated by polling a reddit API endpoint.
 */
class EventStream extends EventEmitter {
  /**
   * @param {number} rate Will execute pollFn every rate milliseconds
   * @param {function} pollFn The function to be polled. The results of pollFn() will be emitted.
   * @param {*} options The arguments pollFn should be called with.
   */
  constructor (rate, pollFn, ...options) {
    super();
    this.rate = rate;
    this.pollFn = pollFn;
    this.pollOptions = options;

    this.start();
  }
  poll () {
    if (this.stopped) {
      return;
    }

    const startTime = Date.now();

    const req = this.pollFn(...this.pollOptions).then(data => {
      data.filter(piece => piece.created_utc >= startTime)
        .forEach(piece => this.emit('data', piece));
    }).catch(e => this.emit('error', e));

    // eslint-disable-next-line promise/catch-or-return
    req.then(() => setTimeout(this.poll, this.rate - (Date.now() - startTime)));
  }
  /**
   * Will start the event stream. A new EventStream is started by default on construction.
   */
  start () {
    this.stopped = false;
    this.poll();
  }
  /**
   * Will stop the event stream.
   */
  stop () {
    this.stopped = true;
  }
};

module.exports = EventStream;