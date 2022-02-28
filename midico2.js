var easymidi = require('easymidi');
const Gpio = require('onoff').Gpio;
var shell = require('shelljs');

shell.echo(new Date(), 'initializing gpio');
if (shell.exec('./init.sh').code !== 0) {
    console.error(new Date(), 'Error: init failed');
    shell.exit(1);
}

const button1 = new Gpio(4, 'in', 'both', {debounceTimeout: 10});
const button2 = new Gpio(27, 'in', 'both', {debounceTimeout: 10});
const button3 = new Gpio(17, 'in', 'both', {debounceTimeout: 10});
const button4 = new Gpio(22, 'in', 'both', {debounceTimeout: 10});

console.log("*** midico 2 starting ***")
easymidi.getInputs().forEach(i => console.log("detected input:", i))
easymidi.getOutputs().forEach(i => console.log("detected output:", i))

var gboardIn;
var gboardOut;
var mg30In;
var mg30Out;

var bank = 0;

var held = {
  number: null,
  since: null
};

function setScene(scene){
  mg30Out.send('cc', { 
    controller: 76, // scene
    value: scene, // 0-1-2
    channel: 0
  });
  console.log("switched to scene", scene);
}

function checkClose(one, another, cb){
  if (one -1 == another || another -1 == one) {
    cb(Math.min(one, another))
  }
}

const led = new Gpio(18, 'out');
function setLeds(number, value){ // 0=on
    led.writeSync(value); 
}

function setLights(start, end, on){
    try { // gboard could not be connected            
        console.log("turning on led", on, "from", start, "to", end)
        for (let index = start; index <= end; index++) {
            gboardOut.send("noteon", { note: index, velocity: (index == on ? 127: 0), channel: 0})
        }
    } catch (error) {
        // noop
    }
}

function remap(number){
  switch(number){
    case 0: 
    case 1: 
    case 2: 
    case 3: 
        setLights(0,3,number);
        setLights(4,6, 4);
        mg30Out.send("program", {channel: 0, number: (number + bank*4) });
        console.log("sent PC", held.number)
        break;
    case 4:
    case 5:
    case 6:
        setLights(4,6,number);
        setScene(number-4);
        break; 
    case 7:
        setLights(4,6,4);
        setLights(0,3,0);
        setLights(7,7,7);
        setTimeout(function(){
            setLights(7,7,8);
        }, 1000)
        bank = 0;
        mg30Out.send("program", {channel: 0, number: 0});
        console.log("going home")
        break; 
    case 1: 
    case 2: 
    case 3: 
    default:
        console.log("unused switch", number)
  }
}

function handle(number){
  const lag = Date.now() - held.since;
    // check correlations
  if ( lag <= 3) {
    checkClose(number, held.number, function(combo){
      console.log("combo", combo);
      if (combo == 0) { 
        bank--;
        if (bank < 0) bank = 31
        console.log("bank is", bank);  
        remap(0);      
      } else if (combo == 2) {
        bank++;
        if (bank > 31) bank = 0 
        console.log("bank is", bank);
        remap(0);      
      }
    });
    held.number = null;
  } else {
    setTimeout(function(){
      if (held.number != null) {
        remap(held.number)
        held.number=null; held.since=null;
      }
    }, 3)
    held.number = number;
    held.since = Date.now();
  }
}


function resetPeripherals(){
    try {
        setLights(4,6,4);
        setLights(0,3,0);
        setLights(7,7,8);
    } catch (error) {
        // noop        
    }
    mg30Out.send("program", {channel: 0, number: 0 });
    bank = 0;
}


function getPeripherals(){
  const inputs = easymidi.getInputs();
  const mg30 = inputs.filter(n => { return n.startsWith('NUX MG-30')});
  const gBoard = inputs.filter(n => { return n.startsWith('iCON G_Boar')});
  return {
    mg30: mg30.length > 0 ? mg30[0] : null,
    gBoard: gBoard.length > 0 ? gBoard[0] : null,
  }  
}

function init(){
  try {
    setLeds(0, 0);
    //console.log("waiting for peripherals to connect");
    // if (!mg30In) console.log(new Date(), "mg30 not connected");
    // if (!gboardIn) console.log(new Date(), "g-board not connected");
    const peripherals = getPeripherals();
    if (!mg30In && peripherals.mg30) {
      mg30In = new easymidi.Input(peripherals.mg30); 
      mg30In.on('program', function (msg) {
        bank = Math.trunc(msg.number / 4)
        //console.log(msg.number - bank*4)
        setLights(0,3, msg.number - bank*4);
        setLights(4,6, 4);
        console.log("bank set to", bank, "from mg30In")
      });
      mg30In.on('cc', function (msg) {
        console.log("got cc from mg30In", msg)
        // todo align gboard leds to scene number
      });  
      console.log(new Date(), "mg30 connected");
    };
    if (!mg30Out && peripherals.mg30) { 
      mg30Out = new easymidi.Output(peripherals.mg30);  
    }
    if (!gboardIn && peripherals.gBoard) {
      gboardIn = new easymidi.Input(peripherals.gBoard);
      gboardIn.on('program', function (msg) {
        handle(msg.number)
      });
      console.log(new Date(), "g-board connected");
    }
    if (!gboardOut && peripherals.gBoard) {
      gboardOut = new easymidi.Output(peripherals.gBoard);  
      setLights(7,7,7);
    }

    if (!mg30In || !mg30Out || !gboardIn || !gboardOut) {
      throw 'peripherals not connected';
    }

    console.log(new Date(), "all peripherals connected")

    resetPeripherals();
  } catch (error) {
    //console.log("error", error)
    setTimeout(init, 1000);  
  }
}


function handleFootswitch(button, value){
    console.log(new Date(), "button", button, value == 0 ? "down": "up");
    if (value == 0){ // down
        setLeds(button, 1);
        switch(button){
            case 1: 
            case 2: 
            case 3:
                setScene(button-1);
                break;
            case 4:
                resetPeripherals();
                break;
        }
    } else {
        setLeds(button, 1);
    }
}

button1.watch((err, value) => handleFootswitch(1,value));
button2.watch((err, value) => handleFootswitch(2,value));
button4.watch((err, value) => handleFootswitch(3,value));
button3.watch((err, value) => handleFootswitch(4,value));

init()
