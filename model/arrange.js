var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var arrangeSchema = new Schema({
    id: Number,
    cupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cup' },
    board: [{
        left: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            move: [
                { p: Number, r: Number, c: Number, insertDate: Date }
            ]
        }],
        right: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            move: [
                { p: Number, r: Number, c: Number, insertDate: Date }
            ]
        }]
    }]
});

var Arrange = mongoose.model('Arrange', arrangeSchema);
module.exports = Arrange;