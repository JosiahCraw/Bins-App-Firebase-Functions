const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

exports.setUpUser = functions.auth.user().onCreate((user) => {
    db.collection('Users')
    .doc(user.uid)
    .set({Count:0}).then(() => {
        console.log('User write succesful');
    });
});

exports.removeUser = functions.auth.user().onDelete((user) => {
    db.collection('Users').doc(user.uid).delete().then(() => {
        console.log('User Delete succesful');
    });
});

exports.addUserToBin = functions.firestore.document('tempBins/{tempID}').onUpdate((snap, context) => {
    const data = snap.after.data();
    if (data.user != snap.before.data().user) {
        db.doc(`bins/${data.bin}`)
            .update({userActive:data.user}).then(() => {
                console.log('User added to bin successfully');
            });
    }
});

exports.destroyTempBin = functions.firestore.document('tempBins/{tempID}').onUpdate((snap, context) => {
    const data = snap.after.data();
    if (snap.after.data().closed) {
        db.doc(`tempBins/${context.params.tempID}`).delete().then(() => {
            console.log(`Temp Bin removed: ${context.parms.tempID}`);
        });
    }
});

exports.checkHighScore = functions.firestore.document('Users/{userID}').onUpdate((snap, context) => {
    if (snap.after.data().Count != snap.after.data().Count) {
        if (snap.after.data().Count > db.doc('highScores/1').get('count')) {
            db.doc('highScores/1').set({count:snap.after.data().Count,
                user: context.params.userID
            });
        }
        if (snap.after.data().Count > db.doc('highScores/2').get('count')) {
            db.doc('highScores/2').set({count:snap.after.data().Count,
                user: context.params.userID
            });
        }
        if (snap.after.data().Count > db.doc('highScores/3').get('count')) {
            db.doc('highScores/3').set({count:snap.after.data().Count,
                user: context.params.userID
            });
        }
        if (snap.after.data().Count > db.doc('highScores/4').get('count')) {
            db.doc('highScores/4').set({count:snap.after.data().Count,
                user: context.params.userID
            });
        }
        if (snap.after.data().Count > db.doc('highScores/5').get('count')) {
            db.doc('highScores/5').set({count:snap.after.data().Count,
                user: context.params.userID
            });
        }
    }
});

exports.createTempBin = functions.firestore.document('bins/{binID}').onUpdate((snap, context) => {
    if (snap.after.data().tempCode != snap.before.data().tempCode) {
        db.doc(`bins/${context.params.binID}`)
            .update({user:''})
            .then(() => {
                console.log(`Removed user from ${context.params.binID}`);
            });
        db.doc(`tempBins/${snap.before.data().tempCode}`)
            .update({closed:true})
            .then(() => {
                console.log(`Set closed: ${snap.before.data().tempCode}`);
            });

        db.doc(`tempBins/${snap.after.data().tempCode}`).set(
            {bin:context.params.binID,
                closed:false,
                inUse:false,
                user:''}).then(() => {
                console.log(`Temp Bin added: ${conext.params.binID}`);
            });
    }
});
