/*
 Personal bookmarks

 Matthew Hasselfield, 2011

 Based heavily on:
     bookmark_page.js, ver. 1.0
     visit: www.pdfhacks.com/bookmark_page/

 hashify adapted from hashCode for javascript from:
     http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/

*/

// Set to true to enable console and debug messages.
var debug_mode = false;

// prefix for bookmark variables
var bm_prefix = "pbm_";

// use this delimiter for serializing our array
var bp_delim= '%#%#';

/*
  Print to console if in debug mode.
*/
function debugPrint( text ) {
  if (debug_mode) {
    console.println(text);
  }
}

function hashify(s) {
  var hash = 0;
  debugPrint('Asked to hash ' + String(s));
  for (i = 0; i < s.length; i++) {
    char = s.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & 0xffffffff; // Convert to 32bit integer
  }
  if (hash < 0) {
    hash = 4294967296. + hash;
  }
  return hash.toString(16);
}

function SaveString(vname, data ) {
  if (data==null) {
    eval('delete global.' + vname + ';');
  } else {
    eval('global.' + vname + ' = data;');
    global.setPersistent(vname, true);
  }
}

function LoadMarks( vname ) {
  var s = eval('global.' + vname);
  if (s == null)
    return [];
  var data = [];
  var words = s.split(bp_delim);
  for (i=0; i<words.length/2-1; i++) 
    data.push([words[i*2],words[i*2+1]]);
  return data;
}

function SaveMarks(vname, data) {
  if (data == null || data.length == 0)
    return SaveString(vname, null);
  outstr = '';
  for (i=0; i<data.length; i++) {
    debugPrint(String(data[i][0]));
    outstr += String(data[i][0]) + bp_delim;
    outstr += String(data[i][1]) + bp_delim;
  }
  SaveString(vname, outstr);
}


function MakeMenu(data, code) {
  var my_menu = [];
  for (i=0; i<data.length; i++)
    my_menu.push({cName: data[i][1], cReturn: code+i});
  return my_menu;
}

function SuperMenu() {
  data_name = bm_prefix + hashify(this.path);
  data = LoadMarks(data_name);
  my_menu = [{cName: "Goto",      oSubMenu: MakeMenu(data, '=')},
	     {cName: "Update",    oSubMenu: MakeMenu(data, '+')},
	     {cName: "Remove",    oSubMenu: MakeMenu(data, '-')},
	     {cName: "Add",       cReturn: "add"},
	     {cName: "Clear all", cReturn: "clear"}
	     ];
  result = app.popUpMenuEx.apply(app, my_menu);
  if (result == null)
    return;
  if (result == "clear") {
    if( app.alert("Are you sure you want to erase all bookmarks for this document?",
		  2, 2 ) == 4 ) {
      SaveMarks(data_name, null);
    }
    return;
  }
  if (result == "add") {
    var name = app.response( "Bookmark Name:", "Bookmark Name", "", false);
    if (name != null) {
      data.push([this.pageNum, name]);
      SaveMarks(data_name, data);
    }
    return;
  }
  code = result.substring(0,1);
  index = result.substring(1);
  debugPrint(code);
  debugPrint(index);
  switch(code) {
  case '=':
    this.pageNum = data[index][0];
    break;
  case '+':
    data[index][0] = this.pageNum;
    SaveMarks(data_name, data);
    break;
  case '-':
    data.splice(index, 1);
    SaveMarks(data_name, data);
    break;
  }
}
	     
function BookmarkDebugFunction() {
  debugPrint(hashify(this.pageNum));
  debugPrint(hashify(this.path));
  
}

if (debug_mode) {
  console.clear(); console.show();
  console.println("Loading bookmarker.");
  debugPrint(hashify("test"));
 }

app.addMenuItem( {
cName: "-",              // menu divider
cParent: "View",         // append to the View menu
cExec: "void(0);" } );

app.addMenuItem( {
cName: "Personal &Bookmarks",
cParent: "View",
cExec: "SuperMenu();",
cEnable: "event.rc= (event.target != null);" } );

if (debug_mode) {
  app.addMenuItem( {
    cName: "Debug function",
	cParent: "View",
	cExec: "BookmarkDebugFunction();",
	cEnable: "event.rc= true;" } );
 
}