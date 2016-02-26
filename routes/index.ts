/**
 * Created by Trevor Jackson on 13-Feb-2016.
 */
/// <reference path="../express/express.d.ts" />
/// <reference path="../app.ts" />
import express = require("express");
import Tools = require('../scripts');
import path    = require("path");
import ComicManager = require('../ComicManager');
import ComicWebService = require("../public/js/ComicWebService");
import Panel = require("../public/js/panel");
import Comic = require("../public/js/comic");


var router = express.Router();

/* GET edit page. */
router.get('/view', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../views', 'view.html'));
});

/* GET edit page. */
router.get('/edit', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../views', 'edit.html'));
});

/* GET edit page. */
router.get('/comicJSON/:id', function (req, res, next) {
    var id = req.params.id;
    var api = new ComicWebService();

    api.getAComicById(id, function(err:string, response:string, body:string){
        res.send(JSON.stringify(body));
    });

});

/* GET home page. */
router.get('/test', function (req, res, next) {
    console.log("test");
    var tools = new Tools();
    tools.WelcomeMessage();
    res.render('index', {title: 'Express'});
});


/* GET home page. */
router.post('/testingCall', function (req, res, next) {
    console.log(req.body);
    res.send("Hello From Server");
});

/* GET home page. */
router.post('/newComic', function (req, res, next) {
    var api = new ComicWebService();

    var defaultImage = "http://i.imgur.com/An1bi8f.jpg";
    var defaultText = "Trevor's Test.";
    var defaultTitle = "Trevor's Test.";
    var defaultPublicView = true;
    var defaultPanel = new Panel(defaultText, defaultImage);
    var defpanels:Panel[] = [defaultPanel, defaultPanel, defaultPanel];
    var defcontribs:string[] = ["", "", "", "", ""];
    var currComic = new Comic(defaultTitle, defaultPublicView, defpanels, defcontribs);

    api.newComic(currComic, function(err:string, response:string, body:string){
        console.log('here');
        currComic.dbID = body['_id'];
        console.log(currComic.dbID);
        console.log(req.user.email);
        req.user.customData.comic1 = currComic.dbID;
        req.user.save();
        res.send(currComic.dbID);
    });

});


router.put('/saveComic/:id', function (req, res, next) {
    var api = new ComicWebService();
    var data = req.body;

    var panel1 = new Panel(data['Panels']['Panel_1'].Title, data['Panels']['Panel_1'].Image_URL);
    var panel2 = new Panel(data['Panels']['Panel_2'].Title, data['Panels']['Panel_2'].Image_URL);
    var panel3 = new Panel(data['Panels']['Panel_3'].Title, data['Panels']['Panel_3'].Image_URL);
    var panel4 = new Panel(data['Panels']['Panel_4'].Title, data['Panels']['Panel_4'].Image_URL);
    var panel5 = new Panel(data['Panels']['Panel_5'].Title, data['Panels']['Panel_5'].Image_URL);
    var panel6 = new Panel(data['Panels']['Panel_6'].Title, data['Panels']['Panel_6'].Image_URL);
    var panel7 = new Panel(data['Panels']['Panel_7'].Title, data['Panels']['Panel_7'].Image_URL);
    var panel8 = new Panel(data['Panels']['Panel_8'].Title, data['Panels']['Panel_8'].Image_URL);
    var panel9 = new Panel(data['Panels']['Panel_9'].Title, data['Panels']['Panel_9'].Image_URL);


    var panels = [panel1, panel2, panel3, panel4, panel5, panel6, panel7, panel8, panel9];

    var contributors =
        [
            data['Contributors']['Contributor_1'],
            data['Contributors']['Contributor_2'],
            data['Contributors']['Contributor_3'],
            data['Contributors']['Contributor_4'],
            data['Contributors']['Contributor_5']
        ];

    var comic = new Comic(data['Title'], true, panels, contributors);
    comic.dbID = req.params.id;
    api.updateComic(comic, function (err:string, response:string, body:string) {
        res.send(JSON.stringify({Status : "Comic Saved"}));
    });

});



/* GET home page. */
router.get('/findUserEmail', function (req, res, next) {

    console.log(req.user.email);
    res.send(req.user.email.toString());
});

/* GET home page. */
router.get('/comicID', function (req, res, next) {

    console.log(req.user.customData.comic1);
    res.send(req.user.customData.comic1.toString());
});

// --------------------------------------------------
//                 RESTFUL API
//                   /comic
// --------------------------------------------------

// Retrieve ID of comic(s) associated with the user
router.get('/comic', function (req, res, next) {

    console.log(req.user.customData.comic1);
    res.send(req.user.customData.comic1.toString());
});



export = router;