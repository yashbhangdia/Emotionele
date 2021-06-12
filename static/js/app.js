//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
// var pauseButton = document.getElementById("pauseButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
// pauseButton.addEventListener("click", pauseRecording);

function startRecording() {
	console.log("recordButton clicked");

	while(chipList.firstChild)
	{
		chipList.removeChild(chipList.firstChild);
	}

	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
    
    var constraints = { audio: true, video:false }

 	/*
    	Disable the record button until we get a success or fail from getUserMedia() 
	*/

	recordButton.disabled = true;
	stopButton.disabled = false;
	//pauseButton.disabled = false

	/*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device
		*/
		audioContext = new AudioContext();

		//update the format 
		/*  assign to gumStream for later use  */
		gumStream = stream;
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input,{numChannels:1})

		//start the recording process
		rec.record()

		console.log("Recording started");

	}).catch(function(err) {
	  	//enable the record button if getUserMedia() fails
    	recordButton.disabled = false;
    	stopButton.disabled = true;
    	//pauseButton.disabled = true
	});
}

// function pauseRecording(){
// 	console.log("pauseButton clicked rec.recording=",rec.recording );
// 	if (rec.recording){
// 		//pause
// 		rec.stop();
// 		pauseButton.innerHTML="Resume";
// 	}else{
// 		//resume
// 		rec.record()
// 		pauseButton.innerHTML="Pause";

// 	}
// }

function stopRecording() {
	console.log("stopButton clicked");

	//disable the stop button, enable the record too allow for new recordings
	stopButton.disabled = true;
	recordButton.disabled = false;
	//pauseButton.disabled = true;

	//reset button just in case the recording is stopped while paused
	//pauseButton.innerHTML="Pause";
	
	//tell the recorder to stop the recording
	rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);
}

function chatbox(e)
{
	var li = document.createElement('li');
	var response = document.createElement('p');
	var activity = document.createElement('p');
	response.className = 'response';
	activity.className = 'response';
	activity.innerHTML = "";

	var message = document.createElement('p');
	message.className = 'message';
	var li = document.createElement('li');

	message.innerHTML = this.innerText;
	var answer = this.innerText;

	li.appendChild(message);
	li.appendChild(document.createTextNode(" "))
	recordingsList.appendChild(li);

	var xhr=new XMLHttpRequest();
	xhr.onload=function(e) {
		if(this.readyState === 4 && this.status === 200) 
		{
			var string = this.responseText.split("#");
			var res = string[0].split("_");

			if(res.length > 1)
			{
				console.log("Length > 1");
				activity.innerHTML = res[1];
			}
			response.innerHTML = res[0];
			}


	};
	var fd=new FormData();
	fd.append("answer", answer);
	xhr.open("POST","/?answer="+answer,true);
	xhr.send(fd);
	li.appendChild(document.createTextNode(" "))
	li.appendChild(response);
	if(activity.innerHTML!="")
	{
		console.log("hello");
		li.appendChild(activity)
	}
	recordingsList.appendChild(li);

	while(chipList.firstChild)
	{
		chipList.removeChild(chipList.firstChild);
	}


}

function createDownloadLink(blob) {
	
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var link = document.createElement('a');
	var response = document.createElement('p');
	var activity = document.createElement('p');
	
	var options = [];

	//name of .wav file to use during upload and download (without extendion)
	var filename = "AUDIO123";	//new Date().toISOString();

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;
	au.setAttribute('class', 'audio-element');

	//Response
	response.className = 'response';
	activity.className = 'response';

	//save to disk link
	link.href = url;
	link.download = filename+".wav"; //download forces the browser to donwload the file using the  filename
	link.innerHTML = "Save to disk";

	//add the new audio element to li
	li.appendChild(au);
	
	
	//add the filename to the li
	//li.appendChild(document.createTextNode(filename+".wav "))

	//add the save to disk link to li
	//li.appendChild(link);
	
	//upload link
	//var upload = document.createElement('a');
	// upload.href="#";
	// upload.innerHTML = "Upload";
	// upload.addEventListener("click", function(event){
	var xhr=new XMLHttpRequest();
	xhr.onload=function(e) {
		if(this.readyState === 4 && this.status === 200) {
			//console.log("Server returned: ",e.target.responseText);
		var string = this.responseText.split("#");
		var res = string[0].split("_");
		var record = document.getElementById("recordingList");
		li.appendChild(document.createTextNode(" "))

		response.innerHTML = res[0];
		li.appendChild(response);

		if(res.length>1)
		{
			// console.log("Length > 1");
			activity.innerHTML = res[1];
			li.appendChild(document.createTextNode(" "))
			li.appendChild(activity);
		}
		recordingsList.appendChild(li);

		var option = string[1].split("-");
		for(x of option)
		{
			options.push(x);
		}

		var chipList = document.getElementById("chipList");
		for(x of options)
		{
			console.log(x);
			var li = document.createElement('li');
			li.className = "chip"
			var sp = document.createElement('span');
			sp.innerHTML = x;
			li.appendChild(sp);
			li.addEventListener("click", chatbox);
			chipList.append(li);
		}
		}
	};
	var fd=new FormData();
	fd.append("audio_data",blob, filename);
	xhr.open("POST","/?answer=default",true);
	xhr.send(fd);
	//})
	
	//add the li element to the ol
	recordingsList.appendChild(li);

	console.log(activity.innerHTML);
}