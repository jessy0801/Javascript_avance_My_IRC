window.onload = function() {

    var name = prompt('Pseudo :');
    //var name = 'test';

    var messages = [];
    var socket = io.connect('http://localhost:3000');
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    var currentchannel = 'default';
    var channels = document.getElementById("tablist");
    var add_channel = document.getElementById("add_channel");

    console.log(channels.childNodes);

    socket.on('connect', function() {
        // Connected, let's sign-up for to receive messages for this room
        socket.emit('room', currentchannel);
    });
    for ( var i = 2; i < channels.childNodes.length; i++ ) (function(i){
        channels.childNodes[i].onclick = function() {
            currentchannel = channels.childNodes[i].id;
            console.log(currentchannel);
            messages = [];
            socket.emit('room', currentchannel);


            content.innerHTML = "";

        }
    })(i);

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function send(str) {
        var regexnick = /\/nick\ (.\w+)/g;
        var regexjoin = /\/join\ (.\w+)/g;
        var regexlist = /\/list\ (.*)/g;
        var regexpart = /\/part\ (.\w+)/g;
        var regexusers = /\/users/g;
var match = [];
            match[0] = regexnick.exec(str);

            match[1] = regexjoin.exec(str) ;

            match[2] = regexlist.exec(str) ;

            match[3] = regexpart.exec(str) ;

            match[4] = regexusers.exec(str) ;

        match.forEach(function (t) {
            if (t !== null) {
                switch (match.indexOf(t)) {
                    case 0:
                        name = t[1];
                        break;
                    case 1:
                        socket.emit('room', t[1]);
                        break;
                    case 2:

                        break;
                    case 3:
                        break;
                    case 4:
                        break;
                }
            }

        });
        //if (match !== null) {

        //}



        var text = '<a style="color: red" href="#">['+name+']</a> : '+escapeHtml(str);


        socket.emit('send', { message: text, name: name });
        field.value = "";
        $("#content").scrollTop($("#content").scrollHeight);
    }

    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data.message);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += messages[i] + '<br />';
            }
            content.innerHTML = html;
        } else {
            console.log("There is a problem:", data);
        }
    });

    sendButton.onclick = function() {
        send(field.value)
    };
    field.onkeydown = function (e) {
        if (e.keyCode === 13) {
            send(field.value)
        }
    };
    add_channel.onclick = function () {
        currentchannel = prompt('Nom de la chaine');
        socket.emit('add_room', {roomname : currentchannel, name : name });

    }

};
