var easymidi = require('easymidi');

easymidi.getInputs().forEach(i => console.log("detected input:", i))
easymidi.getOutputs().forEach(i => console.log("detected output:", i))

var gboardIn;
var gboardOut;
var mg30In;
var mg30Out;

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

  if (false) mg30In.on('sysex', function (msg) {
    console.log("sysex", hex2d(msg.bytes))
  }); 

function h(str){
  return Number.parseInt(str, 16)
}

function wah(){
  console.log(new Date().getMilliseconds(), "turning on wah");
  mg30Out.send("cc", {channel: 1, controller: 0, value: 0});
  mg30Out.send("cc", {channel: 1, controller: 78, value: 0});
//   mg30Out.send("sysex",[
//     h("f0"), h("43"), h("58"), h("70"), h("7e"), 
//     h("02"), h("0d"), h("00"), h("00"), h("00"), 
//     h("00"), h("00"), h("00"), h("00"), h("f7")]);

//   console.log(new Date().getMilliseconds(), "cc")
//   mg30Out.send("cc", {channel: 1, controller: 78, value: 0})

//   // setTimeout(function(){
//       setTimeout(function(){
//         console.log(new Date().getMilliseconds(), "2nd sysex")
//         mg30Out.send("sysex",[
//           h("f0"), h("43"), h("58"), h("70"), h("0d'"), 
//           h("02"), h("00"),h("05"), h("01"), h("02"), 
//           h("03"), h("09"), h("04"), h("0a"), h("06"), 
//           h("07"), h("08"), h("0b"), h("04"), h("f7")]);
//       }, 20)
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
  
    setTimeout(wah, 3000)
} 


setTimeout(function(){
    console.log("uno")
    mg30Out.send("cc", {channel: 1, controller: 78, value: 100});
}, 2000)

setTimeout(function(){
    console.log("2")
    mg30Out.send("cc", {channel: 1, controller: 78, value: 100});
}, 4000)

setTimeout(function(){
    console.log("3")
    mg30Out.send("cc", {channel: 1, controller: 78, value: 0});
}, 6000)
