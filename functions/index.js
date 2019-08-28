const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

exports.setUpUser = functions.auth.user().onCreate((user) => {
    db.collection('Users')
    .doc(user.uid)
    .set({Count:0,
        bin:''});
});

exports.removeUser = functions.auth.user().onDelete((user) => {
    db.collection('Users').doc(user.uid).delete()
});
