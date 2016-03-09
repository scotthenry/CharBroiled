/**
 * Created by Trevor Jackson on 13-Feb-2016.
 */
/// <reference path="../express/express.d.ts" />
/// <reference path="../app.ts" />
/// <reference path="../typings/main/ambient/multer/multer.d.ts" />
/// <reference path='../node/node.d.ts'/>
var express = require("express");
var path = require("path");
var ComicWebService = require("../public/js/ComicWebService");
var Panel = require("../public/js/panel");
var Comic = require("../public/js/comic");
var ImageWebService = require("../ImageWebService");
var multer = require('multer');
var Router = (function () {
    function Router() {
        var fs = require("fs");
        var upload = multer({ dest: 'uploads' });
        var cloudinary = require('cloudinary');
        cloudinary.config({
            cloud_name: 'hvsrk8atj',
            api_key: '588748484585879',
            api_secret: 'o2O9I2tAhbVa0XwmBXwq4oDbZ7Q'
        });
        var router = express.Router();
        /* GET view page. */
        router.get('/view', function (req, res, next) {
            res.sendFile(path.join(__dirname, '../views', 'view.html'));
        });
        /* GET edit page. */
        router.get('/edit', function (req, res, next) {
            res.sendFile(path.join(__dirname, '../views', 'edit.html'));
        });
        /* GET account page. */
        router.get('/', function (req, res, next) {
            res.redirect('/account');
        });
        /* GET account page. */
        router.get('/account', function (req, res, next) {
            if (req.user.customData.userType == "Viewer") {
                res.sendFile(path.join(__dirname, '../views', 'AccountViewer.html'));
            }
            else {
                res.sendFile(path.join(__dirname, '../views', 'Account.html'));
            }
        });
        /* POST newComic. */
        router.post('/comic', function (req, res, next) {
            var api = new ComicWebService();
            var defaultImage = "http://strategyjournal.ru/wp-content/themes/strategy/img/default-image.jpg";
            var defaultText = "Enter Text Here";
            var defaultTitle = "Comic Title";
            var defaultPublicView = true;
            var defaultPanel = new Panel(defaultText, defaultImage);
            var defpanels = [defaultPanel, defaultPanel, defaultPanel];
            var firstcontrib = req.user.email;
            var defcontribs = [firstcontrib, "", "", "", ""];
            var currComic = new Comic(defaultTitle, defaultPublicView, defpanels, defcontribs);
            api.newComic(currComic, function (err, response, body) {
                var id = body['_id'];
                var comics = req.user.customData.contributed;
                if (comics == undefined) {
                    comics = Array();
                }
                // Check if the comic is already in the array of comics
                for (var i = 0; i < comics.length; i++) {
                    if (comics[i] == id) {
                        res.send(JSON.stringify({ ComicID: id }));
                        return;
                    }
                }
                comics.push(id);
                req.user.customData.comic = comics;
                req.user.customData.contributed = comics; // not sure if need this or above line !!!
                req.user.save();
                res.send(JSON.stringify({ ComicID: id }));
            });
        });
        /* GET home page. */
        router.get('/user/email', function (req, res, next) {
            console.log(req.user.email);
            res.send(req.user.email.toString());
        });
        // don't know how restful this is, but seems better than putting it in '/findUserEmail'
        router.get('/user/type', function (req, res, next) {
            console.log(req.user.customData.userType);
            res.send(req.user.customData.userType.toString());
        });
        // returns first comic in the comic array
        router.get('/comicID', function (req, res, next) {
            var comics = req.user.customData.comic;
            res.send(comics[0]);
        });
        // --------------------------------------------------
        //                 RESTFUL API
        // --------------------------------------------------
        // Retrieve IDs of comic(s) the user has contributed to
        router.get('/user/comic', function (req, res, next) {
            if (req.user.customData.comic == undefined) {
                req.user.customData.comic = Array();
            }
            console.log(req.user.customData.comic);
            res.send(req.user.customData.comic);
        });
        router.put('/user/comic', function (req, res, next) {
            var comics = req.user.customData.comic;
            var id = req.body["comicID"];
            if (comics == undefined) {
                comics = Array();
            }
            // Check if the comic is already in the array of comics
            for (var i = 0; i < comics.length; i++) {
                if (comics[i] == id) {
                    res.send(JSON.stringify({ Status: "Success - ComicID already in Stormpath" }));
                    return;
                }
            }
            comics.push(id);
            req.user.customData.comic = comics;
            req.user.save();
            res.send(JSON.stringify({ Status: "Success - ComicID added to Stormpath" }));
        });
        // Retrieve JSON representation of a comic
        router.get('/comic/:id', function (req, res, next) {
            var id = req.params.id;
            var api = new ComicWebService();
            api.getAComic(id, function (err, response, body) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(body));
                //res.json(body);
            });
        });
        // Update a comic in the database
        router.put('/comic/:id', function (req, res, next) {
            var api = new ComicWebService();
            var comic = jsonToComic(req.body);
            comic.dbID = req.params.id;
            api.updateComic(comic, function (err, response, body) {
                res.send(JSON.stringify({ Status: "Comic Saved" }));
            });
        });
        // Add/Remove a Favourite Comic
        router.put('/user/fav/ids', function (req, res, next) {
            var fav = req.user.customData.favourites;
            var givenFav = req.body['favourite'];
            // if 1 then add, 0 then remove
            var addRemove = req.body['action'];
            if (fav == undefined) {
                fav = new Array();
            }
            if (addRemove == 0) {
                for (var i = 0; i < fav.length; i++) {
                    if (fav[i] == givenFav) {
                        fav = removeFavourite(fav, givenFav);
                        req.user.customData.favourites = fav;
                        req.user.save();
                        res.send(JSON.stringify({ Status: 'Update Successful - Removed Favourite' }));
                        return;
                    }
                }
            }
            else {
                fav.push(givenFav);
                req.user.customData.favourites = fav;
                req.user.save();
                res.send(JSON.stringify({ Status: "Update Successful - Added Favourite" }));
            }
        });
        // Send JSON array of fav comic ids
        router.get('/user/fav/ids', function (req, res, next) {
            res.send(JSON.stringify(req.user.customData.favourites));
        });
        //// Send JSON array of comic objects
        router.get('/user/fav', function (req, res, next) {
            var api = new ComicWebService();
            api.getComics(req.user.customData.favourites, function (request, response, body) {
                res.send(body);
            });
        });
        // Send JSON array of fav comic ids
        router.get('/user/contributed/ids', function (req, res, next) {
            console.log(req.user.customData.contributed);
            res.send(JSON.stringify(req.user.customData.contributed));
        });
        // Send JSON array of comic objects
        router.get('/user/contributed', function (req, res, next) {
            var api = new ComicWebService();
            api.getComics(req.user.customData.contributed, function (request, response, body) {
                res.send(body);
            });
        });
        // Remove a string from an array of strings
        // Used for removing a comic ID from a list of comic IDs
        // See router.put('/user/fav'
        function removeFavourite(fav, givenFav) {
            for (var i = 0; i < fav.length; i++) {
                if (fav[i] == givenFav) {
                    fav.splice(i, 1);
                }
            }
            return fav;
        }
        // Retrieve IDs of comic(s) the user has contributed to
        router.post('/image', upload.any(), function (req, res, next) {
            var api = new ImageWebService();
            api.addImage("/" + req.files[0].path, function (result) {
                //delete file after it's on cloudinary
                fs.unlink(__dirname.substring(0, __dirname.indexOf("\\routes")) + "\\" + req.files[0].path, function (err) {
                });
                if (result.secure_url == undefined) {
                    res.send("Error Uploading Image");
                }
                else {
                    // send the permanent url of the image back
                    res.send(result.secure_url);
                }
            });
        });
        // Retrieve IDs of comic(s) the user has contributed to
        router.delete('/image/:id', function (req, res, next) {
            var api = new ImageWebService();
            api.deleteImage(req.params.id, function (result) {
                res.send(JSON.stringify({ Status: "Image Removed" }));
            });
        });
        // Retrieve IDs of comic(s) the user has contributed to
        router.delete('/comic/:id', function (req, res, next) {
            var api = new ComicWebService();
            api.deleteAComic(req.params.id, function (result) {
                res.send(JSON.stringify({ Status: "Comic Deleted" }));
            });
            console.log('here');
            console.log(req.user.customData.contributed);
            var contributed = removeComicFromStormpath(req.params.id, req.user.customData.contributed);
            console.log(contributed);
            req.user.customData.contributed = contributed;
            var fav = removeFavourite(req.user.customData.favourites, req.params.id);
            req.user.customData.favourites = fav;
            req.user.save();
        });
        function removeComicFromStormpath(id, contributed) {
            for (var i = 0; i < contributed.length; i++) {
                if (contributed[i] == id) {
                    contributed.splice(i, 1);
                }
            }
            return contributed;
        }
        function jsonToComic(data) {
            /* CODE IS FOR DYNAMIC PANEL SUPPORT
             var panels = [];
             var i = 1;
             for(var p in data['Panels']) {
             panels[i] = new Panel(data['Panels']['Panel_'+i].Text, data['Panels']['Panel_'+i].Image_URL);
             }
             // !!! check that panels does not exceed panel number limit?
             */
            var panel1 = new Panel(data['Panels']['Panel_1'].Text, data['Panels']['Panel_1'].Image_URL);
            var panel2 = new Panel(data['Panels']['Panel_2'].Text, data['Panels']['Panel_2'].Image_URL);
            var panel3 = new Panel(data['Panels']['Panel_3'].Text, data['Panels']['Panel_3'].Image_URL);
            var panel4 = new Panel(data['Panels']['Panel_4'].Text, data['Panels']['Panel_4'].Image_URL);
            var panel5 = new Panel(data['Panels']['Panel_5'].Text, data['Panels']['Panel_5'].Image_URL);
            var panel6 = new Panel(data['Panels']['Panel_6'].Text, data['Panels']['Panel_6'].Image_URL);
            var panel7 = new Panel(data['Panels']['Panel_7'].Text, data['Panels']['Panel_7'].Image_URL);
            var panel8 = new Panel(data['Panels']['Panel_8'].Text, data['Panels']['Panel_8'].Image_URL);
            var panel9 = new Panel(data['Panels']['Panel_9'].Text, data['Panels']['Panel_9'].Image_URL);
            var panels = [panel1, panel2, panel3, panel4, panel5, panel6, panel7, panel8, panel9];
            var contributors = [
                data['Contributors']['Contributor_1'],
                data['Contributors']['Contributor_2'],
                data['Contributors']['Contributor_3'],
                data['Contributors']['Contributor_4'],
                data['Contributors']['Contributor_5']
            ];
            var comic = new Comic(data['Title'], data['Public'], panels, contributors);
            return comic;
        }
        module.exports = router;
    }
    return Router;
})();
var router = new Router();
//# sourceMappingURL=index.js.map