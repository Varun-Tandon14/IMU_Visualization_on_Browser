/*
This is meant to act as a bridge and forward the information it recieves from the COM port to a local client. Port number(default): 8000. 
An advanced version of the script can also account for Tare which is an amazing feature that the BNO080 offers. Read the documentation to know more.  
*/
var flag_tare_completed=0;
var flag_client_has_connected=0;
/* 
change the port number if you want to use any other port or the local port is busy. 
Please you want to check that this port number is same as in index.html and the client.js scripts
*/
var port = 8000, 

// Initialize the required libraries
express = require('express'),
app = express().use(express.static(__dirname + '/')),
http = require('http').Server(app),
io = require('socket.io')(http);
 
app.get('/', function(req, res){
     res.sendFile(__dirname + '/index.html');
});
 
 // Triggers when the client is connected 
 io.on('connection', function(socket){
     console.log('a user connected');
     flag_client_has_connected=1;
 });

 
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

//check the baud rate and COM port used in Arduino and change here accordingly
const sp_port = new SerialPort('COM6', { baudRate: 9600 });
const parser = sp_port.pipe(new Readline({ delimiter: '\n' }));
 
http.listen(port, function(){
     console.log("Node server listening on port " + port);
});
    
sp_port.on("open", () => {
  console.log('serial port open');
});

/*
Parse and forward the data to the client as event: serial_update
Please note this event name should be same as in the clinet.js script
*/
parser.on('data', data =>{
  console.log(data);
  if (flag_client_has_connected=='1')
  {
    io.sockets.emit('serial_update', data);
  }
}); 
  

   
   



