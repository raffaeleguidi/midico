const easymidi = require('easymidi');

easymidi.getInputs().forEach(i => console.log("detected input:", "'" + i + "'"))
easymidi.getOutputs().forEach(i => console.log("detected output:",  "'" + i + "'"))

function connect(name){
  const input = easymidi.getInputs().filter(e => e.search(name) >= 0);
  const output = easymidi.getOutputs().filter(e => e.search(name) >= 0);
try {
    return {
      input: input.length > 0 ? new easymidi.Input(input[0]) : null,
      output: output.length > 0 ? new easymidi.Output(output[0]) : null
    }
} catch (error) {
    console.error(error)   
  }
}

function hex(s){
  return parseInt(s, 16);
}

connect("FootCtrl Bluetooth").input.on('program', (msg) => {
  console.log("program:", msg);
});

connect("FootCtrl Bluetooth").input.on('cc', (msg) => {
  console.log("control:", msg);
});
