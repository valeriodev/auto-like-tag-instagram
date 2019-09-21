function AutoLike (_tag,_maxNumbersOfPost) {
    this.tag = _tag;
    this.maxNumbersOfPost = _maxNumbersOfPost;
    this.timerPage = 2000; //ms
    this.timerLike = 60000; //ms
    this.edges = [];
    this.index = 0;
}

AutoLike.prototype = {
    constructor: AutoLike,
    start:function ()  {
        let canILike = this._prepareRequestHeader();
        this.edges = [];
        this.index = 0;
        if(canILike){
            this._getQueryHash();
        }
        else
            console.warn("You must login on www.instagram.com");
    },
    _loadTagNodes:function(){
        this._getRequest("https://www.instagram.com/explore/tags/"+this.tag+"/?__a=1",(data) => this._parseNodes(data));
    },
    _loadNextPage:function(){
        let variables = encodeURIComponent('{"tag_name":"' + this.tag + '","first":12,"after":"' + this.nextPage + '"}');
        let nextUrl = 'https://www.instagram.com/graphql/query/?query_hash=' + this.query_hash + '&variables=' + variables;
        console.log("Log next page",nextUrl);
        this._getRequest(nextUrl,(data) => this._parseNodes(data));

    },
    _parseNodes:function(data){
        var me = this;
        if(data !== false){

            if(typeof data.data !== "undefined")
                data.graphql = data.data;

            let edges = data.graphql.hashtag.edge_hashtag_to_media.edges
            this.nextPage = data.graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor;
            for(let x in edges){
                let id = edges[x].node.id;
                //this._doLike(id);
                this.edges.push(id);
            }

            console.log("Get " + edges.length + " id");

            setTimeout(function(){
                if(me.edges.length<me.maxNumbersOfPost)
                    me._loadNextPage();
                else{
                    console.log("Collected " + me.edges.length);
                    me._startLikeTimer();
                }
            },me.timerPage)
        }
        else{
            console.warn("No data");
        }
    },

    _startLikeTimer:function(){
        var me = this;
        console.log("Start Likes of " + this.edges.length + " posts every " + this.timerLike + "ms");
        this._likeInterval = setInterval(function(){
            let currentNodeId = me.edges[me.index++];
            console.log("Make like of " + currentNodeId);
            me._doLike(currentNodeId);
        },this.timerLike)
    },

    _postLUike:function(id, type){
        let xhttp = new XMLHttpRequest();
        xhttp.open("POST", "https://www.instagram.com/web/likes/" + id + "/" + type + "/", true);
        for(let r in this.rH)
            xhttp.setRequestHeader(r, this.rH[r]);
        xhttp.send()
    },

    _doLike:function(id){
        this._postLUike(id,"like");
    },

    _doUnLike:function(id){
        this._postLUike(id,"unlike");
    },

    _prepareRequestHeader:function(){
        this.rH = {};
        this.rH["Accept"] = "*/*";
        this.rH["Content-Type"] = "application/x-www-form-urlencoded";
        this.rH["X-Requested-With"] = "XMLHttpRequest";
        this.rH["X-IG-WWW-Claim"] = "0";
        this.rH["X-IG-App-ID"] = "936619743392459";
        
        try{
            this.rH["X-Instagram-AJAX"] = window._sharedData.rollout_hash;
            this.rH["X-CSRFToken"] = window._sharedData.config.csrf_token;
            return true;
        }
        catch(err){
            return false;
        }
    },

    _getQueryHash:function(){
        let me = this;
        var xhrProto = XMLHttpRequest.prototype,
        origOpen = xhrProto.open;

        xhrProto.open = function (method, url) {
            
            let _query_hash = me._getParameterByName("query_hash",url);
            let _variables = me._getParameterByName("variables",url);

            if(_query_hash!=null && _variables!=null){
                _variables = JSON.parse(_variables);
                let _tag_name = _variables["tag_name"];
                if(_tag_name == me.tag){
                    console.log("Query Hash Found", _query_hash);
                    me.query_hash = _query_hash;
                    xhrProto.open = origOpen;
                    me._loadTagNodes();
                    clearInterval(me._intervalScroll);
                }
            }
            return origOpen.apply(this, arguments);
        };


        this._intervalScroll = setInterval(function(){
            window.scrollTo(0,document.body.scrollHeight);
        },1000);


    },

    _getParameterByName:function(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    },

    _getRequest:function(_url,_res){
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
                try{
                    let dataParsed = JSON.parse(xmlHttp.responseText);
                    _res(dataParsed);
                }
                catch(err){
                    _res(false);
                }
            }
        }
        xmlHttp.open("GET", _url, true);
        xmlHttp.send(null);
    }


};




//var a = new AutoLike("javascript", 100);
//a.start();