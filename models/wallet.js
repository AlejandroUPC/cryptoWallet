const mongoose = require('mongoose')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

const { Schema, model } = mongoose;

const walletSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    transactionList: [{
        type: Schema.Types.ObjectId,
        ref: 'Transaction'
    }]
});


module.exports = model('Wallet', walletSchema);