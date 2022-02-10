var easymidi = require('easymidi');

console.log("*** midico starting ***")
easymidi.getInputs().forEach(i => console.log("detected input:", i))
easymidi.getOutputs().forEach(i => console.log("detected output:", i))

var gboard = new easymidi.Input('iCON G_Boar V1.03');
var mg30 = new easymidi.Input('NUX MG-30');
var output = new easymidi.Output('NUX MG-30');
var bank = 0;

mg30.on('program', function (msg) {
    bank = Math.trunc(msg.number / 4)
    console.log("bank set to", bank, "from mg30")
});
mg30.on('cc', function (msg) {
  // console.log("got cc from mg30", msg)
  // noop
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

function remap(number){
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

gboard.on('program', function (msg) {
    handle(msg.number)
});
  