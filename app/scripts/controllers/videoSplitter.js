/**
 * Created by ShiWeinan on 2016/12/12 0012.
 */
'use strict'
importScripts('../ffmpeg-all-codecs.js');
function print(text) {
  postMessage({
    'type': 'stdout',
    'data': text
  });
}
var args = ['-i', '','-codec','copy','-f','segment','-segment_time', '10', '-reset_timestamps','1', '-map', '0', 'output\%d.mp4'];
onmessage = function(event) {
  var files = event.data;
  console.log('in worker');
  console.log(event);
  console.log(files);
 /* var files = [];
  var reader = new FileReader();
  reader.onload = function() {
    console.log('onload');
    var videoData = new Uint8Array(this.result);*/
    args[1] = files[0].name;
    console.log(files[0].name);
    var Module = {
      print: print,
      printErr: print,
      files: files || [],
      arguments: args,
      TOTAL_MEMORY: 268435456
    };
    console.log(Module);
    var result = ffmpeg_run(Module);
    postMessage({
      'data': result,
      'type':'done'
    });

 /* };

  //reader.readAsBinaryString(new Blob([file]));
  reader.readAsArrayBuffer(file);*/

};
postMessage({
  'data': 'ready'
});
