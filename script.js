'use strict';

function CreateRequestObj() {
    var forceActiveX = (window.ActiveXObject && location.protocol === "file:");
    if (window.XMLHttpRequest && !forceActiveX) {
        return new XMLHttpRequest();
    } else {
        try {
            return new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {}
    }
}

function validInput(name, val) {
    if (name == 'email') {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(val);
    }
    if (name == 'password') {
        return !!(
            val.match(/^[!-~]{6,}$/) && val.match(/[a-z]/) && val.match(/[A-Z]/) && val.match(/\d/)
        )
    }
}

function GetMessageBody(form) {
    var data = {};
    for (var i = 0; i < form.elements.length; i++) {
        var elem = form.elements[i],
            pElem = elem.parentNode.parentNode,
            nElem = document.getElementById(elem.name + 'Help');
        if (elem.name) {
            pElem.className = "form-group";
            if (validInput(encodeURIComponent(elem.name), elem.value)) {
                pElem.className += " has-success";
                nElem.className = "help-block hidden";
            } else {
                pElem.className += " has-error";
                nElem.className = "help-block";
                return false;
            }
            data[encodeURIComponent(elem.name)] = encodeURIComponent(elem.value);
        }
    }
    return JSON.stringify(data);
}

function IsRequestSuccessful(httpRequest) {
    var success = (
        httpRequest.status == 0 || (httpRequest.status >= 200 && httpRequest.status < 300) || httpRequest.status == 400 || httpRequest.status == 401 || httpRequest.status == 500);
    return success;
}

var registering = false;

function OnReadyStateChanged(httpRequest, form) {
    if (httpRequest.readyState == 0 || httpRequest.readyState == 4) {

        registering = false;

        httpRequest.onreadystatechange = null;

        document.getElementById('secAlert').className = 'hidden';
        var alertDiv = document.getElementById('alert'),
            alertSec = document.getElementById('secAlert'),
            formAjax = document.getElementById('formAjax');
        if (IsRequestSuccessful(httpRequest)) {
            if (httpRequest.status >= 200 && httpRequest.status < 300) {
                alertDiv.className = 'alert alert-success';
                alertDiv.innerHTML = '<strong>Success!</strong> Logowanie poprawne.'
                alertSec.className = '';
                formAjax.className = 'hidden';
            } else if (httpRequest.status == 400) {
                alertDiv.className = 'alert alert-info';
                alertDiv.innerHTML = '<strong>Info!</strong> Niepoprawne dane.'
                alertSec.className = '';
            } else if (httpRequest.status == 401) {
                alertDiv.className = 'alert alert-warning';
                alertDiv.innerHTML = '<strong>Warning!</strong> Niepoprawne login lub hasło.'
                alertSec.className = '';
            } else if (httpRequest.status == 500) {
                alertDiv.className = 'alert alert-danger';
                alertDiv.innerHTML = '<strong>Error!</strong> Błąd usługi.'
                alertSec.className = '';
            }
        } else {
            alertDiv.className = 'alert alert-info';
            alertDiv.innerHTML = '<strong>Info!</strong> An error occurred while registering. Please try it again.'
            alertSec.className = '';
        }
    }
}

function AjaxSend(form, method) {
    if (registering) {
        return;
    }

    var url = form.getAttribute('action'),
        data = GetMessageBody(form)

    if (!data) return false;

    var httpRequest = CreateRequestObj();
    try {
        httpRequest.open(method, url, true);
        httpRequest.onreadystatechange = function() {
            OnReadyStateChanged(httpRequest, form)
        };
        httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        httpRequest.send(data);
    } catch (e) {
        alert("Cannot connect to the server!");
        return;
    }
    registering = true;
}
