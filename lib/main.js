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
    var xhr = [];
    var time = new Date().getTime();
    for (var j = 0; j < subscriptions.length; j++) {
      xhr[j] = new xhrm.XMLHttpRequest();
      xhr[j].open("GET", "https://www.drupal.org/api-d7/pift_ci_job/" + subscriptions[j] + ".json?time=" + time, true);
      xhr[j].onreadystatechange = (function () {
        if (xhr[this].readyState === 4 && typeof xhr[this].responseText !== "undefined") {
          try {
            var resp = JSON.parse(xhr[this].responseText);
            console.log(resp);
            if (resp.status == 'complete') {
              var test_id = resp.job_id;
              ss.storage.subscriptions[test_id] = null;
              delete ss.storage.subscriptions[test_id];
              showResultNotification(resp);
            }
          }
          catch (e) {
          }
        }
      }).bind(j);
      xhr[j].send();
    }
  }
}

function showResultNotification(test) {
  var myIconURL = data.url("myIcon.png");
  var url = test.url;
  notifications.notify({
    title: "Test finished",
    text: test.result.toUpperCase() + ':' + url,
    data: url,
    iconUrl: myIconURL,
    onClick: function (data) {
      tabs.open(url);
    }
  });
}
