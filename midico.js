var easymidi = require('easymidi');

console.log("*** midico starting ***")
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

function setLights(start, end, on){
    console.log("turning on led", on, "from", start, "to", end)
    for (let index = start; index <= end; index++) {
        gboardOut.send("noteon", { note: index, velocity: (index == on ? 127: 0), channel: 0})
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
  setLights(4,6,4);
  setLights(0,3,0);
  setLights(7,7,8);
  mg30Out.send("program", {channel: 0, number: 0 });
  bank = 0;
}



function init(){
  try {
    console.log("waiting for peripherals to connect")
    const mg30 = easymidi.getInputs().filter(n => { return n.startsWith('NUX MG-30')})[0];
    const gBoard = easymidi.getInputs().filter(n => { return n.startsWith('iCON G_Boar')})[0];
    gboardIn = new easymidi.Input(gBoard)
    gboardOut = new easymidi.Output(gBoard);
    mg30In = new easymidi.Input(mg30);
    mg30Out = new easymidi.Output(mg30);  
    console.log("peripherals connected")

    gboardIn.on('program', function (msg) {
      handle(msg.number)
    });
    mg30In.on('program', function (msg) {
      bank = Math.trunc(msg.number / 4)
      //console.log(msg.number - bank*4)
      setLights(0,3, msg.number - bank*4);
      setLights(4,6, 4);
      console.log("bank set to", bank, "from mg30In")
    });
    mg30In.on('cc', function (msg) {
    // console.log("got cc from mg30In", msg)
    // todo align gboard leds to scene number
    });
    resetPeripherals();
  } catch (error) {
    console.log("error", error)
    setTimeout(init, 1000);  
  }
}

init()
