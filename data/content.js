self.port.on("subscriptions", function(subscriptions) {
  var addButton = function (files, index, testID) {
    var btn = document.createElement("button")
    if (!subscriptions) {
      subscriptions = {}
    }
    if (subscriptions[testID] === "undefined" || subscriptions[testID] !== testID) {
      var t = document.createTextNode("Subscribe");
      btn.appendChild(t);
    }
    else {
      var t = document.createTextNode("Subscribed");
      btn.appendChild(t);
    }

    btn.onclick = function () {
      console.log(testID);
      subscriptions[testID] = testID;
      btn.innerHTML = "Subscribed";
      self.port.emit("updateSubscriptions", subscriptions);
    };
    files[index].appendChild(btn);
  };
  // drupal.org Issues
  var files = document.querySelectorAll('div.pift-operations');
  console.log(files);
  for (var i = 0; i < files.length; i++) {
    var operationLinks = files[i].getElementsByTagName('a');
    for (var j = 0; j < operationLinks.length; j++) {
      if (operationLinks[j].innerHTML === 'View') {
        var testID = operationLinks[j].getAttribute("href").split("/").pop();
        addButton(files, i, testID);
        break;
      }
    }
  }

// qa.drupal.org test page
  var files = document.querySelectorAll('#pifr-status');
  console.log(files);
  if (files.length > 0) {
    var pathArray = window.location.pathname.split( '/' );
    var testID = pathArray[pathArray.length - 1];
    addButton(files, 0, testID);
  }
});


