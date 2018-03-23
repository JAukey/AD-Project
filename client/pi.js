var request = require('request')
var fs = require('fs')
var socket = require('socket.io-client')('http://localhost:3000');
var exec = require('child_process').exec
socket.on('takePicture', (data) => {
    if (data.take != undefined && data.take == 1) {
        var uid = data.uid;
        var num = data.num;
        //console.log(uid)
        exec('bash take-photo.sh', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                socket.emit('upload', { success: 0 });
                return;
            }
            name = uid + '-' + num;
            var formData = {
                [name]: fs.createReadStream(__dirname + '/photo/capt0000.jpg')
            }
            request.post({ url: 'http://localhost:3000/upload', formData: formData },
                (err, res, body) => {
                    if (err) {
                        socket.emit('upload', { success: 0 })
                        return console.error('upload failed:', err);
                    }
                    if (body.success != undefined && body.success == 1) {
                        socket.emit('upload', { success: 0 })
                    } else {
                        socket.emit('upload', { success: 1 })
                    }
                })
        })
    }
})