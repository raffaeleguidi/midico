var easymidi = require('easymidi');
//const Gpio = require('onoff').Gpio;
//var shell = require('shelljs');

// shell.echo(new Date(), 'initializing gpio');
// if (shell.exec('./init.sh').code !== 0) {
//     console.error(new Date(), 'Error: init failed');
//     shell.exit(1);
// }

// const button1 = new Gpio(4, 'in', 'both', {debounceTimeout: 10});
// const button2 = new Gpio(27, 'in', 'both', {debounceTimeout: 10});
// const button3 = new Gpio(17, 'in', 'both', {debounceTimeout: 10});
// const button4 = new Gpio(22, 'in', 'both', {debounceTimeout: 10});

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
// 
// const led = new Gpio(18, 'out');
// function setLeds(number, value){ // 0=on
//     led.writeSync(value); 
// }

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

const peripherals = getPeripherals();
mg30In = new easymidi.Input(peripherals.mg30); 
mg30Out = new easymidi.Output(peripherals.mg30);  
mg30In.on('program', function (msg) {
    console.log("program", msg)
});
mg30In.on('cc', function (msg) {
  console.log("cc", msg)
});  
function hex2d(ar) {
  const ret=[];
  ar.forEach(e => ret.push(e.toString(16)))
  return ret
}
mg30In.on('sysex', function (msg) {
  console.log("sysex", hex2d(msg.bytes))
}); 

mg30In.on('mtc', function (msg) {
    console.log("mtc", msg)
}); 

mg30In.on('noteon', function (msg) {
    console.log("noteon", msg)
}); 

  mg30In.on('noteoff', function (msg) {
    console.log("noteoff", msg)
  }); 

  mg30In.on('poly aftertouch', function (msg) {
    console.log("poly aftertouch", msg)
  }); 

  mg30In.on('channel aftertouch', function (msg) {
    console.log("channel aftertouch", msg)
  }); 

  mg30In.on('pitch', function (msg) {
    console.log("pitch", msg)
  }); 

  mg30In.on('position', function (msg) {
    console.log("position", msg)
  }); 
  mg30In.on('select', function (msg) {
    console.log("select", msg)
  }); 
  mg30In.on('clock', function (msg) {
    console.log("clock", msg)
  }); 
  mg30In.on('start', function (msg) {
    console.log("start", msg)
  }); 
  mg30In.on('continue', function (msg) {
    console.log("continue", msg)
  }); 
  mg30In.on('stop', function (msg) {
    console.log("stop", msg)
  }); 
  mg30In.on('activesense', function (msg) {
    console.log("activesense", msg)
  }); 
  mg30In.on('reset', function (msg) {
    console.log("reset", msg)
  }); 

function h(str){
  return Number.parseInt(str, 16)
}

function wah(){
  console.log(new Date().getMilliseconds(), "turning on wah");
  mg30Out.send("sysex",[
    h("f0"), h("43"), h("58"), h("70"), h("7e"), 
    h("02"), h("0d"), h("00"), h("00"), h("00"), 
    h("00"), h("00"), h("00"), h("00"), h("f7")]);

  console.log(new Date().getMilliseconds(), "cc")
  mg30Out.send("cc", {channel: 1, controller: 0, value: 2})

  // setTimeout(function(){
      setTimeout(function(){
        console.log(new Date().getMilliseconds(), "2nd sysex")
        mg30Out.send("sysex",[
          h("f0"), h("43"), h("58"), h("70"), h("0d'"), 
          h("02"), h("00"),h("05"), h("01"), h("02"), 
          h("03"), h("09"), h("04"), h("0a"), h("06"), 
          h("07"), h("08"), h("0b"), h("04"), h("f7")]);
      }, 20)
  





    //mg30Out.send("cc", {channel: 0, controller: 0, value: 1})
    

    // mg30Out.send("sysex",[
    //   h("f0"), h("43"), h("58"), h("70"), h("7e"), 
    //   h("02"), h("0d"), h("00"), h("00"), h("00"), 
    //   h("00"), h("00"), h("00"), h("00"), h("f7")]);
  
    // mg30Out.send("cc", {channel: 0, controller: 0, value: h("41")})
  
    // mg30Out.send("sysex",[
    //   h("f0"), h("43"), h("58"), h("70"), h("0d'"), h("02"), 
    //   h("00"),h("05"), h("01"), h("02"), h("03"), h("09"), h("04"), 
    //   h("0a"), h("06"), h("07"), h("08"), h("0b"), h("00"), h("f7")]);
  
} 


setTimeout(wah, 3000)

