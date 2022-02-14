// *************
// esempi gpio
// °°°
// eseguire con https://www.npmjs.com/package/shelljs
// raspi-gpio set 17 pu
// raspi-gpio set 27 pu
// raspi-gpio set 22 pu
// raspi-gpio set 4 pu

// mappa dei pin
// https://docs.microsoft.com/it-it/windows/iot-core/learn-about-hardware/pinmappings/pinmappingsrpi

const Gpio = require('onoff').Gpio;

const button1 = new Gpio(17, 'in', 'both', {debounceTimeout: 10});
const button2 = new Gpio(27, 'in', 'both', {debounceTimeout: 10});
const button3 = new Gpio(22, 'in', 'both', {debounceTimeout: 10});
const button4 = new Gpio(4, 'in', 'both', {debounceTimeout: 10});

button1.watch((err, value) => console.log("black", value));
button2.watch((err, value) => console.log("red", value));
button3.watch((err, value) => console.log("yellow", value));
button4.watch((err, value) => console.log("green", value));