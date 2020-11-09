'use strict'
require('@babel/register');

var DB = require('./lib/db').default;
var Bcrypt = require('bcryptjs');

var email = process.argv[2];
var password = process.argv[3];

Bcrypt.genSalt(10, function(err, salt) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    Bcrypt.hash(password, salt, function(err, hash) {
        if (err) {
            console.log(err);
            process.exit(1);
        }

        DB.connect(function (err, db) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            db.collection('users').insertOne({
                email: email,
                password: hash,
            }, function (err, user) {
                if (err) {
                    console.log(err);
                    process.exit(1);
                }
                console.log('User created.');
                process.exit(0);
            });
        });
    });
});
