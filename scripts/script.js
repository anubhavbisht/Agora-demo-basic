/**
 * @name handleFail
 * @param err - error thrown by any function
 * @description Helper function to handle errors
 */
let handleFail = function (err) {
  console.log("Error : ", err);
};

// Queries the container in which the remote feeds belong
let remoteContainer = document.getElementById("remote-container");

/**
 * @name addVideoStream
 * @param streamId
 * @description Helper function to add the video stream to "remote-container"
 */
function addVideoStream(streamId) {
  let streamDiv = document.createElement("div"); // Create a new div for every stream
  streamDiv.id = streamId; // Assigning id to div
  streamDiv.style.transform = "rotateY(180deg)"; // Takes care of lateral inversion (mirror image)
  remoteContainer.appendChild(streamDiv); // Add new div to container
}
/**
 * @name removeVideoStream
 * @param evt - Remove event
 * @description Helper function to remove the video stream from "remote-container"
 */
function removeVideoStream(evt) {
  let stream = evt.stream;
  stream.stop();
  let remDiv = document.getElementById(stream.getId());
  remDiv.parentNode.removeChild(remDiv);

  console.log("Remote stream is removed " + stream.getId());
}

document.getElementById("start").onclick = function () {
  let client = AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp8",
  });
  client.init("d7337c3a44b04c6bb8fc21cd8ccf96a5");
  client.join(
    null,
    "any-channel",
    null,
    (uid) => {
      let localstream = AgoraRTC.createStream({
        video: true,
        audio: true,
      });
      localstream.init(() => {
        localstream.play("me");
        client.publish(localstream, handleFail);
      }, handleFail);
    },
    handleFail
  );
  client.on("stream-added", function (e) {
    client.subscribe(e.stream, handleFail);
  });
  client.on("stream-subscribed", function (e) {
    let stream = e.stream;
    let streamid = String(stream.getId());
    addVideoStream(streamid);
    stream.play(streamid);
  });
  client.on("stream-removed", function (e) {
    let stream = e.stream;
    let streamid = String(stream.getId());
    stream.close();
    removeVideoStream(streamid);
  });
  client.on("peer-leave", function (e) {
    let stream = e.stream;
    let streamid = String(stream.getId());
    stream.close();
    removeVideoStream(streamid);
  });
};
