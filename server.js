let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

mongoose.Promise = Promise;

// Database URL goes here
const url = "";

let Message = mongoose.model('Message', {
    name: String,
    message: String
})

mongoose.connect(url, { useNewUrlParser: true} , (err) => {
    console.log("Mongo DB Connection", err);
});

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages)
    })
});

app.get('/messages/:user', (req, res) => {
    let user = req.params.user;
    Message.find({name: user}, (err, messages) => {
        res.send(messages)
    })
});

app.post('/messages', async (req, res) => {
    
    try {

        let message = new Message(req.body);

        let savedMessage = await message.save();

        console.log('saved');
        let censored = await Message.findOne({message: 'badword'})

        if (censored)
            await Message.deleteOne({_id: censored.id});
        else
            io.emit('message', req.body);

        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500);
        return console.error(error)
    } finally {
        console.log('Message post called');
    }

});

io.on('connection', (socket) => {
    console.log('user connected')
})
let server = http.listen('3000', () => {
    console.log('server is listening on port', server.address().port)
});
