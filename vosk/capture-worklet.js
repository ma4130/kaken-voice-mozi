class VoiceCapture extends AudioWorkletProcessor {
  constructor(){super();this.buffer=new Float32Array(1024);this.used=0;}
  process(inputs,outputs){
    const input=inputs[0]?.[0];
    if(input){let offset=0;while(offset<input.length){const n=Math.min(input.length-offset,this.buffer.length-this.used);this.buffer.set(input.subarray(offset,offset+n),this.used);this.used+=n;offset+=n;if(this.used===this.buffer.length){this.port.postMessage(this.buffer,[this.buffer.buffer]);this.buffer=new Float32Array(1024);this.used=0;}}}
    for(const output of outputs)for(const channel of output)channel.fill(0);
    return true;
  }
}
registerProcessor('voice-capture',VoiceCapture);

