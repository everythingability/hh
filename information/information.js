 var x = 100 //just for demo purposes
    var homepage = 'Home.md' //where you want to start from

    window.onhashchange = function() { //When someone clicks the back/forward buttons.
        var hash = window.location.hash.replace("#", "")
        if ( hash != '' ){
            //console.log("hash:", hash)
            loadPage(hash)
        }else{
            //console.log(window.location)
            loadPage(homepage)
        }
    
      }   
    
    //handles links like this <a href="javascript:loadPage('MyMarkdownFile.md')">
    function loadPage(markdownFileName) {
        console.log("loadPage:", markdownFileName)
        $.get(markdownFileName, function (data) {
            html = myParse(data, markdownFileName)
            $('#content').html(html);
        }, 'text');

        document.title = decodeURIComponent(markdownFileName.replace(".md", ""))//Set the browser's title to the name of the file.
        window.location.hash = `${markdownFileName}`; //append the pages' url with #MyMarkDownFile.md
        
    }

    /* Turns markdown links and images into HTML links and images*/
    function fixLinks(markdownContent) {
        var regex = /(\!\[([^\[\]]+)\]\(([^\)]+)\))|(\[([^\[\]]+)\]\(([^\)]+)\))/g; //find markdown images and links.

        let match;
        while ((match = regex.exec(markdownContent)) !== null) {
            if (match[1]) {
                var text = match[2];
                var link = match[3];
                /*console.log("Type: Image", text, link);*/
                markdownContent = markdownContent.replace(`![${text}](${link})`, `<img src="${link}" alt="${text}">`)

            } else {
                var text = match[5];
                var link = match[6];
                /*console.log("Type: Link", text, link);*/
                if (link.startsWith("http")){
                    markdownContent = markdownContent.replace(`[${text}](${link})`, `<a href="${link}" target="_blank">${text}</a>`)
                }else{
                    link = link.replace("../", '') //fix "backup relative links"
                    markdownContent = markdownContent.replace(`[${text}](${link})`, `<a href="javascript:loadPage('${link}')">${text}</a>`)
                }
            }
        }

        return markdownContent
    }


    function myParse(data) {
        // maybe get any meta data from the page at this point or do some other wizardry?
        data = fixLinks(data)          
        var html = marked.parse(data) // Use the marked.js lib to turn markdown into HTML
        return html
    }


  //////////////// get vars from url ////////////////////
var id, bmi, name, category, isDiabetic, weight, height, systolic, diastolic
var averageSystolic, averageDiastolic, age, ethnicity

function getVars(){
  console.log( "vars", new URLSearchParams(window.location.search))
  if (new URLSearchParams(window.location.search).size != 0){
    id = new URLSearchParams(window.location.search).get('id') || 30
    bmi = new URLSearchParams(window.location.search).get('bmi') || 30
    //console.log('bmi:', bmi)

    name = new URLSearchParams(window.location.search).get('name') || "Mr Test"
    console.log('name:', name, "id:", id)
   
    category = new URLSearchParams(window.location.search).get('category') || "Normal weight"
    //console.log('category:', category)

    isDiabetic =new URLSearchParams(window.location.search).get('diabetic') || "Yes"
    if (isDiabetic == false){
        isDiabetic = "No"
    }else{
        isDiabetic = "Yes"
    }

    weight = new URLSearchParams(window.location.search).get('weight') || 66
    //console.log('weight:', weight)

    height = new URLSearchParams(window.location.search).get('height') || 66
    ethnicity = new URLSearchParams(window.location.search).get('ethnicity') || "?"
    //console.log('height:', height)

    systolic = new URLSearchParams(window.location.search).get('systolic') || 0
    //console.log('systolic:', systolic)

    diastolic = new URLSearchParams(window.location.search).get('diastolic') || 100
    //console.log('diastolic:', diastolic)

    systolic = new URLSearchParams(window.location.search).get('systolic') || 0
    //console.log('systolic:', systolic)

    averageSystolic = new URLSearchParams(window.location.search).get('averageSystolic') || 0
    //console.log('averageSystolic:', averageSystolic)

    averageDiastolic = new URLSearchParams(window.location.search).get('averageDiastolic') || 0
    //console.log('averageDiastolic:', averageDiastolic)

    age = new URLSearchParams(window.location.search).get('age') || 57
    //console.log('age:', age)
    }
    document.getElementById("name").innerHTML = name
    document.getElementById("bmi").innerHTML = bmi
    document.getElementById("weight").innerHTML = weight
    document.getElementById("category").innerHTML = category
    document.getElementById("age").innerHTML = age
    document.getElementById("isDiabetic").innerHTML = isDiabetic
    document.getElementById("ethnicity").innerHTML = ethnicity
    document.getElementById("averageBloodPressure").innerHTML = averageSystolic+"/"+averageDiastolic

}

 //When the page has finished loading.... load your homepage
  $(document).ready(function () {
      // I wonder if I should add a list of files here, to preprocess, so that I could create a search engine
      //Or something... sort of loop through all the files, create a word list, tag cloud or something. 
      //I mean, it'd be super hacky but easy to implement maybe.
      
      if (window.location.hash){
          var file = window.location.hash.replace("#", "")
          console.log(`file: ${file}`)
          if ( file != null && file.endsWith('.md') ){
              homepage = file
          }
      }
        
      $.get(homepage, function (data) {
        console.log("Loading homepage...", homepage)
         // console.log(data)
          html = myParse(data)
          //console.log("html:", html)
          $('#content').html(html);
      }, 'text');

      getVars()

  });