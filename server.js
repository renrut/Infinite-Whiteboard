var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var paper = require('paper');
//paperjs drawing, has whole canvas on it
var extPaper = paper.setup();
var project = new paper.Project();
project.layers[0] = new paper.Layer();
project.layers[0].activate();

server.listen(8888);

//for stylesheets
app.use(express.static(__dirname + "/public"));

//give the html to the client
app.get('/', function (req, res) {
    var p = path.resolve(__dirname + '/Site.html');
	res.sendFile(p);
});

//socket io will listen to the socket
io.on('connection', function(socket){
    console.log('client connected');
   if(project != undefined){
        socket.emit('initialization', project.layers[0].exportJSON());
        console.log('client initialized');
    }
    
    socket.on('path update', function(path){
        console.log('PATH UPDATE');
        socket.broadcast.emit('path update', path);
        updateServerCanvas(path);
    });
    
    socket.on('disconnect', function(){
        console.log('client disconnected');
    });
});

function updateServerCanvas(path){
    var newPath = new paper.Path();
    newPath.importJSON(path);
    var test = project.layers[0].addChild(newPath);
}

var CronJob = require('cron').CronJob;
var job = new CronJob({
  cronTime: '00 00 00 * * 1-7',
  onTick: function() {
     project.clear();
     project.layers[0] = new paper.Layer();
     project.layers[0].activate();
  },
  start: false,
  timeZone: 'America/Los_Angeles'
});
job.start();
