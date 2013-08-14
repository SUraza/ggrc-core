/*
 * Copyright (C) 2013 Google Inc., authors, and contributors <see AUTHORS file>
 * Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 * Created By:
 * Maintained By:
 */

//= require can.jquery-all
//= require models/cacheable

(function(ns, can) {

can.Model.Cacheable("CMS.Models.Person", {
   root_object : "person"
   , root_collection : "people"
   , findAll : "GET /api/people"
   , findOne : "GET /api/people/{id}"
   , create : "POST /api/people"
   , update : "PUT /api/people/{id}"
   , destroy : "DELETE /api/people/{id}"
    , search : function(request, response) {
        return $.ajax({
            type : "get"
            , url : "/api/people"
            , dataType : "json"
            , data : {s : request.term}
            , success : function(data) {
                response($.map( data, function( item ) {
                  return can.extend({}, item.person, {
                    label: item.person.email
                    , value: item.person.id
                  });
                }));
            }
        });
    }
    , defaults : {
      name : ""
      , email : ""
    }
    , findInCacheByEmail : function(email) {
      var result = null, that = this;
      can.each(Object.keys(this.cache || {}), function(k) {
        if(that.cache[k].email === email) {
          result = that.cache[k];
          return false;
        }
      });
      return result;
    }
}, {
    init : function () {
        this._super && this._super();
        // this.bind("change", function(ev, attr, how, newVal, oldVal) {
        //     var obj;
        //     if(obj = CMS.Models.ObjectPerson.findInCacheById(this.id) && attr !== "id") {
        //         obj.attr(attr, newVal);
        //     }
        // });

        var that = this;

        this.each(function(value, name) {
          if (value === null)
            that.removeAttr(name);
        });
    }
  , display_name : function() {
    return this.email;
  }
});

})(this, can);
