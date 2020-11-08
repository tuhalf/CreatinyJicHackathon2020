const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const engines = require('consolidate');


//auth.onAuthStateChanged(firebaseUser => {});

const firebaseapp = firebase.initializeApp(
    functions.config().firebase
);


function getReqAll() {
    const ref = firebaseapp.database().ref('requests');
    return ref.once('value').then(snap=>snap.val());
}

function register(user,pass) {
    const auth = firebase.auth();
    var isSucc = 0;
    const res = auth.createUser({
        email: user,
        emailVerified: false,
        password: pass,
        displayName: 'User',
        disabled: false
      })
        .then(function(userRecord) {
          isSucc = 1;
          console.log('Successfully created new user:', userRecord.uid);
        })
        .catch(function(error) {
            isSucc = 0;
          console.log('Error creating new user:', error);
        });
    return isSucc;
}

function login(user,pass) {
    const auth = firebase.auth();
    const res = auth.getUserByEmail(user);
    return res;
}


async function addRequest(heada, texta, usera,datea) {
    const ref = firebaseapp.database().ref('requests');
    const response = await ref.once('value').catch(err => {
        return -1;
    });

    if (response.hasChild(heada)) {
        return 0;
    }else{
        const refC = ref.child(heada);
        refC.update({
            head: heada,
            text: texta,
            user: usera,
            date: datea,
            })
        return 1;
    }
}

const app = express();
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');


app.get('/add', (request, response) => {
    //response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    let date_ob = new Date();

    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // prints date in YYYY-MM-DD format
    console.log(year + "-" + month + "-" + date);
    addRequest(request.query.head, request.query.text, request.query.user, String(year + "-" + month + "-" + date)).then(result => {
        if(result){
            getReqAll().then(loc=>{
                response.render('panel', { loc });
            })
        }else{
            response.send("Hata");
        }
        console.log(result);

    })
    
});

app.get('/loginP', (request, response) => {
    //response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    login(request.query.email, request.query.password).then(function(userRecord) {
        getReqAll().then(loc=>{
            response.render('panel', { loc });
        })
      console.log('Successfully fetched user data:', userRecord.toJSON());
    }).catch(function(error) {
        response.send("Kullanıcı bulunamadı. Lütfen üye olun");
     console.log('Error fetching user data:', error);
    });
    
});

app.get('/registerP', (request, response) => {
    //response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    register(request.query.email, request.query.password).then(function(userRecord) {
        getReqAll().then(loc=>{
            response.render('panel', { loc });
        })
      console.log('Successfully fetched user data:', userRecord.toJSON());
    }).catch(function(error) {
        response.send("Hata. Geliştirici ile iletişime geçin");
     console.log('Error fetching user data:', error);
    });
    
});

app.get('/', (request, response) => {
    //response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    getReqAll().then(loc=>{
        response.render('index', { loc });
    })
});

app.get('/login', (request, response) => {
    //response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        response.render('login');
});

app.get('/register', (request, response) => {
    //response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        response.render('register');
});


app.get('/panel', (request, response) => {
    //response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    getReqAll().then(loc=>{
        response.render('panel', { loc });
    })
});

app.get('/requests', (request, response) => {
    //response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    getReqAll().then(loc=>{
        response.render('requests', { loc });
    })
});

app.get('/connections', (request, response) => {
    //response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    getReqAll().then(loc=>{
        response.render('panel', { loc });
    })
});
app.get('/messages', (request, response) => {
    //response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    getReqAll().then(loc=>{
        response.render('panel', { loc });
    })
});
app.get('/api', (request, response) => {
    //response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    getLoc().then(loc=>{
        response.json(loc);
    })
});
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.app = functions.https.onRequest(app);
