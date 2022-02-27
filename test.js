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


// https://www.npmjs.com/package/mcp-spi-adc
// https://www.amazon.it/Sconosciuto-Microchip-Technology-MCP3008-I-Wandler/dp/B01EYWCCHS/ref=sr_1_1?keywords=Mcp3008&qid=1644851797&sr=8-1


// vedere https://www.npmjs.com/package/pigpio#buttons-and-interrupt-handling

const Gpio = require('onoff').Gpio;

var shell = require('shelljs');

shell.echo('init');
if (shell.exec('./init.sh').code !== 0) {
    shell.echo('Error: init failed');
    shell.exit(1);
}

const button1 = new Gpio(17, 'in', 'both', {debounceTimeout: 10});
const button2 = new Gpio(27, 'in', 'both', {debounceTimeout: 10});
const button3 = new Gpio(22, 'in', 'both', {debounceTimeout: 10});
const button4 = new Gpio(4, 'in', 'both', {debounceTimeout: 10});

button4.watch((err, value) => console.log("A", value == 0 ? "down": "up"));
button2.watch((err, value) => console.log("B", value == 0 ? "down": "up"));
button1.watch((err, value) => console.log("C", value == 0 ? "down": "up"));
button3.watch((err, value) => console.log("D", value == 0 ? "down": "up"));
