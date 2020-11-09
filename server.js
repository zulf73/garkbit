import _ from 'lodash';
import Express from 'express';
import Async from 'async';
import DB from './lib/db';
import BodyParser from 'body-parser';
import Multer from 'multer';
import Crypto from 'crypto';
import FS from 'fs';
import Sharp from 'sharp';
import Exif from 'exif-reader';
import mmm, { Magic } from 'mmmagic';
import Bcrypt from 'bcryptjs';
import Passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import LocalStrategy from 'passport-local';
import JWT from 'jsonwebtoken';
import CookieParser from 'cookie-parser';

import { match } from 'react-router';
import Routes from './app/routes';
import configureStore from './app/store';

import Config from './config';

const app = Express();

const photoFolder = 'public/images/photos/';
const uploadFolder = 'public/images/uploads/';

app.use(Express.static('public'));
app.set('view engine', 'pug');
app.set('views', './views');
app.use(CookieParser());

const urlEncodedParser = BodyParser.urlencoded({ extended: false });

function getSubfolder (filename) {
    return Crypto.createHash('md5').update(filename).digest('hex').substr(0, 2);
}

const storage = Multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
        return cb(null, file.originalname);
    },
})

const upload = Multer({ storage: storage });

/* AUTHENTICATION */

const cookieExtractor = (req) => {
    let token;
    if (req && req.cookies) {
        token = req.cookies['token'];
    }
    return token;
};

const jwtOptions = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: Config.JWT_SECRET,
};

function generateToken(userId) {
    return JWT.sign({ userId: userId }, Config.JWT_SECRET, {
        expiresIn: 36400
    });
}

const localLogin = new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
    DB.connect(function (err, db) {
        if (err) return reject(err);
        db.collection('users').findOne({
            email: email,
        }, function (err, user) {
            if (err) return done(err);
            if (!user) return done(null, false, { error: 'Your login details could not be verified. Please try again.' });

            if (!Bcrypt.compareSync(password, user.password)) {
                return done(null, false, { error: "Your login details could not be verified. Please try again." });
            }

            return done(null, DB.toResponse(user));
        });
    });
});

const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
    DB.connect(function (err, db) {
        if (err) return reject(err);
        db.collection('users').findOne({
            _id: DB.objectId(payload.userId),
        }, function (err, user) {
            if (err) return done(err, false);
            if (user) return done(null, user);
            return done(null, false);
        });
    });
});

Passport.use(jwtLogin);
Passport.use(localLogin);
const requireAuth = Passport.authenticate('jwt', { session: false });
const requireLogin = Passport.authenticate('local', { session: false });

/* COMMON FUNCTIONS */

/* Get a gallery by ID */
const getGallery = (galleryId) => {
    return new Promise(function(resolve, reject) {
        DB.connect(function (err, db) {
            if (err) return reject(err);
            db.collection('galleries').findOne({
                '_id': DB.objectId(galleryId)
            }, function (err, gallery) {
                if (err) return reject(err);
                return resolve(gallery);
            });
        });
    });
}

/* Get gallery tree, sorted and nested properly */
const getGalleries = () => {
    return new Promise(function(resolve, reject) {
        DB.connect(function (err, db) {
            if (err) return reject(err);
            db.collection('galleries').find({}).toArray(function (err, galleries) {
                if (err) return reject(err);
                galleries = DB.toResponse(galleries);
                const galleryTree = galleries
                    /* Take just top level galleries */
                    .filter(g => g.parentId === null)
                    /* Map children IDs to full documents */
                    .map(function(g) {
                        const hydratedGallery = {...g};
                        if (!_.isEmpty(g.children)) {
                            const children = g.children.map(function (c) {
                                const index = _.findIndex(galleries, {id: c});
                                if (index < 0) {
                                    return null;
                                }
                                return galleries[index];
                            }).filter(c => c !== null);
                            hydratedGallery.children = _.sortBy(children, ['name']);
                        }
                        return hydratedGallery;
                    });
                /* Sort by name */
                const galleryTreeSorted = _.sortBy(galleryTree, ['name']);
                return resolve(galleryTreeSorted);
            });
        });
    });
}

const getMaxPosition = (galleryId) => {
    return new Promise(function(resolve, reject) {
        DB.connect(function (err, db) {
            if (err) return reject(err);
            db.collection('photos').aggregate([
                { $match: {'galleries.id': DB.objectId(galleryId)} },
                { $unwind: '$galleries' },
                { $match: {'galleries.id': DB.objectId(galleryId)} },
                { $sort: {'galleries.pos': -1} },
                { $limit: 1 }
            ]).toArray(function (err, result) {
                if (err) return reject(err);
                let position = 0;
                if (result.length > 0) {
                    position = result[0].galleries.pos;
                }
                return resolve(position);
            });
        });
    });
}

const getAllPhotos = () => {
    return new Promise(function(resolve, reject) {
        DB.connect(function (err, db) {
            if (err) return reject(err);
            db.collection('photos').find().toArray(function(err, photos) {
                if (err) return reject(err);
                return resolve(photos);
            });
        });
    });
}

/* CORS */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

/*
    POST /api/login
    Login a user and set a cookie with a json web token
*/
app.post('/api/login', [ urlEncodedParser, requireLogin ], function(req, res) {
    const userId = req.user.id;

    const jwt = generateToken(userId);
    res.cookie('token', jwt, { maxAge: 86400 * 1000, httpOnly: true }); // one day expiration

    res.status(200).json({
        userId: userId
    });
});

/*
    POST /api/logout
    Logout a user and remove the cookie
*/
app.post('/api/logout', requireAuth, function(req, res) {
    res.cookie('token', '', { expires: new Date(0) });
    res.json({ 'success': true });
});

/*
    GET /api/photos
    Get all photos
*/
app.get('/api/photos', function(req, res) {

    getAllPhotos()
        .then(photos => {
            return res.json({ 'photos': DB.toResponse(photos) });
        })
        .catch(err => {
            return res.json({ 'err': err });
        });

});

/*
    GET /api/galleries
    Get a list of galleries
*/
app.get('/api/galleries', requireAuth, function(req, res) {

    getGalleries()
        .then(galleries => {
            return res.json({ 'galleries': galleries });
        }).catch(err => {
            return res.json({ 'err': err });
        });

});

/*
    POST /api/galleries
    Add a new gallery
*/
app.post('/api/galleries', [ urlEncodedParser, requireAuth ], function(req, res) {

    const name = req.body.name;
    const parentId = req.body.parentId ? req.body.parentId : null;
    const isSet = req.body.isSet ? (req.body.isSet == 'true') : false;

    DB.connect(function (err, db) {
        if (err) return res.json({ 'err': err });
        db.collection('galleries').insertOne({
            name: name,
            parentId: parentId ? DB.objectId(parentId) : null,
            isSet: isSet,
        }, function (err, result) {
            if (err) return res.json({ 'err': err });
            const newId = result.insertedId;
            db.collection('galleries').updateOne({
                '_id': DB.objectId(parentId)
            }, {
                '$push': { 'children' : newId }
            }, function (err, result) {
                return res.json({ 'gallery': { 'id': newId, 'name': name, 'parentId': parentId, 'isSet': isSet }});
            });
        });
    });
});

/*
    POST /api/galleries/:id
    Update an existing gallery
*/
app.post('/api/galleries/:id', [ urlEncodedParser, requireAuth ], function(req, res) {

    const galleryId = req.params.id;

    getGallery(galleryId)
        .then(gallery => {

            let setParams = {};

            if (!_.isUndefined(req.body.name)) {
                setParams.name = req.body.name;
            }

            if (!_.isUndefined(req.body.sortBy)) {
                if (!_.includes(['pos', 'filename', 'date'], req.body.sortBy)) {
                    return res.json({ 'err': 'Invalid sort method specified.' });
                }
                if (gallery.isSet && req.body.sortBy === 'pos') {
                    return res.json({ 'err': 'Gallery sets cannot be custom sorted.' });
                }
                setParams.sortBy = req.body.sortBy;
            }

            DB.connect(function (err, db) {
                if (err) return res.json({'err': err});
                db.collection('galleries').updateOne({
                    '_id': DB.objectId(galleryId)
                }, {
                    '$set': setParams
                }, function (err, result) {
                    if (err) return res.json({ 'err': err });
                    const updatedGallery = Object.assign(gallery, setParams);
                    return res.json({ 'gallery': updatedGallery });
                });
            });
        });
});

/*
    DELETE /api/galleries/:id
    Delete a gallery
*/
app.delete('/api/galleries/:id', requireAuth, function(req, res) {

    const galleryId = req.params.id;

    const removeGallery = (galleryId) => {
        return new Promise(function(resolve, reject) {
            DB.connect(function (err, db) {
                if (err) return reject(err);
                db.collection('galleries').remove({
                    '_id': DB.objectId(galleryId)
                }, function (err, result) {
                    if (err) return reject(err);
                    return resolve(result);
                });
            });
        });
    }

    const removeChildFromGallery = (galleryId, parentId) => {
        return new Promise(function(resolve, reject) {
            DB.connect(function (err, db) {
                if (err) return reject(err);
                db.collection('galleries').updateOne({
                    '_id': DB.objectId(parentId)
                }, {
                    '$pull': { 'children': DB.objectId(galleryId) }
                }, function (err, result) {
                    if (err) return reject(err);
                    return resolve(result);
                });
            });
        });
    }

    const removeGalleryFromPhotos = (galleryId) => {
        return new Promise(function(resolve, reject) {
            DB.connect(function (err, db) {
                if (err) return reject(err);
                db.collection('photos').update({
                    'gallery.id': DB.objectId(galleryId)
                }, {
                    '$pull': { 'galleries': { 'id': DB.objectId(galleryId) }}
                }, function (err, result) {
                    if (err) return reject(err);
                    return resolve(result);
                });
            });
        });
    }

    getGallery(galleryId)
        .then(gallery => {
            const actions = [];
            if (!_.isEmpty(gallery.parentId)) {
                actions.push(
                    removeChildFromGallery(galleryId, gallery.parentId)
                );
            }
            if (!_.isEmpty(gallery.children)) {
                actions.push(
                    Promise.all(gallery.children.map((c) => removeGallery(c.toString())))
                );
            }
            return Promise.all(actions);
        })
        .then(() => {
            return removeGalleryFromPhotos(galleryId);
        })
        .then(() => {
            return removeGallery(galleryId);
        })
        .then(() => {
            return res.json({'success': true});
        })
        .catch(err => {
            return res.json({'err': err});
        });
});

/*
    GET /api/galleries/:id
    Get gallery details
*/
app.get('/api/galleries/:id', requireAuth, function(req, res) {

    const galleryId = req.params.id;

    DB.connect(function (err, db) {
        if (err) return res.json({'err': err});
        db.collection('galleries').findOne({
            '_id': DB.objectId(galleryId)
        }, function (err, gallery) {
            if (err) return res.json({'err': err});
            return res.json({'gallery': DB.toResponse(gallery)});
        });
    });
});

/*
    GET /api/galleries/:id/photos
    Get the photos from a gallery
*/
app.get('/api/galleries/:id/photos', function(req, res) {

    const galleryId = req.params.id;

    const getPhotosFromGallery = (galleryId, sortBy) => {
        return new Promise(function(resolve, reject) {
            DB.connect(function (err, db) {
                if (err) return reject(err);
                if (sortBy === 'pos') {
                    db.collection('photos').aggregate([
                        { $match: {'galleries.id': DB.objectId(galleryId)} },
                        { $unwind: '$galleries' },
                        { $match: {'galleries.id': DB.objectId(galleryId)} },
                        { $sort: {'galleries.pos': 1} },
                    ]).toArray(function (err, photos) {
                        if (err) return reject(err);
                        return resolve(photos);
                    });
                } else {
                    // Default, sort by capture date/time
                    let sort = { 'exif.exif.DateTimeOriginal': 1, 'fn': 1 };
                    if (sortBy === 'filename') {
                        sort = { 'fn': 1 };
                    }
                    db.collection('photos').find({
                        'galleries.id': DB.objectId(galleryId)
                    }).sort(sort).toArray(function (err, photos) {
                        if (err) return reject(err);
                        return resolve(photos);
                    });
                }
            });
        });
    }

    const getPhotosFromChildGalleries = (children, sortBy) => {
        return new Promise(function(resolve, reject) {
            DB.connect(function (err, db) {
                if (err) return reject(err);
                // Default, sort by capture date/time
                let sort = { 'exif.exif.DateTimeOriginal': 1, 'fn': 1 };
                if (sortBy === 'filename') {
                    sort = { 'fn': 1 };
                }
                db.collection('photos').find({
                    'galleries.id': { '$in': children }
                }).sort(sort).toArray(function (err, photos) {
                    if (err) return reject(err);
                    return resolve(photos);
                });
            });
        });
    }

    getGallery(galleryId)
        .then(gallery => {
            const sortBy = gallery.sortBy ? gallery.sortBy : 'date';
            // Gallery sets get child photos
            if (gallery.isSet) {
                return getPhotosFromChildGalleries(gallery.children, sortBy)
                    .then((photos) => {
                        return res.json({'photos': DB.toResponse(photos)});
                    });
            } else {
                return getPhotosFromGallery(galleryId, sortBy)
                    .then((photos) => {
                        return res.json({'photos': DB.toResponse(photos)});
                    });
            }
        })
        .catch(err => {
            return res.json({'err': err});
        });

});

/*
    PUT /api/galleries/:galleryId/photo/:photoId
    Put an existing photo into an existing gallery
*/
app.put('/api/galleries/:galleryId/photo/:photoId', requireAuth, function(req, res) {

    const galleryId = req.params.galleryId;
    const photoId = req.params.photoId;

    getGallery(galleryId)
        .then(gallery => {
            if (gallery.isSet) {
                return res.json({'err': 'Cannot add photos to gallery sets'});
            }
            DB.connect(function (err, db) {
                db.collection('photos').findOne({
                    '_id': DB.objectId(photoId),
                    'galleries.id': DB.objectId(galleryId)
                }, function (err, photo) {
                    if (err) return res.json({'err': err});
                    if (photo !== null) {
                        return res.json({'err': 'Photo already in this gallery'});
                    }
                    getMaxPosition(galleryId)
                        .then(position => {
                            db.collection('photos').updateOne({
                                '_id': DB.objectId(photoId)
                            }, {
                                '$push': { 'galleries': { 'id': DB.objectId(galleryId), 'pos': position + 1 } }
                            }, function (err, result) {
                                if (err) return res.json({'err': err});
                                return res.json({ 'success': true });
                            });
                        })
                });
            });
        });

});

/*
    DELETE /api/galleries/:galleryId/photo/:photoId
    Remove a photo from a gallery
*/
app.delete('/api/galleries/:galleryId/photo/:photoId', requireAuth, function(req, res) {

    const galleryId = req.params.galleryId;
    const photoId = req.params.photoId;

    DB.connect(function (err, db) {
        db.collection('photos').updateOne({
            '_id': DB.objectId(photoId),
            'galleries.id': DB.objectId(galleryId)
        }, {
            '$pull': { 'galleries': { 'id': DB.objectId(galleryId) } }
        }, function (err, result) {
            if (err) return res.json({ 'err': err });
            return res.json({ 'success': true });
        });
    });

});

/*
    POST /api/photos
    Upload a new photo
*/
app.post('/api/photos', [ requireAuth, upload.array('photo') ], function(req, res) {

    const galleryId = req.body.galleryId;
    const files = req.files;

    const validateFile = (file) => {
        return new Promise(function(resolve, reject) {
            const magic = new Magic(mmm.MAGIC_MIME_TYPE);
            magic.detectFile(file.path, function (err, result) {
                if (err) return reject(err);
                if (result === 'image/jpeg') {
                    file.isValid = true;
                } else {
                    file.isValid = false;
                }
                return resolve(file);
            })
        });
    }

    const mkdirAsync = (folder) => {
        return new Promise(function(resolve, reject) {
            //console.log('making directory');
            FS.mkdir(folder, function (err) {
                if (err) {
                    if (err.code !== 'EEXIST') {
                        return reject(err);
                    }
                }
                return resolve();
            });
        });
    }

    const unlinkAsync = (file) => {
        return new Promise(function(resolve, reject) {
            //console.log('unlinking file');
            FS.unlink(file, function (err) {
                 if (err) {
                     //return reject(err);
                     console.log(err);
                     return resolve();
                 }
                 return resolve();
            });
        });
    }

    const processOriginalImage = (file, toFilePath) => {
        //console.log('processing original image');
        const image = Sharp(file);
        return image
            .withMetadata()
            .jpeg({quality: 100})
            .rotate()
            .toFile(toFilePath)
    }

    const processMetadata = (file) => {
        //console.log('processing metadata');
        const image = Sharp(file);
        return image
            .metadata()
            .then(metadata => {
                let height = metadata.height;
                let width = metadata.width;
                if (metadata.orientation > 4) {
                    width = metadata.height;
                    height = metadata.width;
                }

                const newHeight = 100;
                const ratio = Math.round(height / newHeight);
                const newWidth = Math.round(width / ratio);

                const exifData = (metadata.exif) ? Exif(metadata.exif) : {};

                const returnData = { height, width, newHeight, newWidth, exifData };

                return returnData;
            });
    }

    const processThumbnailImage = (file, toWidth, toHeight, toFilePath) => {
        //console.log('processing thumbnail');
        const image = Sharp(file);
        return image
            .jpeg({quality: 100})
            .rotate()
            .resize(toWidth, toHeight)
            .toFile(toFilePath)
    }

    const processFile = (file) => {
        //console.log('processing file');
        const filename = file.filename;
        const filenameParts = _.split(filename, '.');
        const rawFilename = filenameParts[0];
        const fileExt = filenameParts[1];
        const subfolder = getSubfolder(filename);
        const folder = photoFolder + subfolder;
        const largePath = folder + '/' + filename;
        const thumbFilename = rawFilename + '_thumb.' + fileExt;
        const thumbPath = folder + '/' + thumbFilename;

        return mkdirAsync(folder)
            .then(() => processOriginalImage(file.path, largePath))
            .then(() => processMetadata(file.path))
            .then(fileData => {
                fileData.filename = filename;
                fileData.thumbFilename = thumbFilename;
                fileData.subfolder = subfolder;
                return processThumbnailImage(file.path, fileData.newWidth, fileData.newHeight, thumbPath)
                    .then(() => {
                        return fileData;
                        //return resolve(fileData);
                    });
            });
    }

    const getPhotoByFilename = (filename) => {
        return new Promise(function(resolve, reject) {
            DB.connect(function (err, db) {
                if (err) return reject(err);
                db.collection('photos').findOne({
                    'fn': filename,
                }, function(err, photo) {
                    if (err) return reject(err);
                    return resolve(photo);
                });
            });
        });
    }

    const savePhoto = (photoData) => {
        const { filename, thumbFilename, subfolder, width, height, newWidth, newHeight, exifData, gallery } = photoData;

        // Check if photo already exists
        return getPhotoByFilename(filename)
            .then(photo => {
                // If photo already exists
                if (photo !== null) {
                    photo.updatedExisting = true;
                    // Check if the photo is already in this gallery
                    // If it is, we're done
                    if (_.findIndex(photo.galleries, { 'id': gallery.id }) > -1) {
                        photo.existedInGallery = true;
                        return photo;
                    }
                    // Add it to this gallery
                    return new Promise(function(resolve, reject) {
                        DB.connect(function (err, db) {
                            if (err) return reject(err);
                            db.collection('photos').updateOne({
                                'fn': filename,
                            }, {
                                '$push': { 'galleries': gallery }
                            }, function (err, results) {
                                if (err) return err;
                                photo.galleries.push(gallery);
                                return resolve(photo);
                            });
                        });
                    });
                } else {
                    // Insert photo if it does not already exist
                    const photo = {
                        'fn': filename,
                        'path': subfolder,
                        'sizes': {
                            'original': {
                                'uri': subfolder + '/' + filename,
                                'width': width,
                                'height': height,
                            },
                            'thumb': {
                                'uri': subfolder + '/' + thumbFilename,
                                'width': newWidth,
                                'height': newHeight,
                            },
                        },
                        'galleries': [gallery],
                        'exif': exifData,
                    };

                    return new Promise(function(resolve, reject) {
                        DB.connect(function (err, db) {
                            if (err) return reject(err);
                            return db.collection('photos').insertOne(photo, function (err, results) {
                                if (err) return reject(err);
                                return resolve(photo);
                            });
                        });
                    });
                }
            });
    }

    Promise.all(files.map(validateFile))
        .then(validationResults => {
            let hasError = false;
            const errorFiles = [];
            const validFiles = validationResults.filter(f => {
                if (!f.isValid) {
                    hasError = true;
                    errorFiles.push(f);
                }
                return f.isValid;
            });
            getMaxPosition(galleryId)
                .then(position => {
                    return Promise.all(validFiles.map(processFile))
                        .then(photoData => {
                            const photos = photoData.map((p) => {
                                p.gallery = { 'id': DB.objectId(galleryId), 'pos': ++position };
                                return p;
                            });
                            //console.log(photos);
                            /* Save the photos to the database */
                            return Promise.all(photos.map(savePhoto))
                                .then((photos) => {
                                    /* Delete the temporary upload files */
                                    return Promise.all(files.map((f) => unlinkAsync(f.path)))
                                        .then(() => {
                                            const returnObject = {};
                                            if (hasError) {
                                                const errorFileNames = errorFiles.map(f => f.originalname);
                                                returnObject.error = { errorFiles: errorFileNames };
                                            }
                                            returnObject.photos = DB.toResponse(photos);
                                            //console.log('returning data', returnObject);
                                            return res.json(returnObject);
                                        });
                                });
                        })
                        .catch(err => {
                            return res.json({'err': err});
                        });
                });
        });
});

/*
    POST /api/photos/:id
    Update an existing photo
*/
app.post('/api/photos/:id', [ requireAuth, urlEncodedParser ], function(req, res) {

    const photoId = req.params.id;

    let setParams = {};

    if (!_.isUndefined(req.body.caption)) {
        setParams.caption = req.body.caption;
    }

    DB.connect(function (err, db) {
        if (err) return res.json({'err': err});
        db.collection('photos').updateOne({
            '_id': DB.objectId(photoId)
        }, {
            '$set': setParams
        }, function (err, result) {
            if (err) return res.json({ 'err': err });
            return res.json({ 'success': true });
        });
    });

});

/*
    PUT /api/galleries/:galleryId/photo/:photoId/sort
    Sort a photo in a gallery
*/
app.put('/api/galleries/:galleryId/photo/:photoId/sort', [ requireAuth, urlEncodedParser ], function(req, res) {

    const galleryId = req.params.galleryId;
    const photoId = req.params.photoId;
    const targetId = req.body.targetId;
    const direction = req.body.direction;

    Async.parallel([
        function (cb) {
            // Get position of photo
            DB.connect(function (err, db) {
                if (err) return cb(err);
                db.collection('photos').aggregate([
                    { $match: {'_id': DB.objectId(photoId)} },
                    { $unwind: '$galleries' },
                    { $match: {'galleries.id': DB.objectId(galleryId)} },
                    { $limit: 1 }
                ]).toArray(function (err, result) {
                    if (err) return cb(err);
                    return cb(null, result[0].galleries.pos);
                });
            });
        },
        function (cb) {
            // Get position of target photo
            DB.connect(function (err, db) {
                if (err) return cb(err);
                db.collection('photos').aggregate([
                    { $match: {'_id': DB.objectId(targetId)} },
                    { $unwind: '$galleries' },
                    { $match: {'galleries.id': DB.objectId(galleryId)} },
                    { $limit: 1 }
                ]).toArray(function (err, result) {
                    if (err) return cb(err);
                    return cb(null, result[0].galleries.pos);
                });
            });
        },
    ], function (err, results) {
        const photoPos = results[0];
        const targetPos = results[1];

        let newPos = targetPos;
        if (photoPos > newPos) {
            if (direction === 'after') ++newPos;
        } else {
            if (direction === 'before') --newPos;
        }

        Async.series([
            function (cb) {
                if (photoPos > newPos) {
                    DB.connect(function (err, db) {
                        db.collection('photos').update({
                            'galleries': { '$elemMatch': {
                                'id': DB.objectId(galleryId),
                                'pos': { '$gte': newPos, '$lt': photoPos }
                            }}
                        }, {
                            '$inc': {'galleries.$.pos': 1}
                        }, {
                            'multi': true,
                        }, function (err, result) {
                            if (err) return cb(err);
                            return cb();
                        });
                    });
                } else {
                    DB.connect(function (err, db) {
                        db.collection('photos').update({
                            'galleries': { '$elemMatch': {
                                'id': DB.objectId(galleryId),
                                'pos': { '$gt': photoPos, '$lte': newPos }
                            }}
                        }, {
                            '$inc': {'galleries.$.pos': -1}
                        }, {
                            'multi': true,
                        }, function (err, result) {
                            if (err) return cb(err);
                            return cb();
                        });
                    });
                }
            },
            function (cb) {
                DB.connect(function (err, db) {
                    db.collection('photos').updateOne({
                        '_id': DB.objectId(photoId),
                        'galleries.id': DB.objectId(galleryId)
                    }, {
                        '$set': {'galleries.$.pos': newPos}
                    }, function (err, result) {
                        if (err) return cb(err);
                        return cb();
                    });
                });
            }
        ], function (err, results) {
            if (err) return res.json({'err': err});
            return res.json({'success': true});
        });

    });

});

/*
    DELETE /api/photos/:id
    Delete a photo
*/
app.delete('/api/photos/:id', requireAuth, function(req, res) {

    const photoId = req.params.id;

    DB.connect(function (err, db) {
        if (err) return res.json({'err': err});
        db.collection('photos').findOneAndDelete({'_id': DB.objectId(photoId)}, function (err, result) {
            if (err) return res.json({'err': err});
            const photo = result.value;
            _.each(photo.sizes, function (s) {
                try {
                    FS.unlink(photoFolder + s.uri, function (err, result) {
                        if (err) console.log(err);
                    });
                } catch (e) {
                    console.log(e);
                }
            });
            return res.json({'photo': DB.toResponse(photo)});
        });
    });
});

app.use((req, res) => {
    match({routes: Routes, location: req.url}, (err, redirectLocation, renderProps) => {
        if (err) {
            console.error(err);
            return res.status(500).end('Internal server error');
        }

        if (!renderProps) return res.status(404).end('Not found.');

        /* Check cookie to see if user is logged in and make sure client knows about it */
        let isAuthenticated = false;
        if (req && req.cookies && req.cookies['token']) {
            isAuthenticated = true;
        }

        const store = configureStore({ auth: { isAuthenticated: isAuthenticated } });
        const initialState = store.getState();

        res.render('index', { initialState: initialState });
    });
});

export default app;
