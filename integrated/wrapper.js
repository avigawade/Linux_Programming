

var player = null;


function open_decoder(){
	
	if (player) {
        player.stop();
    }
    var video = document.getElementById("video");
    player = new libde265.StreamPlayer(video); //'video' is canvas element

    var decoder = null;
    decoder = player.open_decoder();

    return decoder;
}

function close_decoder(decoderHandle){
    if(decoderHandle && player){
        player.close_decoder(decoderHandle);
        return 0;
    }
    else{
        console.log("instance of player or decoder is not valid");
        return -1;
    }
}

function decode_h264nal(decoder,data,length){
    //player.decode_h265data(decoder,data,length);
    if(decoder){
        if (data == null)
        {
            return;
        }

        

       // if (!that.running) {
        //    return;
       // }

        var err;
        if (data == null) {
            err = decoder.flush();
        } else {
            try
            {
                var tmp = new Uint8Array(data);//, 0, chunk_size);
                err = decoder.push_data(tmp);
            }
            catch(err)
            {
                console.log(err);
                err = decoder.flush();
                return;
            }
        }
        if (!libde265.de265_isOK(err)) {
            that._set_error(err, libde265.de265_get_error_text(err));
            return;
        }
        decoder.decode(function(err) {
            switch(err) {
            case libde265.DE265_ERROR_WAITING_FOR_INPUT_DATA:
                //console.log("DE265_ERROR_WAITING_FOR_INPUT_DATA");
                setTimeout(decode_h264nal(null), 0);
                return;

            default:
                if (!libde265.de265_isOK(err)) {
                    that._set_error(err, libde265.de265_get_error_text(err));
                    return;
                }
            }

            if (decoder.has_more()) {
                //console.log("has more");
                setTimeout(decode_h264nal(null), 0);
                return;
            }

           // decoder.free();
            //that.stop();
        });
    }
}


onmessage = function(e) {

    //var decoderHandle = open_decoder();
    var message = e.data;
    console.log("inside onmessage in wrapper.js  :  "+message.type);
    switch(message.type) {
        case 'close':
            close_decoder(decoderHandle);
            break;
        case 'open':{
            var decoderHandle = open_decoder();
            postMessage({data:decoderHandle});
            }
            break;
        case 'frame':
            if (message.data == null) {
                decode_h264nal(decoderHandle, 0, 0);
            } else {
                var byteArray = new Uint8Array(message.data);
                decode_h264nal(decoderHandle, byteArray, byteArray.length);
            }
    };
}