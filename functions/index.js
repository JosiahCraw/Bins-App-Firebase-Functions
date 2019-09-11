const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

exports.setUpUser = functions.auth.user().onCreate((user) => {
    db.collection('Users')
    .doc(user.uid)
    .set({Count:0,
        Name:user.displayName}).then(() => {
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

        db.doc(`bins/${snap.after.data().bin}`).update({user:''});

        db.doc(`tempBins/${context.params.tempID}`).delete().then(() => {
            console.log(`Temp Bin removed: ${context.params.tempID}`);
        });
    }
});

exports.checkHighScore = functions.firestore.document('Users/{userID}').onUpdate((snap, context) => {
	let scoreRef = db.collection('highScore');
	let query = scoreRef.where('count', '<', snap.after.data().Count);
        console.log(`Checking if ${snap.after.data().Count} is a high score`);
        query.orderBy('count', 'desc').limit(1).get().then(snapshot => {
	        snapshot.forEach(docSnap => {
                    console.log(`Got Doc user score: ${snap.after.data().Count}`);
		    docSnap.ref.set({user:context.params.userID,
		        count:snap.after.data().Count});
		});
        });
});

exports.checkIfBinsIsFull = functions.firestore.document('bins/{binID}').onUpdate((snap, context) => {
    if (snap.after.data().full) {
        db.doc(`fullBins/${context.params.binID}`).set({});
    } else if (snap.after.data().full == false && snap.before.data().full == true) {
        db.doc(`fullBins/${context.params.binID}`).delete();
    }
});

exports.createTempBin = functions.firestore.document('bins/{binID}').onUpdate((snap, context) => {
    if (snap.after.data().tempCode != snap.before.data().tempCode) {
        db.doc(`tempBins/${snap.after.data().tempCode}`).set(
            {bin:context.params.binID,
                closed:false,
                inUse:false,
                user:''}).then(() => {
                console.log(`Temp Bin added: ${context.params.binID}`);
            });

	db.doc(`tempBins/${snap.before.data().tempCode}`)
            .update({closed:true})
            .then(() => {
                console.log(`Set closed: ${snap.before.data().tempCode}`);
            });
    }
});

exports.updateHighScore = functions.firestore.document('highScore/{position}').onUpdate((snap, context) => {
    var next = parseInt((Number(context.params.position)+1));
    db.doc(`highScore/${next}`).update({
        count:snap.before.data().count,
        user:snap.before.data().user});
    console.log(`Shifted from ${context.params.position}`)
});
