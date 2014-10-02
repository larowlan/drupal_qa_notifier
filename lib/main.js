var data = require("sdk/self").data;
var ss = require("sdk/simple-storage");
var pageMod = require("sdk/page-mod");
var timers = require("sdk/timers");
var xhrm = require("sdk/net/xhr");
var notifications = require("sdk/notifications");
var tabs = require("sdk/tabs");
pageMod.PageMod({
  include: "*.drupal.org",
  contentScriptFile: data.url("content.js"),
  onAttach: function(worker) {
    worker.port.emit("subscriptions", ss.storage.subscriptions);
    worker.port.on("updateSubscriptions", function(subscriptions) {
      console.log(subscriptions);
      ss.storage.subscriptions = subscriptions;
    });
  }
});

var timeout = timers.setInterval(onWatchdog, 60000);

function onWatchdog() {
  console.log('starting check');
  if (typeof ss.storage.subscriptions === "undefined") {
    ss.storage.subscriptions = {};
  }

  var subscriptions = [];
  for (var prop in ss.storage.subscriptions) {
    if (ss.storage.subscriptions.hasOwnProperty(prop)) {
      subscriptions.push((prop));
    }
  }

  if (subscriptions.length > 0) {
    console.log(subscriptions);
    var tests = subscriptions.join('+');
    var xhr = new xhrm.XMLHttpRequest();
    var time = new Date().getTime();
    xhr.open("GET", "https://qa.drupal.org/pifr/test/" + tests + "/json?time=" + time, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && typeof xhr.responseText !== "undefined") {
        try {
          var resp = JSON.parse(xhr.responseText);
          if (resp.tests && resp.tests.length) {
            for (var i = 0; i < resp.tests.length; i++) {
              if (resp.tests[i]['test']) {
                test = resp.tests[i]['test'];
              }
              console.log(test);
              if (test.status === "Result") {
                ss.storage.subscriptions[test.id] = null;
                delete ss.storage.subscriptions[test.id];
                showResultNotification(test);
              }
            }
          }
        }
        catch(e) {}
      }
    };
    xhr.send();
  }
}

function showResultNotification(test) {
  var myIconURL = data.url("myIcon.png");
  console.log('showing notification');
  var url = 'https://qa.drupal.org/pifr/test/' + test.id;
  if (typeof test.dorg_link !== "undefined" && test.dorg_link.length > 0) {
    url = test.dorg_link;
  }
  notifications.notify({
    title: "Test finished",
    text: url,
    data: url,
    iconUrl: myIconURL,
    onClick: function (data) {
      tabs.open(url);
    }
  });
}
