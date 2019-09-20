function AutoLike (_tag,_query_hash,_maxNumbersOfPost) {
    this.tag = _tag;
    this.query_hash = _query_hash;
    this.maxNumbersOfPost = _maxNumbersOfPost;
    this.timer = 1000; //ms
    this.edge = [];
    this.total = 0;
}

AutoLike.prototype = {
    constructor: AutoLike,
    start:function ()  {
        let canILike = this._prepareRequestHeader();
        this.total = 0;
        if(canILike)
            this._loadTagNodes();
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

            this.edges = data.graphql.hashtag.edge_hashtag_to_media.edges
            this.nextPage = data.graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor;
            for(let x in this.edges){
                let id = this.edges[x].node.id;
                this._doLike(id);
                this.total++;
            }

            console.log("Siamo a " + this.total);

            setTimeout(function(){
                if(me.total<me.maxNumbersOfPost)
                    me._loadNextPage();
                else
                    console.log("Yeeee " + me.total);
            },50000)
        }
        else{
            console.warn("No data");
        }
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




var a = new AutoLike("coding","174a5243287c5f3a7de741089750ab3b", 200);