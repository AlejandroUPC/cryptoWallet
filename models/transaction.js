const mongoose = require('mongoose')
const passport = require('passport')
const Wallet = require('./wallet')
const passportLocalMongoose = require('passport-local-mongoose');
const { ObjectId } = require('bson');


const { Schema, model } = mongoose;

const transactionSchema = new Schema({
    currency: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true

    },
    purchaseDate: {
        type: String,
        required: true

    },
    purchPrice: {
        type: Number,
        required: true

    },
    currentPrice: {
        type: Number,
        required: false

    },
    profit: {
        type: Number,
        required: true

    },
});


transactionSchema.methods.updateWallet = async function (transactionList, userId, email, callback) {
    const updateWallet = await Wallet.findOneAndUpdate({ owner: ObjectId(userId) }, { $set: { transactionList: transactionList } }, { upsert: false, new: false })
        .then((data) => {
            console.log('Wallet updated')
        }).catch((err) => {
            console.log(err)
        })
}

module.exports = model('Transaction', transactionSchema);