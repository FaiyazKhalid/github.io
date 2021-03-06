//Templates

var tagsTemplate =null;
var filtersTemplate = null;
var highlightsTemplate = null;

//API

function getFilterDataById (id){
  var result = null;
  var data = filtersData;
    $.each(data.groups, function(i,group){
      $.each(group.filters, function(j,filter){
        if(id == filter.id){
          result = filter;
        }
      });
    });
    return result;
}

function getSelectedFilters(data){
  var result = [];
    $.each(data.groups, function(i,group){
      $.each(group.filters, function(j,filter){
        if(filter.selected){
          result.push(filter);
        }
      });
    });
    return result;
}

function getSelectedFiltersAndHighlights(data){
  var result = [];
    $.each(data.groups, function(i,group){
      $.each(group.filters, function(j,filter){
        if(filter.selected || filter.color){
          result.push(filter);
        }
      });
    });
    return result;
}

function updateFilterData(id, selected){
  var filter = getFilterDataById(id);
  filter.selected = selected;
}

function updateFilterColor(id, color){
  var filter = getFilterDataById(id);
  filter.color = color;
}


function findInGroup(group, query, expanded){
  var result = [];

  $.each(group.filters, function(i,filter){
    var info = filter.name.toLowerCase()+ filter.description.toLowerCase();
    var q = query.toLowerCase();
    //var matches = info.indexOf(q)!= -1; //contains
    //var matches = info.indexOf(q) == 0;   //startsWith
    var matches = false;
    if(!!expanded){
      matches = info.indexOf(q) == 0;   //startsWith
    }else{
      matches = info.indexOf(q)!= -1; //contains
    }

    if(matches){
      result.push(filter);
    }
  });

  return result;
}

function find(query,extended){
  var data = filtersData;
  var result = {groups:[]};
  var groups = data.groups;
  $.each(groups, function(i,group){
    var filters = findInGroup(group, query, !!extended);
    if (filters.length > 0){
      var g = {group: group.group, filters: filters};
      result.groups.push(g);
    }
  });
  return result;
}

function showOptions(e){
  var isActive = $(this).hasClass("active");
  $(".filter .options").removeClass("active");
  if(!isActive){
    $(this).addClass("active");
  }
}

function selectHighlight(e){
  var panel = $(this).parents(".visibility-panel");
  panel.find(".active").removeClass("active");
  //panel.find(".option-highlight").addClass("active");
  $(this).addClass("active");

  var color = $(this).attr("name");
  var filter = $(this).parents(".filter");
  filter.attr("data-color", color);
  var data = getFilterDataById(filter.data("id"));
  data.color = color;

  $(this).closest(".highlight-criteria").find(".color-indicator").removeClass("blue green yellow orange red");
  $(this).closest(".highlight-criteria").find(".color-indicator").addClass(color);
  updateTags();
  panel.removeClass("active");
}

function removeHighlight(e){
  var panel = $(this).parents(".visibility-panel");
  panel.find(".active").removeClass("active");
  //panel.find(".option-highlight").addClass("active");
  $(this).addClass("active");

  var color = false;
  var filter = $(this).parents(".filter");
  filter.attr("data-color", color);
  var data = getFilterDataById(filter.data("id"));
  data.color = color;

  $(this).closest(".highlight-criteria").find(".color-indicator").removeClass("blue green yellow orange red");
  updateTags();
  panel.removeClass("active");
}

function selectFilter(e){
  var panel = $(this).parents(".visibility-panel");
  panel.find(".active").removeClass("active");
  //panel.find(".option-filter").addClass("active");
  $(this).addClass("active");

  var color = false;
  var filter = $(this).parents(".filter");
  filter.attr("data-color", color);
  var data = getFilterDataById(filter.data("id"));
  data.color = color;
  updateTags();
}


function scrollToFilter(){
  var scrollPos= $('.filter-panel').scrollTop();
  var targetPos = $(".suggested").offset().top;
  var dialogOffset = $(".filter-panel").offset().top;
  var panelHeight = $('.filter-panel').height();
  var pos = scrollPos + targetPos - dialogOffset;
  if (pos<scrollPos || pos - scrollPos > panelHeight){ //out of viewport:
    $('.filter-panel').animate({scrollTop: pos }, 500);
  }
}

function highlightChange(change, color){
var allFilters = $.map(filtersData.groups, function(g){return g.filters;});
var filtersOfColor = $.grep(allFilters, function(f){ if(f.color == color){return f;} });
var colorTags = $.map(filtersOfColor, function(f){return f.id});

  $.each(colorTags,function(j,tag){
    if(change.hasClass(tag)){
      change.addClass("color");
      change.addClass(color);
    }
  });

}


function meetsFiltersOrOptionalHighlight(classList){
  var result = true;
  var data = filtersData;
  $.each(data.groups, function(i,group){
    var hasActiveFilters = false;
    var anyMatches = false;
    var numberOfActiveFilters = $.grep(group.filters, function(item){ return !!item.selected;}).length;

    $.each(group.filters, function(j,filter){
      var isColored = filter.color;
      if(filter.selected && filerHighlights || filter.selected && !filerHighlights && !isColored){
        hasActiveFilters = true;
        var matches = ($.inArray(filter.id, classList) >= 0 );
        anyMatches = anyMatches || matches;
      }
    });
    if( hasActiveFilters){
      result = result && anyMatches;
    }
  });
  return result;

}

function meetsFiltersOr(classList){
  var result = true;
  var data = filtersData;
  $.each(data.groups, function(i,group){
    var hasActiveFilters = false;
    var anyMatches = false;
    var numberOfActiveFilters = $.grep(group.filters, function(item){ return !!item.selected;}).length;

    $.each(group.filters, function(j,filter){
      if(filter.selected){
        hasActiveFilters = true;
        var matches = ($.inArray(filter.id, classList) >= 0 );
        anyMatches = anyMatches || matches;
      }
    });
    if( hasActiveFilters){
      result = result && anyMatches;
    }
  });
  return result;

}



//UPDATES
function updateChanges(){
  //window.setTimeout(function(){
    $(".changes .change").removeClass("hidden");
    $(".changes .change").removeClass("color");
    $(".changes .change").removeClass("blue");
    $(".changes .change").removeClass("green");
    $(".changes .change").removeClass("yellow");
    $(".changes .change").removeClass("orange");
    $(".changes .change").removeClass("red");

    $.each($(".changes .change"),function(i,change){

      //Check filters
      var matches = meetsFilters($(change).attr("class").split(' '));
      if (!matches){
        $(change).addClass("hidden");
      }

      //Highlight
      highlightChange($(change), "blue");
      highlightChange($(change), "green");
      highlightChange($(change), "yellow");
      highlightChange($(change), "orange");
      highlightChange($(change), "red");
    });

    if ($(".changes .change").length >0 && $(".changes .change:not(.hidden)").length == 0){
      $(".changes-empty").removeClass("hidden");
      $(".changes").addClass("hidden");
    } else {
      $(".changes-empty").addClass("hidden");
      $(".changes").removeClass("hidden");
    }
  //});

}

function updateHighlightMenu(){
  var data = filtersData;
  var allFilters = $.map(filtersData.groups, function(g){return g.filters;});
  var activeFilters = $.grep(allFilters, function(f){ if(f.selected){return f;} });

  if(activeFilters.length>0){
    var group = {group:"Active filters", filters:activeFilters};
    var groups = $.merge([group],filtersData.groups);
    data = {groups: groups};
  }

  var html = highlightsTemplate(data);
  $(".highlight-panel").html(html);
  //Bindings:
  $(".highlight-criteria .description").click(function(e){ //Show/hide visibility panel
    var panel= $(this).parent(".highlight-criteria").find(".visibility-panel");
    var isActive = panel.hasClass("active");
    $(".highlight-criteria .visibility-panel").removeClass("active");
    if(!isActive){
      panel.addClass("active");
    }
  });

  $(".visibility-panel .highlight").click(selectHighlight);
  $(".visibility-panel .option-filter").click(removeHighlight);
}

function closeHighlightPanel(){
  $(".highlight-panel").scrollTop(0);
  $(".highlight-panel").addClass("hidden compact");
  $(".visibility-panel").removeClass("active");
}

function updateFilters(){
  var data = filtersData;
  var query = $(".search").val().trim();
  if(query.length > 0) {
    data = find(query);
    if(data.groups.length == 0){
      data = find(query, true); //extended search
    }
  }
  var html = filtersTemplate(data);

  $(".filter-panel").html(html);
  $(".tag").removeClass("active");
  //Bindings:
  $(".check").change(function() {
    updateFilterData(this.id, this.checked);
    $(this).parent(".filter").toggleClass("active");
    var isQuery = $(".search").val().length >0;
    if(isQuery){
        clearQuery();
        updateFilters();
    }

    updateTags();
    $(".search").focus();

  });

  $(".options").click(showOptions);
  $(".visibility-panel .highlight").click(selectHighlight);
  $(".visibility-panel .option-filter").click(selectFilter);
  $(".searchable .message").click(function(e){$(".search").focus()});
  updateTooltips();
  $(".highlighter").click(function(){
    //$(this).closest(".filter-panel").toggleClass("highlighting");
    $("body").toggleClass("highlighting");
  });
}

function removeTag(e){
  var tag = $(e.target).parent(".tag");
  var filterId = $(tag).data("id");
  updateFilterData(filterId, false);
  updateFilterColor(filterId, false);
  updateFilters();
  updateTags();

  if(!$(".filter-panel").hasClass("hidden")){
    filtersVisible(true);
      $(".search").focus();
  }

  return false;
}

function selectTag(e){
  var tag = $(e.target).hasClass("tag")?$(e.target):$(e.target).parent(".tag");
  var filterId = tag.data("id");
  $(".search").focus();
  clearQuery();
  if(!tag.hasClass("active")){
    updateFilters();
    tag.addClass("active");
    $(".filter[data-id='"+ filterId+"']").addClass("suggested");
    scrollToFilter();
  } else {
      //tag.removeClass("active");
      updateFilters();
  }
  return false;
}

function highlightActiveGroups(){
  var data = filtersData;
  $(".filter-panel .group.active").removeClass("active");
    $(".filter.inactive").removeClass("inactive");

    $.each(data.groups, function(i,group){
      var activeGroup = false;
      var implicitActive = [];

      $.each(group.filters, function(j,filter){
        var isHighlightWithoutFitler = !!filter.color && !filerHighlights;
        if(filter.selected){
          $(".filter-panel .group[data-id='"+ group.group +"']").addClass("active");
          if(!isHighlightWithoutFitler){
            activeGroup = true;
            $.each(filterSubsets,function(k,v){
              if(filter.id == v[1]){
                implicitActive.push(v[0]);
              }
            });

          }
        }
      });

      if(activeGroup){ //Darken inactive filters
        $.each(group.filters, function(j,filter){
          var isImplicit = implicitActive.indexOf(filter.id) >=0;
          if(!filter.selected && !isImplicit){
            $(".filter[data-id='"+ filter.id +"']").addClass("inactive");
          }
        });
      }

    });
}

function updateTags(){
  window.setTimeout(function(){
    //var data = {tags: getSelectedFilters(filtersData)};
    var activeTags = getSelectedFiltersAndHighlights(filtersData);
    var data = {tags: activeTags};
    var emptyTags = activeTags.length == 0;
    if(emptyTags){
      $(".tagbox").addClass("empty");
    }else{
      $(".tagbox").removeClass("empty");
    }


    var html = tagsTemplate(data);
    $(".tags").html(html);


    //Bindings:
    $(".remove").click(removeTag);
    $(".tag").click(selectTag);
    //updateHighlightMenu();
    highlightActiveGroups();
    updateChanges();

    //Incompatibilities:
    $.each(filterSubsets, function(i,pair){
      if($(".tag[data-id='"+ pair[0] +"']:not([data-color]), .tag[data-id='" + pair[1] +"']").length == 2){
        var tag = $(".tag[data-id='" + pair[0] + "']");
        tag.addClass("useless");

        var title = tag.data("description") + " Has no effect currently because it is included already in \""+ $(".tag[data-id='" + pair[1] + "'] .name").text() +"\". Consider highlighting with a color to distinguish.";
        tag.attr("title", title);
      }
    });

    $.each(filterComplete, function(i, list){
      var tags =[];
      $.each(list, function(j, tagId){
        var tag = $(".tag[data-id='"+ tagId + "']:not([data-color])");
        if(tag.length>0){
            tags.push(tag);
        }
      });
      if(tags.length == list.length){
          $.each(tags, function(i, tag){
            tag.addClass("useless");
            var title = tag.attr("title") + " No effect in the current result since all complementary filters have been added too";
            tag.attr("title", title);
          });
      }
    });

    //Highlight fitering
    var areHighlights = $(".tag[data-color]").length >0;
    var onlyHighlights = $(".change:not(.hidden):not(.color)").length == 0;
    if(areHighlights){
      $(".changes").addClass("highlights");
    } else {
      $(".changes").removeClass("highlights");
    }

    updateTooltips();

  });
}


function areOnlyCompleteHighlights(){
  //check if current highlights result in the full set of results
  var result = false;
  $.each(filterComplete, function(i, list){
    var tags =[];
    $.each(list, function(j, tagId){
      var tag = $(".tag[data-id='"+ tagId + "'][data-color]");
      if(tag.length>0){
          tags.push(tag);
      }
    });
    if(tags.length == list.length && list.length == $(".tag").length){
        result = true;
    }
  });
  return result;
}

function filtersVisible(show){
  var panel = $(".filter-panel");
  if(show){
    panel.removeClass("hidden");
  }else{
    panel.scrollTop(0);
    panel.addClass("hidden");

  }
}

function clearQuery(){
  $(".search").val("");
  $(".filter").removeClass("suggested");
}

function searchWhenTyping(e){
  var query = $(".search").val().trim().length > 0;
  var code = e.which;
  //console.debug(code);

  //Enter when searching -> select first
  if(code == 13 && query){
//    var filters = $(".filter-panel .filter .check");
    var filters = $(".filter-panel .filter.suggested .check");
    if(filters.length > 0){
      var first = filters[0];
      //console.debug(first.id);
      updateFilterData(first.id, !first.checked);
      clearQuery();
    }
    updateTags();
  }

  //Exit on escape
  if(code == 27){
    clearQuery();
    $(".search").blur();
    filtersVisible(false);
  }

  updateFilters();
  if(code !=13 && query){   //Highlight first result
    $(".filter-panel .filter:first" ).addClass("suggested");
  }

}

function clearWhenTyping(e){
  var query = $(".search").val().trim().length > 0;
  var code = e.which;
  if (code == 8 && !query){

    var tags = $(".tag");
    if(tags.length>0){
      var last = tags[tags.length -1];
      var filterId = $(last).data("id");
      updateFilterData(filterId, false);
      updateTags();
    }
  }
}

function updateTooltips(){
  $('.tags .tag:not(.tooltipstered), .filter-panel .options:not(.tooltipstered)').tooltipster({
    theme: 'tooltipster-light',
    maxWidth: 400,
    delay: 600
    });
    $('.filter-highlights:not(.tooltipstered)').tooltipster({
      theme: 'tooltipster-light',
      maxWidth: 400,
      delay: 600,
      side: "bottom",
      timer: 6000
      });

    $(".filter-panel .whatsthis:not(.tooltipstered)").tooltipster({
      theme: 'tooltipster-light',
      trigger: 'click',
      contentCloning: true,
      maxWidth: 400,
      interactive: true
      });


}

function loadChangesData(){
    $(".changes").load("changes.html", addMetadataToChanges);
}


function updateFilterHighlights(){
  window.setTimeout(function(){
  var button = $(".filter-highlights");
  var onlyComplete = areOnlyCompleteHighlights();
  var isDisabled = button.hasClass("disabled");
  if (isDisabled){
    button.tooltipster("close");
    button.tooltipster('content', "When filters are asigned a color, you can control whether they restrict further the results or not.");
  }else if(onlyComplete){
    button.addClass("disabled");
    button.tooltipster("close");
    button.tooltipster('content', "Highlight is already applied to all results.");
  } else if(filerHighlights){
    button.addClass("active");
    button.tooltipster("close");
    button.tooltipster('content', "Highlights are used to filter more results.");
    $(".tag[data-color]").removeClass("useless");
  } else {
    button.removeClass("active");
    button.tooltipster("close");
    button.tooltipster('content', "Highlights are ignored when filtering results");
    $(".tag[data-color]").addClass("useless");
  }

  highlightActiveGroups();
  updateChanges();
});
}

function clearAllTags(){
    var data = filtersData;
    $.each(data.groups, function(i,group){
      $.each(group.filters, function(j,filter){
        filter.selected = false;
        filter.color = false;
      });
    });
    updateFilters();
    updateTags();
}

function restoreTags(){
  updateFilterData("human",true);
  updateFilterData("content-edit",true);
  updateFilterData("new-page",true);
  updateFilterData("logged",true);
  updateFilters();
  updateTags();
}

var filerHighlights = true;
var meetsFilters = meetsFiltersOrOptionalHighlight;

$(function(){ //Initialization:
  tagsTemplate = Handlebars.compile($("#tags-template").html());
  filtersTemplate = Handlebars.compile($("#filters-template").html());
  highlightsTemplate =  Handlebars.compile($("#highlights-template").html());
  var hash= window.location.hash.replace("#","");
  $("body").addClass(hash); //tags: integrated

  loadChangesData();
  updateFilters();
  updateTags();

  $(".search").keyup(searchWhenTyping);
  //$(".search").keydown(clearWhenTyping);
  $(".search").focus(function(){
    if($(".filter-panel").hasClass("hidden") && $('body').scrollTop() < 200){
      $('body,html').animate({scrollTop: 220 }, 200);
    }
    filtersVisible(true);
    $(this).parent(".searchbar").addClass("active");
  });
  $(".search").blur(function(){
    $(this).parent(".searchbar").removeClass("active");
  });
  $(".search-icon").click(function(){$(".search").focus();});

  /*$(".highlight-results").click(function(){
    var panel = $(".highlight-panel");
    var isHidden = panel.hasClass("hidden");
    if(isHidden){
        panel.removeClass("hidden");
        if ($('body').scrollTop() < 200){
          $('body,html').animate({scrollTop: 220 }, 200);
        }
    }else{
      closeHighlightPanel();
    }

  });

  $(".highlight-panel").scroll(function(e){
    if($(this).scrollTop()>0){
      $(this).removeClass("compact");
    }
  });*/

  $("body").click(function(e){
    if ($(e.target).parents(".filters").length == 0 && $(e.target).closest(".tooltipster-content").length == 0){
      filtersVisible(false);
      $(".tags .tag.active").removeClass("active");
    }

    if ($(e.target).closest(".highlight-group").length == 0){
      closeHighlightPanel();
    }
  });

  $(".tagbox").click(function(e){
    var isClosed = $(".filter-panel").hasClass("hidden");
    if(isClosed){
      filtersVisible(true);
      $(".search").focus();

    }else{
      filtersVisible(false);
      $(".tags .tag.active").removeClass("active");
    }
  });
  $(".clear-tags").click(function(e){clearAllTags();return false;});
  $(".restore-tags").click(function(e){restoreTags();return false;});

});
