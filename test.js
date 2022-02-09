var easymidi = require('easymidi');

easymidi.getInputs().forEach(i => console.log("gboard:", i))
easymidi.getOutputs().forEach(i => console.log("output:", i))

var gboard = new easymidi.Input('iCON G_Boar V1.03');
var mg30 = new easymidi.Input('NUX MG-30');
var output = new easymidi.Output('NUX MG-30');
var bank = 0;

mg30.on('program', function (msg) {
  console.log("got program from mg30", msg)
});
mg30.on('cc', function (msg) {
  console.log("got cc from mg30", msg)
});

var held = {
  number: null,
  since: null
};

function setScene(scene){
  output.send('cc', {
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

function mapMidi(number){
  switch(number){
    case 0: 
    case 1: 
    case 2: 
    case 3: 
      output.send("program", {channel: 0, number: (number + bank*4) });
      console.log("sent PC", held.number)
      break;
    case 40:
      setScene(0);
      break; 
    case 41:
      setScene(1);
      break; 
    case 42:
      setScene(2);
      break; 
    case 1: 
    case 2: 
    case 3: 
    default:
    console.log(number)
  }
}

function fire(number){
  const lag = Date.now() - held.since;
    // check correlations
  if ( lag <= 3) {
    checkClose(number, held.number, function(combo){
      console.log("combo", combo);
      if (combo == 0) { // riscrivere funzionale
        bank--;
        if (bank < 0) bank = 31
        console.log("bank is", bank);        
      } else if (combo == 2) {
        bank++;
        if (bank > 31) bank = 0 
        console.log("bank is", bank);
      }
    });
    held.number = null;
  } else {
    setTimeout(function(){
      if (held.number != null) {
        mapMidi(held.number)
        held.number=null; held.since=null;
      }
    }, 3)
    held.number = number;
    held.since = Date.now();
  }
}

gboard.on('program', function (msg) {
    fire(msg.number)
});
  
  // gboard.on('sysex', function (msg) {
  //   // do something with msg
  //   console.log("got sysex", msg)
  // });

  /*
output.send('cc', {
    controller: 2, // efx (overdrive)
    value: 100, // 1-on 100-off
    channel: 0 // 0=on 1=off
});
output.send('cc', {
    controller: 76, // scene
    value: 0, // 0-1-2
    channel: 0
});

output.send('cc', {
    controller: 7, // modulation
    value: 0,
    channel: 0 // 0=on 1=off
});

 output.send('program', {
     number: 0, // 0=01A-127=32D
     channel: 0
 });
*/

  /*
return







const midi = require('midi');

// Set up a new output.
const output = new midi.Output();

// Count the available output ports.
console.log(output.getPortCount());

// Get the name of a specified output port.
console.log(output.getPortName(1));

// Open the first available output port.
output.openPort(1);

// Send a MIDI message.
//output.sendMessage([176,77,0]); // 0 accende 1 spegne
//output.sendMessage(["0xBO",77,1]); // 0 accende 1 spegne
//output.sendMessage([176,7,0]); // 0 accende 1 spegne
output.sendMessage([12,0,1]); // 0 accende 1 spegne

//0xBO 176 cc
//0x0C 12 pc




// Close the port when done.
output.closePort();

*/