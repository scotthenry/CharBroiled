
/// <reference path="../../typings/browser/ambient/jquery/jquery.d.ts"/>
/// <reference path="../../typings/main/ambient/request/request.d.ts" />
/// <reference path="../../typings/main/ambient/bootstrap-notify/bootstrap-notify.d.ts" />
/// <reference path="../../typings/main/ambient/dropzone/dropzone.d.ts" />
/**
 * Created by Trevor Jackson on 16-Feb-2016.
 */

/*
 *             Libraries Used Throughout typescripts.ts
 * dropzonejs - http://www.dropzonejs.com/
 * bootstrap-notify - http://bootstrap-notify.remabledesigns.com/
 * jquery - https://jquery.com/
 *
 * */

var myDrop;
var comicJSONObj;
var JSONObj;
var userType;
var currentLang = "";


// para: none
// Removes all thumbnails from the dropzone modal
// Called when modal is closed
// return: none
function clearDropzone(){
    myDrop.removeAllFiles();
}

// para: none
// Checks every click, if it is a click on a thumbnail in dropzone
// then change the modal url to the thumbnail's url
// return: none
$(document).on("click",".dz-details", function(){
    var cloudinary_URL = (<HTMLInputElement> document.getElementById("cloudinary_URL"));
    var panelURL = (<HTMLInputElement> document.getElementById("modalURL"));
    panelURL.value = cloudinary_URL.value;
});

// para: none
// Change the color of the Favourite Button. If yellow set to white,
// if white set to yellow.
// return: number; If Favourite button is now yellow return 1, if white return 0
function changeFavIcon():number{
    var Icon = (<HTMLSpanElement> document.getElementById("FavIcon"));

    if(Icon.style.color == "white"){
        Icon.className = "glyphicon glyphicon-star yellow";
        Icon.style.color = "yellow";
        return 1;
    } else {
        Icon.className = "glyphicon glyphicon-star white";
        Icon.style.color = 'white';
        return 0;
    }
}

// para: lang:string, a string representation of a language: en, es, de, it or fr
// Updates the Translate ComboBox to highlight the selected language
// return: void
function updateTransText(lang:string){
    var transName = (<HTMLInputElement> document.getElementById("t1"));
    transName.setAttribute("class", "");
    var transName = (<HTMLInputElement> document.getElementById("t2"));
    transName.setAttribute("class", "");
    var transName = (<HTMLInputElement> document.getElementById("t3"));
    transName.setAttribute("class", "");
    var transName = (<HTMLInputElement> document.getElementById("t4"));
    transName.setAttribute("class", "");
    var transName = (<HTMLInputElement> document.getElementById("t5"));
    transName.setAttribute("class", "");

    if (lang == "en")
    { var transName = (<HTMLInputElement> document.getElementById("t1"));
        transName.setAttribute("class", "active");

    } else if (lang == "fr") {
        var transName = (<HTMLInputElement> document.getElementById("t2"));
        transName.setAttribute("class", "active");

    } else if (lang == "es") {
        var transName = (<HTMLInputElement> document.getElementById("t3"));
        transName.setAttribute("class", "active");

    } else if (lang == "de") {
        var transName = (<HTMLInputElement> document.getElementById("t4"));
        transName.setAttribute("class", "active");

    } else if (lang == "it") {
        var transName = (<HTMLInputElement> document.getElementById("t5"));
        transName.setAttribute("class", "active");

    }
}

// para: language code: en, fr, it, de, es
// Translate the comic from it's current langauge into the one specified in lang
// Update the comic the user is seeing to reflect the translation
// return: void
function translateComic(lang: string){

    var translateBtn = (<HTMLButtonElement> document.getElementById("translateButton"));
    translateBtn.disabled = true;

    var comicTitle = (<HTMLInputElement> document.getElementById("comicTitle")).value;
    var panelsJSON = comicJSONObj["Panels"];

    updateTransText(lang);

    var texts = new Array();
    texts.push(comicTitle);

    // for each panel given, get desc
    for(var i=1; i<lengthJSON(panelsJSON); i++) {

        if(comicJSONObj["Panels"]["Panel_"+i].Text != "") {
            texts.push(comicJSONObj["Panels"]["Panel_" + i].Text);
        }
    }


    var translateComic = {
        "Text": texts,
        "ToLang": lang,
        "FromLang": currentLang,
    };
    console.log(currentLang);
    console.log(lang);



    var txt = JSON.stringify(translateComic);

    notifyUser("Translating Comic", 'glyphicon glyphicon-retweet', "info");

    $.ajax({
        type: "PUT",
        url: "/translate",
        contentType: "application/json; charset=utf-8",
        data: txt,
        async: true,
        dataType: 'json',
        timeout: 4000,
        success: function (data) {
            currentLang = lang;
            var title = (<HTMLInputElement> document.getElementById("comicTitle"));
            title.value = data[0];

            // for each panel given, set desc
            for(var i=1; i<data.length; i++) {
                (<HTMLInputElement> document.getElementById("desc_"+i)).textContent = data[i];
                comicJSONObj["Panels"]["Panel_"+i].Text = data[i];
            }

            notifyUser("Comic Successfully Translated", 'glyphicon glyphicon-ok', "success");
            translateBtn.disabled = false;
        },
        error: function (xhr, status, thrownError) {
            console.log(xhr);
            notifyUser("Error: Retry Translating Comic", 'glyphicon glyphicon-remove', "danger");
            translateBtn.disabled = false;
        }
    });
}

// para: msg - Message to be displayed to user
//      icon - the name of a glyphicon icon from bootstrap
//      type - a valid type from bootstrap eg danger, success, info
// Displays a notification to the user
// return: void
function notifyUser(msg:string, icon:string, type:string){
    var note = $.notify({
        // options
        icon: icon,
        title: '',
        message: msg,
        url: '',
        target: '_blank'
    },{
        // settings
        element: 'body',
        position: null,
        type: type,
        allow_dismiss: true,
        newest_on_top: false,
        showProgressbar: false,
        placement: {
            from: "top",
            align: "right"
        },
        offset: 20,
        spacing: 10,
        z_index: 1031,
        delay: 5000,
        timer: 1000,
        url_target: '_blank',
        mouse_over: null,
        animate: {
            enter: 'animated fadeInDown',
            exit: 'animated fadeOutUp'
        },
        onShow: null,
        onShown: null,
        onClose: null,
        onClosed: null,
        icon_type: 'class',
        template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
        '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
        '<span data-notify="icon"></span> ' +
        '<span data-notify="title">{1}</span> ' +
        '<span data-notify="message">{2}</span>' +
        '<div class="progress" data-notify="progressbar">' +
        '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
        '</div>' +
        '<a href="{3}" target="{4}" data-notify="url"></a>' +
        '</div>'
    });
}


// para: none
// Check if the comic is currently set as a favourite of the user.
// GET request retrieves list of favourite comics of the user, goes through list
// and sees if current comic is on list. If comic is a favourite set the Favourite
// button icon to yellow.
// return: none
function amIFavourite() {
    var comicID = (<HTMLInputElement> document.getElementById("comicID"));
    var Icon = (<HTMLSpanElement> document.getElementById("FavIcon"));

    $.get('/user/fav/ids', function (data) {
        var favs:Array<string>;
        favs = JSON.parse(data);
        for(var i = 0; i < favs.length; i++){
            if (favs[i] == comicID.value){
                Icon.className = "glyphicon glyphicon-star yellow";
                Icon.style.color = "yellow";
            }
        }
    });
}

// para: none
// Configure Dropzone library and associate it with the modal.
// Set up limitations: 5MB max, 1 file, jpg/gif/png format only
// return: none
function initDropzone(){
    Dropzone.autoDiscover = false;
    myDrop = new Dropzone('#demoUpload', {
        acceptedFiles: ".jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.png,.PNG",
        maxFiles: 1,
        maxFilesize: 5,
        method: "post",
        url: "/image"
    })

    myDrop.on('success', function(file, data){

        if (data == "Error Uploading Image"){
            notifyUser(data, 'glyphicon glyphicon-ok', "danger");

        } else {
            // Do something with url
            var url = data.toString();

            var cloudinary_URL = (<HTMLInputElement> document.getElementById("cloudinary_URL"));
            var panelURL = (<HTMLInputElement> document.getElementById("modalURL"));
            panelURL.value = url;
            cloudinary_URL.value = url;
            notifyUser("Image Upload Successful", 'glyphicon glyphicon-ok', "success");
        }

    });
}

// para: elementID of pictureContainer, array of urls for pictures' source
// creates img element for each url and add to given pictureContainer.
// return: none
function renderPictures(elId, urls) {
    var el = (<HTMLInputElement> document.getElementById(elId));

    for (var i = 0; i < urls.length; i++) {
        var img = document.createElement("img");
        img.src = urls[i];
        img.style.height = "300px";
        img.style.width = "300px";
        el.appendChild(img);
    }
}

// para: none
// sends GET request to get user's email. Sets value of userEmail element.
// return: none
function setUserEmail() {
    var ID = (<HTMLInputElement> document.getElementById("userEmail"));
    var userEmail = (<HTMLInputElement> document.getElementById("userEmail2"));

    $.get('/user/email', function (data) {
        ID.value = data.toString();
    });
}

// para: none
// sends GET request to get user's email. Sets value of userEmail element.
// return: none
function setUserEmails() {
    var ID = (<HTMLInputElement> document.getElementById("userEmail"));

    $.get('/user/email', function (data) {
        ID.value = data.toString();
    });
}

// para: none
// sets the Welcome message on the Account page with the name of the User
// return: none
function setUserName(){
    var userName = (<HTMLInputElement> document.getElementById("welcomeMessage"));

    $.get('/user/name', function (data) {
        userName.textContent = "Welcome "+data.toString()+" to our Comic Maker!";
    });}

// para: none
// sends GET request to get user's type. Sets value of userType element.
// return: none
function setUserType() {
    $.get('/user/type', function (data) {
        userType = data.toString();
    });
}

// para: none
// sends GET request to get user's type. Sets value of userType element. Renders comic after.
// return: none
function setUserTypeAndRender(id: string) {
    $.get('/user/type', function (data) {
        userType = data.toString();
        renderEditComic(id);
    });
}

// para: none
// parses the id param from URL, creates input field and sets value to the id param's value.
// return: none
function setComicID() {
    var comicID = getURLParameterByName("id");
    var ID = (<HTMLInputElement> document.getElementById("comicID"));

    ID.value = comicID;
    return comicID;
}

// para: id for comic to get
// sends GET request to get comic JSON object. Sets value of comicStr element.
// renders comic onto page.
// return: none
function renderEditComic(id: string) {
    var hiddenString = (<HTMLInputElement> document.getElementById("comicStr"));
    var comicStr;

    $.get('/comic/' + id, function (data) {

        comicJSONObj = JSON.parse(data);
        var comicTitle = (<HTMLInputElement>  document.getElementById("comicTitle"));
        comicTitle.value = comicJSONObj.Title;

        var publicPrivate = (<HTMLInputElement>  document.getElementById("optradio"));

        if (comicJSONObj.Public) {
            var publicPrivate = (<HTMLInputElement>  document.getElementById("publicBtn"));
            publicPrivate.checked = true;
        } else {
            var publicPrivate = (<HTMLInputElement>  document.getElementById("privateBtn"));
            publicPrivate.checked = true;
        }

        renderPanels("pictureContainer", comicJSONObj.Panels, true);

        addComicToUser();
        addUserToComic();
        renderContributors(comicJSONObj);
    });
}

// para: id for comic to get
// sends GET request to get comic JSON object. Sets value of comicStr element.
// renders comic onto page.
// return: none
function renderViewComic(id: string) {
    var hiddenString = (<HTMLInputElement> document.getElementById("comicStr"));
    var comicStr;

    $.get('/comic/' + id, function (data) {
        comicJSONObj = JSON.parse(data);
        var comicTitle = (<HTMLInputElement>  document.getElementById("comicTitle"));
        if (comicJSONObj.Public) {
            comicTitle.value = comicJSONObj.Title;

            //console.log(comicJSONObj.Panels);
            renderContributors(comicJSONObj);
            renderPanels("pictureContainer", comicJSONObj.Panels, false);
        } else {
            comicTitle.value = "This comic is private.";
        }
        addComicToViewed();
    });
}

// para: string id of parameter to parse
// parses the value of the specified param
// return: string value of the specified param
function getURLParameterByName(name: string) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// para: none
// PUT request to save the comicJSONObj to the server
// return: none
function saveComic(notify: boolean){
    var comicID = (<HTMLInputElement> document.getElementById("comicID"));
    var newTitle = (<HTMLInputElement> document.getElementById("comicTitle"));
    comicJSONObj.Title = newTitle.value;

    var publicPrivate = (<HTMLInputElement> document.getElementById("publicBtn"));
    if (publicPrivate.checked == true){
        comicJSONObj.Public = true;
    } else {
        comicJSONObj.Public = false;
    }

    var comic = JSON.stringify(comicJSONObj);
    $.ajax({
        type: "PUT",
        url: "/comic/" + comicID.value,
        contentType: "application/json; charset=utf-8",
        data: comic,
        async: true,
        dataType: 'json',
        timeout: 4000,
        success: function (data) {

            if(notify) {
                notifyUser(data.Status, 'glyphicon glyphicon-ok', "success");
            }
        },
        error: function (xhr, status, thrownError) {
            notifyUser('ERROR - Comic Could Not Be Saved', 'glyphicon glyphicon-remove', 'danger');
        }
    });
}

// para: none
// POST request to create new comic
// return: none
function newComic() {
    var el = (<HTMLInputElement> document.getElementById("NewComicbtn"));

    $.ajax({
        type: "POST",
        url: "/comic",
        async: true,
        timeout: 4000,
        dataType: 'json',
        success: function (data) {
            window.location.replace("/edit?id=" + data.ComicID);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            notifyUser("ERROR - Could Not Create New Comic", 'glyphicon glyphicon-remove', "danger");

        }
    });
}

// para: elementID of panel container, JSON object of panels, bool: true = edit mode and false = view mode
// creates panels and adds them to the element corresponding to the given id
// return: none
function renderPanels(elId: string, jsonPanels: JSON, edit:boolean) {
    var el = document.getElementById(elId);
    var panels = jsonPanels;
    var length = lengthJSON(panels);
    var url = panels['Panel_1'].Image_URL;
    var desc = panels['Panel_1'].Text;

    if((url != "" || desc != "") && (countPanels() == 1)) { // if only 1 panel...
        createPanel(url, desc, "1", edit, "both", el);
    } else {
        for (var i = 1; i <= length; i++) { // for multiple panels...
            url = panels['Panel_' + i].Image_URL;
            desc = panels['Panel_' + i].Text;

            if (url != "" || desc != "") {
                if (i == 1) { // don't render "Swap Left" button
                    createPanel(url, desc, i.toString(), edit, "left", el);
                } else if (i == countPanels()) { // don't render "Swap Right" button
                    createPanel(url, desc, i.toString(), edit, "right", el);
                } else {
                    createPanel(url, desc, i.toString(), edit, "", el);
                }
            }
        }
    }
}

// para: elementID of panel container, JSON object of panels, bool: true = edit mode and false = view mode
// deletes all panels and rerenders them
// return: none
function rerenderPanels(elId: string, jsonPanels: JSON, edit:boolean) {
    // delete the panels
    removeNodeList(document.getElementById("pictureContainer").children);

    // re-render the panels
    renderPanels("pictureContainer", comicJSONObj["Panels"], true);
}

// para: url, text, and number for panel, boolean for "edit" panel, omission = which swap buttons to omit,
// and an Element to put the panel in
// Creates the panel element based of off inputs and adds it to given parent element.
// return: none
function createPanel(url: string, desc: string, numStr: string, edit: boolean, omission: string, container: Element) {
    var panel = document.createElement("div");
    panel.className = "col-md-4";
    panel.className += " panel";
    panel.id = "panel_" + numStr;

    var thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail";
    thumbnail.appendChild(document.createTextNode("\u00A0")); // adds &nbsp
    panel.appendChild(thumbnail);

    var img = document.createElement("img");
    img.alt = "Bootstrap Thumbnail First";
    img.src = url;
    img.id = "panelImg_" + numStr;
    img.style.height = "300px";
    img.style.width = "300px";
    thumbnail.appendChild(img);

    var caption = document.createElement("div");
    caption.className = "caption";
    thumbnail.appendChild(caption);

    var par1 = document.createElement("p");
    par1.innerHTML = desc;
    par1.id = "desc_" + numStr;
    caption.appendChild(par1);

    var par2 = document.createElement("p");
    caption.appendChild(par2);

    var butDiv = document.createElement("div");
    butDiv.className = "btn-group pull-center";
    par2.appendChild(butDiv);

    if (edit) {
        if((omission != "left" ) && (omission != "both")) {
            // create "Swap Left" button
            var button1 = document.createElement("button");
            button1.id = "buttonSwapL_" + numStr;
            button1.className = "btn btn-default";
            button1.setAttribute("type", "button");
            button1.setAttribute("role", "button");
            button1.setAttribute("onclick", "swapPanelLeft(this)");

            var em1 = document.createElement("em");
            em1.className = "glyphicon glyphicon-chevron-left";
            em1.textContent = "Left";

            button1.appendChild(em1);
        }

        // create " Edit Panel" button
        var button2 = document.createElement("button");
        button2.id = "button_" + numStr;
        button2.className = "btn btn-default";
        button2.setAttribute("data-toggle", "modal");
        button2.setAttribute("type", "button");
        button2.setAttribute("role", "button");
        button2.setAttribute("href", "#modal-container-94539");
        button2.setAttribute("onclick", "updateModal(this)");

        var em2 = document.createElement("em");
        em2.className = "glyphicon glyphicon-pencil";
        em2.textContent = "Edit";

        button2.appendChild(em2);

        if((omission != "right" ) && (omission != "both")) {
            // create "Swap Right" button
            var button3 = document.createElement("button");
            button3.id = "buttonSwapR_" + numStr;
            button3.className = "btn btn-default";
            button3.setAttribute("type", "button");
            button3.setAttribute("role", "button");
            button3.setAttribute("onclick", "swapPanelRight(this)");

            var em3 = document.createElement("em");
            em3.className = "glyphicon glyphicon-chevron-right";
            em3.textContent = "Right";

            button3.appendChild(em3);
        }

        // create "Delete Panel" button
        var button4 = document.createElement("button");
        button4.id = "buttonRem_" + numStr;
        button4.className = "btn btn-default pull-right";
        button4.textContent = "Delete";
        button4.setAttribute("type", "button");
        button4.setAttribute("role", "button");
        button4.setAttribute("onclick", "removePanel(this)");

        var span4 = document.createElement("span");
        span4.className = "glyphicon glyphicon-trash";
        span4.setAttribute("aria-hidden", "true");

        button4.appendChild(span4);

        // buttons are held within a "div" element
        if((omission != "left") && (omission != "both")) {
            butDiv.appendChild(button1);
        }
        if((omission != "right") && (omission != "both")) {
            butDiv.appendChild(button3);
        }
        butDiv.appendChild(button2);
        par2.appendChild(button4);
    }
    container.appendChild(panel);
}

// para: JSON object to evaluate
// counts the number of properties/fields in the given object
// return: number of fields in given JSON object
function lengthJSON(json: JSON) {
    var count = 0;
    var i;

    for (i in json) {
        if (json.hasOwnProperty(i)) {
            count++;
        }
    }
    return count;
}

// para: button element
// extracts number from button element and updates the Modal with the appropriate info
// return: none
function updateModal(ele) {
    var button = (<HTMLInputElement>  document.getElementById(ele.id));
    var num = button.id.substring(7);  // gets panel number = button number
    var img = (<HTMLInputElement>  document.getElementById("panelImg_" + num));
    var desc = ( document.getElementById("desc_" + num).innerHTML);
    var urlEle = (<HTMLInputElement> document.getElementById("modalURL"));
    var descEle = (<HTMLInputElement>  document.getElementById("modalDesc"));
    var hiddenInput = (<HTMLInputElement> document.getElementById("panelNum"));
    var hiddenCloudinary = (<HTMLInputElement> document.getElementById("cloudinary_database"));

    hiddenInput.value = num;
    urlEle.value = img.getAttribute("src");

    if(urlEle.value.indexOf("cloudinary.com") > -1){
        hiddenCloudinary.value = urlEle.value;
    } else {
        hiddenCloudinary.value = "";
    }
    descEle.value = desc;
}

// para: none
// creates default panal and adds to
// return: none
function addPanel() {
    var i = document.getElementsByClassName("panel").length;
    var numStr = (i+1).toString();

    if (i > 8){
        notifyUser('Only 9 Panels are Allowed in a Comic', 'glyphicon glyphicon-remove', "danger");

    } else {
        var url = "http://strategyjournal.ru/wp-content/themes/strategy/img/default-image.jpg";
        var desc = "enter text here";
        var el = document.getElementById("pictureContainer");

        //createPanel(url, desc, numStr, true, el);

        // update comicJSONObj and save
        comicJSONObj["Panels"]["Panel_"+numStr].Image_URL = url;
        comicJSONObj["Panels"]["Panel_"+numStr].Text = desc;

        rerenderPanels("pictureContainer", comicJSONObj["Panels"], true);

        saveComic(true);
    }
}

// para: none
// Checks the cloudinary_database element, if the url present there doesn't match the modalURL
// then delete tell cloudinary to delete the image at the cloudinary_database url.
// return: none
function cleanUpCloudinary(){
    var cloud = (<HTMLInputElement>  document.getElementById("cloudinary_database")).value;
    var modal = (<HTMLInputElement>  document.getElementById("modalURL")).value;

    if(cloud.toString() != modal.toString() && cloud.toString() != ("" || undefined)){
        var pattern = /[\w\d]+\.jpg/;

        var cloudPattern = new RegExp ('res.cloudinary.com');
        var cloud_occurance = modal.search(cloudPattern);

        if (cloud_occurance < 1){
            var id = pattern.exec(cloud)[0];

            if (id != null){
                id = id.toString().replace('.jpg', '');
            }

            $.ajax({
                type: "DELETE",
                url: "/image/" + id,
                async: true,
                dataType: 'json',
                timeout: 4000,
                error: function (xhr, status, thrownError) {

                }
            });
        }
    }
}

// para: none
// removes the HTML element of the last panel, updates comicJSONObj accordingly, saves Comic
// return: none
function removePanel(ele: Element) {
    var i = Number(ele.id.substring(10)); // id is of form: "buttonRem_#"
    var count = countPanels();

    if (i > 0) { // just being safe
        var id = "panel_"+i;

        for(var j=i; j<count; j++) { // 9 is max number of panels
            // shift all panels down one slot in the comicJSONObj
            comicJSONObj['Panels']["Panel_"+j].Image_URL = comicJSONObj['Panels']["Panel_"+(j+1)].Image_URL;
            comicJSONObj['Panels']["Panel_"+j].Text = comicJSONObj['Panels']["Panel_"+(j+1)].Text;
        }
        comicJSONObj['Panels']["Panel_"+count].Image_URL = "";
        comicJSONObj['Panels']["Panel_"+count].Text = "";

        rerenderPanels("pictureContainer", comicJSONObj["Panels"], true);

        saveComic(true);
    } else {
        notifyUser('There Are No Panels To Remove', 'glyphicon glyphicon-remove', "danger");

    }
}

// para: none
// swaps the panel with the panel one index larger than it.
// return: number of panels in use in comicJSONObj
function swapPanelRight(ele: Element) {
    var num = Number(ele.id.substring(12)); // id is of form: "buttonSwapR_#"
    var count = countPanels();
    if(num < count) { // can't swap the rightmost panel!
        var tempURL = comicJSONObj["Panels"]["Panel_" + num].Image_URL;
        var tempText = comicJSONObj["Panels"]["Panel_" + num].Text;

        // set given ele to larger index ele
        comicJSONObj["Panels"]["Panel_" + num].Image_URL = comicJSONObj["Panels"]["Panel_" + (num + 1)].Image_URL;
        comicJSONObj["Panels"]["Panel_" + num].Text = comicJSONObj["Panels"]["Panel_" + (num + 1)].Text;

        // set larger index ele with given ele
        comicJSONObj["Panels"]["Panel_" + (num + 1)].Image_URL = tempURL;
        comicJSONObj["Panels"]["Panel_" + (num + 1)].Text = tempText;

        rerenderPanels("pictureContainer", comicJSONObj["Panels"], true);

        saveComic(false);
    }
}

// para: none
// swaps the panel with the panel one index smaller than it.
// return: number of panels in use in comicJSONObj
function swapPanelLeft(ele: Element) {
    var num = Number(ele.id.substring(12)); // id is of form: "buttonSwapR_#"
    if(num > 1) { // can't swap the leftmost panel!
        var tempURL = comicJSONObj["Panels"]["Panel_" + num].Image_URL;
        var tempText = comicJSONObj["Panels"]["Panel_" + num].Text;

        // set given ele to larger index ele
        comicJSONObj["Panels"]["Panel_" + num].Image_URL = comicJSONObj["Panels"]["Panel_" + (num - 1)].Image_URL;
        comicJSONObj["Panels"]["Panel_" + num].Text = comicJSONObj["Panels"]["Panel_" + (num - 1)].Text;

        // set larger index ele with given ele
        comicJSONObj["Panels"]["Panel_" + (num - 1)].Image_URL = tempURL;
        comicJSONObj["Panels"]["Panel_" + (num - 1)].Text = tempText;

        rerenderPanels("pictureContainer", comicJSONObj["Panels"], true);

        saveComic(false);
    }
}

// para: none
// iterates through panels in comicJSONObj and counts panels in use
// return: number of panels in use in comicJSONObj
function countPanels() {
    var panels = comicJSONObj.Panels;
    var count = 0;
    for(var i=1; i<=9; i++) {
        var url = panels['Panel_'+i].Image_URL;
        var desc = panels['Panel_'+i].Text;
        if(url != "" || desc != "") { // if panel is in use
            //alert(url + " " + desc);
            count++;
        } // don't add else since order of traversal is unknown/not reliable
        // ie you MUST iterate through all of panels to get true count
    }
    return count;
}

// para: none
// updates/changes the panel url and text when the modal applys changes
// return: none
function updatePanel(elId) {

    var url = (<HTMLInputElement>  document.getElementById("modalURL")).value;
    var desc = (<HTMLInputElement> document.getElementById("modalDesc")).value;

    var numStr = (<HTMLInputElement>  document.getElementById("panelNum")).value;
    var panelImg = (<HTMLImageElement> document.getElementById("panelImg_" + numStr));
    panelImg.src = url;

    (<HTMLInputElement>  document.getElementById("desc_" + numStr)).innerHTML = desc;
    comicJSONObj["Panels"]["Panel_"+numStr].Image_URL = url;
    comicJSONObj["Panels"]["Panel_"+numStr].Text = desc;
    saveComic(true);
}

// para: none
// Uses the id parameter in the url to redirect the user to the edit page of the comic
// with that id
// return: none
function paramToEditComic(){
    var id = getURLParameterByName("id");
    window.location.replace("/edit?id=" + id);

}

// para: none
// Uses the id parameter in the url to redirect the user to the view page of the comic
// with that id
// return: none
function paramToViewComic(){
    var id = getURLParameterByName("id");
    window.location.replace("/view?id=" + id);
}

// para: none
// Sends user to /account
// return: none
function gotoAccount(){
            window.location.replace("/account");
}

// para: element to be removed
// removes given element
// return: none
function removeElement(doc:Element): void{
    doc.parentElement.removeChild(doc);
}

// para: NodeList of items to be removed
// loops through given list and removes each element
// return: none
function removeNodeList(doc:NodeList): void{
    for(var i = doc.length - 1; i >= 0; i--) {
        if(doc[i] && doc[i].parentElement) {
            doc[i].parentElement.removeChild(doc[i]);
        }
    }
}

// para: HTMLCollection of items to be removed
// loops through given collection and removes each element
// return: none
function removeHTMLCollection(doc:HTMLCollection): void{
    for(var i = doc.length - 1; i >= 0; i--) {
        if(doc[i] && doc[i].parentElement) {
            doc[i].parentElement.removeChild(doc[i]);
        }
    }
}

// para: none
// Used on the View Page to hide the Edit button from a Viewer
// Does a GET request to check what type the user is, if Viewer
// Then remove the Edit button
// return: none
function checkIfViewer(){
    $.get('/user/type', function (data) {

        if(data.toString() == "Viewer"){
            var id = (<HTMLAnchorElement>  document.getElementById("Edit-Button"));
            id.remove();
        }
    });
}

// para: none
// Changes the color of the Favourite button, send PUT request to server with indication
// of whether to add or remove the given comic ID to the Favourite list kept on the Server
// return: none
function saveFavourites() {
    var id = (<HTMLInputElement>  document.getElementById("comicID")).value;
    var btn = (<HTMLButtonElement>  document.getElementById("FavouriteButton"));
    btn.disabled = true;

    // return: 1 = Icon is yellow (favourite); 0 = Icon is white (not a favourite)
    var color = changeFavIcon();

    var favouriteComic = {
        "favourite": id,
        "action": color,
    };

    var fav = JSON.stringify(favouriteComic);

    $.ajax({
        type: "PUT",
        url: "/user/fav/ids",
        contentType: "application/json; charset=utf-8",
        data: fav,
        async: true,
        dataType: 'json',
        timeout: 5000,
        success: function (data) {
            notifyUser(data.Status, 'glyphicon glyphicon-ok', "success");
            btn.disabled = false;
            amIFavourite();
        },
        error: function (xhr, status, thrownError) {
        notifyUser('ERROR - Favourite Not Saved', "glyphicon glyphicon-remove", "danger");
            btn.disabled = false;
            amIFavourite();
        }
    });
}

// para: id of favourites container
// renders thumbnails inside the container corresponding to the given id for the view page
// return: none
function renderViewFavourites(id: string): void {
    getAndRenderThumbnails(id, "fav", "view");
}

// para: id of favourites container
// renders thumbnails inside the container corresponding to the given id for the edit page
// return: none
function renderEditFavourites(id: string): void {
    getAndRenderThumbnails(id, "fav", "edit");
}

// para: id of contributed container
// renders thumbnails inside the container corresponding to the given id for the edit page
// return: none
function renderContributed(id: string): void {
    getAndRenderThumbnails(id, "contributed", "edit");
}

// para: id of favourites container
// renders thumbnails inside the container corresponding to the given id for the view page
// return: none
function renderViewRecentlyViewed(id: string): void {
    getAndRenderThumbnails(id, "viewed", "view");
}

// para: id of favourites container
// renders thumbnails inside the container corresponding to the given id for the edit page
// return: none
function renderEditRecentlyViewed(id: string): void {
    getAndRenderThumbnails(id, "viewed", "edit");
}

// para: none
// Delete a comic in the database then redirect user to the account page.
// return: none
function deleteComic(){
    var id = (<HTMLInputElement> document.getElementById("comicID")).value;

    $.ajax({
        type: "DELETE",
        url: "/comic/" + id,
        async: true,
        dataType: 'json',
        timeout: 4000,
        error: function (xhr, status, thrownError) {
        notifyUser('ERROR - Could Not Delete Comic', 'glyphicon glyphicon-remove', "danger");
        }
    });

    window.location.replace("/account");
}

// para: id of container to put elements in, string of thumbnail type (type == 'contributed' || 'fav' || 'searchRes')
// creates fav/contributed thumbnails in the given container corresponding to the given id
// return: none
function getAndRenderThumbnails(id: string, type: string, page: string): void {
    // returns list of comic JSON objects
    $.get('/user/'+type, function (data) {  // (type == 'cont' || 'fav')
        //JSONObj = JSON.parse(data); data is parsed in helper
        renderThumbnails(id, type, page, data);
    });
}

// para: id of container to put elements in, string of thumbnail type (type == 'contributed' || 'fav' || 'searchRes'),
// string for which page to link, string of JSON object which is an array of comic objects
// creates fav/contributed/search thumbnails in the given container corresponding to the given id
// return: none
function renderThumbnails(id: string, type: string, page: string, comics: string) {
    var container = (<HTMLInputElement>  document.getElementById(id));

    JSONObj = JSON.parse(comics);

    var length = lengthJSON(JSONObj);
    for (var i = 0; i < length; i++) { // for each cont comic

        var title = JSONObj[i].Title;
        var url = JSONObj[i].Panels.Panel_1.Image_URL;
        var desc = JSONObj[i].Panels.Panel_1.Text;

        if (url != "" || desc != "") { // if panel is not empty
            var thumbnail = document.createElement("div");
            thumbnail.className = "thumbnail";
            thumbnail.className += " " + type;
            thumbnail.id = type + "_" + (i+1).toString();

            var caption = document.createElement("div");
            caption.className = "caption";

            var img = document.createElement("img");
            img.className = "img-responsive";
            img.src = url;
            img.width = 100;
            img.style.cssFloat = "right";
            caption.appendChild(img);

            var h3 = document.createElement("h3");
            h3.innerHTML = title;
            caption.appendChild(h3);

            var p1 = document.createElement("p");

            var first = true;
            for(var j=1; j<=5; j++) {  // 5 = max number of contributors
                if(JSONObj[i].Contributors['Contributor_' + j]) { // if contributor is defined
                    if (first) {
                        p1.innerHTML = "Contributors: " + JSONObj[i].Contributors['Contributor_' + j];
                        first = false;
                    } else {
                        p1.innerHTML += ", " + JSONObj[i].Contributors['Contributor_' + j];
                    }
                }
            }

            caption.appendChild(p1);

            var p2 = document.createElement("p");
            var a2 = document.createElement("a");
            a2.className = "btn btn-primary";
            a2.href = "/"+page+"?id=" + JSONObj[i]._id;
            if(page == "edit") {
                a2.innerHTML = "Edit";

                var a3 = document.createElement("a");
                a3.style.marginRight = "15px";
                a3.className = "btn btn-primary";
                a3.href = "/view?id=" + JSONObj[i]._id;
                a3.innerHTML = "View";
                p2.appendChild(a3);
            } else {
                a2.innerHTML = "View";
            }
            p2.appendChild(a2);
            caption.appendChild(p2);

            thumbnail.appendChild(caption);
        }
        container.appendChild(thumbnail);
    }
}

// para: comicJSON object
// Adds names of contributors to the drop-down bar for edit and view page
// return: none
function renderContributors(json: JSON){
    var container = (<HTMLInputElement> document.getElementById("contributors"));
    for (var i = 1; i<= 5; i++){
        var contributor = json["Contributors"]["Contributor_" + i];
        if(contributor != "") { // don't render an empty li
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.id = "C" + i;
            a.innerHTML = contributor;
            a.href = "#";
            li.appendChild(a);
            container.appendChild(li);
        }
    }
}

// para: comicJSON object
// Adds the UserID to the comic object(MongoDB) unless they are already a contributor
// return: none
function addUserToComic(){
    var currcontrib = (<HTMLInputElement>  document.getElementById("userEmail")).value;
    var contains = false;
    for(var i=1; i<=5; i++) {  // max number of contributors
        if(comicJSONObj["Contributors"]["Contributor_"+i.toString()] == currcontrib) {
            contains = true;
        }
    }
    if (!contains) {
        for (var i = 1; i<= 5; i++) {  // max number of contributors
            var cname = "Contributor_" + i;
            var thiscontrib = comicJSONObj["Contributors"][cname];
            if (thiscontrib != currcontrib && thiscontrib == "") {
                comicJSONObj["Contributors"][cname] = currcontrib;
                saveComic(false);
                break;
            }
        }
    }
}


// NEEDS TO BE IMPROVED
// para: none
// Attempts to determine if a photo on the cloudinary database is no longer being used, if so
// delete the unused image.
// return: none
function removeUnusedPhoto(){
    var cloudinary_url = (<HTMLInputElement>  document.getElementById("cloudinary_URL")).value;
    var modal_url = (<HTMLInputElement>  document.getElementById("modalURL")).value;

    if(cloudinary_url.toString() != modal_url.toString() && cloudinary_url.toString() != ("" || undefined)){
        var pattern = /[\w\d]+\.jpg/;
            var id = pattern.exec(cloudinary_url)[0];

            if (id != null){
                id = id.toString().replace('.jpg', '');
            }

            $.ajax({
                type: "DELETE",
                url: "/image/" + id,
                async: true,
                dataType: 'json',
                timeout: 4000,
                error: function (xhr, status, thrownError) {
                }
            });
        }
}

// para: none
// Adds the comicID to the user object(Mongo User DB)
// return: none
function addComicToUser() {
    var id = (<HTMLInputElement>  document.getElementById("comicID")).value;

    var conComic = {
        "comicID": id,
    };

    var comicPut = JSON.stringify(conComic);

    $.ajax({
        type: "PUT",
        url: "/user/contributed",
        contentType: "application/json; charset=utf-8",
        data: comicPut,
        async: true,
        timeout: 4000,
        dataType: 'json',
        error: function (xhr, ajaxOptions, thrownError) {
        }
    });
}

// para: none
// Adds the comicID to the 'viewed' field in the user object(StormPath)
// return: none
function addComicToViewed() {
    var id = (<HTMLInputElement>  document.getElementById("comicID")).value;

    var conComic = {
        "comicID": id,
    };

    var comicPut = JSON.stringify(conComic);

    $.ajax({
        type: "PUT",
        url: "/user/viewed",
        contentType: "application/json; charset=utf-8",
        data: comicPut,
        async: true,
        timeout: 4000,
        dataType: 'json',
        error: function (xhr, ajaxOptions, thrownError) {
        }
    });
}

// para: none
// runs a search on comics after clicking "Search Comic" on search.html
// return: none
function comicSearch() {
    //var comicID = (<HTMLInputElement> document.getElementById("comicID"));
    var query = (<HTMLInputElement> document.getElementById("searchQuery")).value;
    var cquery = {"comicQuery":query};
    notifyUser('Searching Through Comics', 'glyphicon glyphicon-retweet', "info");

    $.ajax({
        type: "GET",
        url: "/search/text",
        contentType: "application/json; charset=utf-8",
        data: cquery,
        async: true,
        timeout: 4000,
        dataType: 'json',
        success: function(data) {
            renderSearchResults("searchResContainer", JSON.stringify(data), userType);
            notifyUser('Showing Search Results', 'glyphicon glyphicon-ok', "success");
        },
        error: function (xhr, ajaxOptions, thrownError) {
            notifyUser('Error: Retry Search', 'glyphicon glyphicon-remove', "danger");
        }
    });
}

// para: none
// runs a search on comics after clicking "Search Contributor" on search.htm
// return: none
function contribSearch() {
    var query = (<HTMLInputElement> document.getElementById("searchQuery")).value;
    var cquery = {"contribQuery":query};
    notifyUser('Searching Through Users', 'glyphicon glyphicon-retweet', "info");
    $.ajax({
        type:"GET",
        url: "/search/contributor",
        contentType: "application/json; charset=utf-8",
        data: cquery,
        async: true,
        timeout: 4000,
        dataType: 'json',
        success: function(data) {
            renderSearchResults("searchResContainer", JSON.stringify(data), userType);
            notifyUser('Showing Search Results', 'glyphicon glyphicon-ok', "success");
        },
        error: function (xhr, ajaxOptions, thrownError) {
            notifyUser('Error: Retry Search', 'glyphicon glyphicon-remove', "danger");
        }
    });
}

// para: array of strings where each string is a JSON comic object, id of container ele.
// and the string representation of userType
// renders the given search results as thumbnails under the element corresponding to the given id.
// return: none
function renderSearchResults(id: string, comics: string, uType: string) {
    // delete previous search results
    removeNodeList(document.getElementById(id).children);
    if ((comics == "{}") || (comics == "[]")) {
        var container = (<HTMLInputElement>  document.getElementById(id));

        var thumbnail = document.createElement("div");
        thumbnail.className = "thumbnail";

        var caption = document.createElement("div");
        caption.className = "caption";

        var h5 = document.createElement("h5");
        h5.innerHTML = "No search results found.";
        caption.appendChild(h5);

        thumbnail.appendChild(caption);
        container.appendChild(thumbnail);

    } else if(uType == "Contributor") {
        renderThumbnails(id, "searchRes", "edit", comics);
    } else {
        renderThumbnails(id, "searchRes", "view", comics);
    }
}

// para: string translated title, string JSON array where each element is a panel translated description.
// updates the rendered view of the comic to use the translated text.
// return: none
function renderLanguage(title: string, panels: string) {
    var panelsJSON = JSON.parse(panels);
    var id = (<HTMLInputElement>  document.getElementById("comicTitle"));
    id.value = title;

    // for each panel given, update the desc
    for(var i=1; i<lengthJSON(panelsJSON); i++) {
        document.getElementById("desc_"+i).textContent = panelsJSON[i];
    }
}

// para: none
// checks if URL parameters are set and calls a search if necesasrry.
// return: none
function checkSearchQuery() {
    var query = getURLParameterByName("searchQuery");
    var type = getURLParameterByName("type");

    if(query != null) { // search was requested!
        (<HTMLInputElement>  document.getElementById("searchQuery")).setAttribute("value", query);
        if(type == "comic") {
            comicSearch();
        } else {
            contribSearch();
        }
    }
}

// para: string which represents the type of search to perform ("user" || "comic")
// sends the user to the search page and sets the URL parameters needed to initiate a search.
// return: none
function submitSearch(type: string) {
    //var form = (<HTMLInputElement>  document.getElementById("searchForm"));
    var query = (<HTMLInputElement>  document.getElementById("searchQuery")).value;

    window.location.href = "/search?searchQuery="+query+"&type="+type;
}