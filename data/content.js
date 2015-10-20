self.port.on("subscriptions", function(subscriptions) {
  var addButton = function (files, index, testID) {
    var t;
    var btn = document.createElement("button");
    if (!subscriptions) {
      subscriptions = {}
    }
    if (subscriptions[testID] === "undefined" || subscriptions[testID] !== testID) {
      t = document.createTextNode("Subscribe");
      btn.appendChild(t);
    }
    else {
      t = document.createTextNode("Subscribed");
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
  var subscribe = function(links) {
    var testID, operationLinks;
    for (var i = 0; i < links.length; i++) {
      operationLinks = links[i].getElementsByTagName('a');
      testID = operationLinks[0].getAttribute("href").split("/").pop();
      addButton(links, i, testID);
    }
  };
  subscribe(document.querySelectorAll('ul.pift-ci-tests li.pift-ci-running'));
  subscribe(document.querySelectorAll('ul.pift-ci-tests li.pift-ci-sent'));
  subscribe(document.querySelectorAll('ul.pift-ci-tests li.pift-ci-queued'));
});


