(function($){
    $.fn.extend({
        setValue:function(value){
            if(!this[0]){
                return;
            }
            var tagName = this[0].tagName.toUpperCase();
            if(tagName=="INPUT"){
                var type = this.attr("type");
                if(!type){
                    this.val(value);
                    return false;
                }
                type = type.toLowerCase();
                switch(type)
                {
                    case "text":
                        this.val(value);
                        break;
                    case "hidden":
                        this.val(value);
                        break;
                    case "radio":
                        var name = this.attr("name");
                        var $radio = $("[name="+name+"]:radio");
                        $radio.each(function(index,radio){
                            if($(radio).val()==value){
                                $(radio).attr("checked",true);
                                return true;
                            }
                        });
                        break;
                    case "checkbox":
                        if(!isArray(value)){
                            throw "value must be Array";
                        }
                        var name = this.attr("name");
                        var $checkbox = $("[name="+name+"]:checkbox");
                        $checkbox.each(function(index,checkbox){
                            if(value.contains($(checkbox).val())){
                                $(checkbox).attr("checked",true);
                            }
                        });
                        break;
                    default:
                        break;
                }
            }else if(tagName=="SELECT"||tagName=="TEXTAREA"){
                this.val(value);
            }else{
                this.text(value);
            }
        },
        getValue:function(){
            var tagName = this[0].tagName.toUpperCase();
            if(tagName=="INPUT"){
                var type = this.attr("type");
                if(!type){
                    return this.val();
                }
                type = type.toLowerCase();
                switch(type){
                    case "text":
                        return this.val();
                        break;
                    case "hidden":
                        return this.val();
                        break;
                    case "radio":
                        var name = this.attr("name");
                        var $radio = $("[name="+name+"]:radio");
                        var result;
                        $radio.each(function(index,radio){
                            if($(radio).is(":checked")){
                                result = $(radio).val();
                            }
                        });
                        return result;
                        break;
                    case "checkbox":
                        var name = this.attr("name");
                        var $radio = $("[name="+name+"]:checkbox");
                        var result = [];
                        $radio.each(function(index,checkbox){
                            if($(checkbox).is(":checked")){
                                result.push($(checkbox).val());
                            }
                        });
                        return result;
                        break;
                    default:
                        break;
                }
            }else if(tagName=="SELECT"||tagName=="TEXTAREA"){
                return this.val();
            }else{
                return this.text();
            }
        },
        loadForm:function(data,formatter){
            for(var p in data){
                this.find("[name="+p+"]").setValue(data[p]);
            }
            if(formatter){
                for(var p in formatter){
                    this.find("[name="+p+"]").setValue(formatter[p](data[p],data));
                }
            }
        },
        grid:function(options){

            var html = '<table class="table table-bordered table-striped table-hover">';
            var title = options.title?options.title:"";
            if(title){
                html+="<caption>"+title+"</caption>";
            }
            var columns = options.columns?options.columns:[];
            var url = options.url?options.url:"";
            var pageNum = options.page?options.page:1;
            var pageSize = options.limit? options.limit:10
            var data = "";
            if(url.indexOf("?")>-1){
                url += "&pageNum="+pageNum+"&pageSize="+pageSize;
            }else{
                url += "?pageNum="+pageNum+"&pageSize="+pageSize;
            }
            getSyncAjax(url,function(successData){
                data = successData;
            },function(errorData){
               throw "grid error";
            });

            html+= "<thead><tr>";
            for(var i=0;i<columns.length;i++){
                var field = columns[i].field;
                if(!field){
                    throw  "field not set";
                }
                var title = columns[i].title?columns[i].title:columns[i].field;
                html+="<th>"+title+"</th>";
            }
            html+="</tr></thead>";

            html+="<tbody>";
            var list = data.data.list;
            if(!list||!data.data||!data.data.list|| data.data.list.length == 0){
                html+='<tr col="'+columns.length+'"></tr>';
                return;
            }
            for(var i=0;i<list.length;i++){
                html+="<tr>";
                var el = list[i];
                for(var j=0;j<columns.length;j++){
                   if(!columns[j].formatter){
                      html+="<td>"+el[columns[j].field]+"</td>";
                   }else{
                       html+="<td>"+columns[j].formatter(el[columns[j].field],el)+"</td>";
                   }
                }
                html+="</tr>";
             }
             html+="</tbody></table>";

             this.append(html);
             this.pagination(data,options);
             var total = data.data.total;

        },

        pagination:function(data,options){
            var html='<ul class="pagination">';
            var total = data.data.total;
            var pageNum =  options.page? parseInt(options.page):1;
            var pageSize = options.limit? options.limit:10;
            var totalPage = _getTotalPage(total,pageSize);

            html+='<li><a href="#" data="1">first</a></li>';
            if(pageNum != 1){
                 html+='<li><a href="#" data="'+(parseInt(pageNum)-1)+'">&laquo;</a></li>';
            }else{
                 html+='<li class="disabled"><a href="#" data="'+(parseInt(pageNum)-1)+'">&laquo;</a></li>';
            }
            if(totalPage>1&&totalPage<=5){
                for(var i=1;i<=totalPage;i++){
                    html+='<li><a href="#" data="'+i+'">'+i+'</a></li>';
                }
            }
            if(totalPage>5){
                if(pageNum<3){
                   for(var i=1;i<=5;i++){
                       html+='<li><a href="#" data="'+i+'">'+i+'</a></li>';
                   }
                }else if(pageNum>totalPage-2){
                   for(var i=totalPage-5;i<=totalPage;i++){
                       html+='<li><a href="#" data="'+i+'">'+i+'</a></li>';
                   }
                }else{
                   for(var i=pageNum-2;i<=parseInt(pageNum)+2;i++){
                       html+='<li><a href="#" data="'+i+'">'+i+'</a></li>';
                   }
                }
            }
            if(pageNum != totalPage){
                 html+='<li><a href="#" data="'+(parseInt(pageNum)+1)+'">&raquo;</a></li>';
            }else{
                 html+='<li class="disabled"><a href="#" data="'+(parseInt(pageNum)+1)+'">&raquo;</a></li>';
            }
            html+='<li><a href="#" data="'+totalPage+'">last</a></li>';
            html+='<li class="disabled"><a href="#">Page '+pageNum+'/'+totalPage+'  Total '+total+'</a></li>';
            this.append(html);
            var thiz = this;
            this.find(".pagination").find("li").on("click",function(){
                if($(this).hasClass("disabled")){
                    return;
                }
                var pageNum = $(this).find("a").attr("data");
                if(pageNum){
                    options.page = pageNum;
                    thiz.empty().grid(options);
                }
            });
        }
    });

    $.fn.extend({
        postFormAjax:function(url) {
            var result;
            var data = _getData(this);
            postAjax(url,data,function(res){
                result = res;
            });
            return result;
        },
        putFormAjax:function(url){
            var result;
            var data = _getData(this);
            putAjax(url,data,function(res){
                result = res;
            });
            return result;
        },
    });
})(jQuery);

function _getTotalPage(total,pageSize){
    if(parseInt(total)%parseInt(pageSize) == 0){
        return parseInt(parseInt(total)/parseInt(pageSize));
    }else{
        return parseInt(parseInt(total)/parseInt(pageSize))+1;
    }
}

function _totalAjax(url,type,data,async,successFn,errorFn){
    var options = {
        url: url,
        type: type,
        async: async,
        data: JSON.stringify(data),
        xhrFields:{
             withCredentials:true
        },
        contentType: 'application/json;utf-8',
        dataType: 'json',
        success: function (data) {
            if(successFn)
                successFn(data);
        },
        error: function (data, status, res) {
            alert("网络出现问题，及时联系网管");
            if(errorFn)
                errorFn(data, status, res);
        }
    };
    if(!data){
        delete  options.data;
    }
    $.ajax(
        options
    );
}
function getAjax(url,successFn,errorFn) {
    if(url.indexOf("?")>-1){
        url+='&='+Math.random();
    }else{
        url+='?='+Math.random();
    }
    _totalAjax(url,'get',null,true,successFn,errorFn);
}

function getSyncAjax(url,successFn,errorFn) {
    if(url.indexOf("?")>-1){
        url+='&='+Math.random();
    }else{
        url+='?='+Math.random();
    }
    _totalAjax(url,'get',null,false,successFn,errorFn);
}

function postAjax(url,data,successFn,errorFn) {
    _totalAjax(url,'post',data,false,successFn,errorFn);
}

function putAjax(url,data,successFn,errorFn) {
    _totalAjax(url,'put',data,false,successFn,errorFn);
}

function _getData(dom) {
    var data = {};
    var $dom = dom.find("[name]");
    for (var i = 0; i < $dom.length; i++) {
        data[$dom.eq(i).attr("name")] = dom.find("[name="+$dom.eq(i).attr("name")+"]").getValue();
    }
    return data;

}

function deleteAjax(url,successFn,errorFn) {
    _totalAjax(url,'delete',null,false,successFn,errorFn);
}