var fs = require('fs')
var express = require('express')
var multer = require('multer')
var path = require('path')
var gm = require('gm')
var request = require('request')
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);

var createFolder = (folder) => {
    try {
        fs.accessSync(folder);
    } catch (e) {
        fs.mkdirSync(folder);
    }
};
var uploadFolder = './upload/'
createFolder(uploadFolder)

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '.jpg');
    }
});
var upload = multer({
    storage: storage
})

syn_post = function(url, form_data) {
    return new Promise((resolve, reject) => {
        request.post({ url: url, formData: form_data }, (err, res, body) => {
            if (err) {
                resolve(0);
                return console.error('upload failed:', err);
            }
            if (JSON.parse(body).success != undefined && JSON.parse(body).success == 1) {
                resolve(1);
            } else {
                resolve(0);
            }
        })
    })
};

app.use(express.static(path.join(__dirname, 'public')))
app.post('/upload', upload.any(), (req, res, next) => {
    gm(__dirname + '/upload/' + req.files[0].fieldname + '.jpg')
        .resizeExact(1024)
        .quality(70)
        .autoOrient()
        .write(__dirname + '/public/photoMini/' + req.files[0].fieldname + '-mini.jpg', (err) => {
            if (!err) { console.log('done') };
        });
    var formData = {
        [req.files[0].fieldname]: fs.createReadStream(__dirname + '/public/photoMini/' + req.files[0].fieldname + '-mini.jpg')
    }
    fn = async function() {
        var res_success = await syn_post('http://localhost:4000/upload', formData);
        console.log(res_success);
        res.json({
            success: res_success
        });
    }();
});

io.on('connection', (socket) => {
    socket.on('action', (data) => {
        if (data.action != undefined && data.action == 1) {
            socket.broadcast.emit('takePicture', {
                take: 1,
                uid: data.uid,
                num: data.num
            })
        }
    })
    socket.on('done', (data) => {
        if (data.success != undefined && data.success == 1) {
            socket.broadcast.emit('complete', { success: 1 })
        } else {
            socket.broadcast.emit('complete', { success: 0 })
        }
    })
})
server.listen(3000)