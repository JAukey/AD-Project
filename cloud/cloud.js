var fs = require('fs')
var multer = require('multer')
var express = require('express')
var app = express();

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
app.use(express.static(path.join(__dirname, 'public')))
app.post('/upload', upload.any(), (req, res, next) => {
    res.send({
        success: 1
    });
});
app.listen(4000)