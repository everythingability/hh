var x = 100 //just for demo purposes
var id, bmi, name, category, isDiabetic, isSmoker, weight, height, systolic, diastolic
var averageSystolic, averageDiastolic, age, ethnicity, averageMsg
var bloodPressureStatus = ''

//Information related
var homepage = 'Home.md' //where you want to start Information pages from

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('sw.js')
        .then(function () {
            console.log("Tada! Your service worker is now registered");
        });
};

var storageSize = Math.round(JSON.stringify(localStorage).length / 1024);
console.log("storage: " + storageSize)


//Use this function to retrieve cookies by their names
function getCookie(name) {
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    console.log(`cookie: ${value}`)
    return (value != null) ? unescape(value[1]) : null;
}


///////////////////////////////////////   ON LOAD ////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
    const profileSelect = document.getElementById("profileSelect");
    profileForm.setAttribute('display', "none");

    // Load profiles and profile data on page load
    loadAllProfiles();
    profileSelect.addEventListener("change", function () {
        loadProfileData(this.value);
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
      })

});

////////////////////////////////////// END ON LOAD //////////////////////////////////////////////


const getProfile = function (profileId) {
    var profile = JSON.parse(localStorage.getItem(profileId))
    return profile
};

/////////////////////// LOAD ALL PROFILES FROM localStorage ///////////////////
function loadAllProfiles() {

    const profiles = JSON.parse(localStorage.getItem("profiles")) || [];
    profileSelect.innerHTML = '';

    if (profiles.length > 0) {
        profileSelectDiv.style.display = "block";
        profiles.forEach(profile => {
            const option = document.createElement("option");
            //font-weight-bold
            //option.setAttribute('class', "font-weight-bold");
            option.value = profile.id;
            option.textContent = profile.fullName;
            profileSelect.appendChild(option);
        });

        //DO COOKIE
        var profileId = getCookie('profileId')

        // if cookie is null show create profile
        console.log(`Selected profileId is: ${profileId}`)
        if (profileId) {
            loadProfileData(profileId); // Load profile data for the selected profile

        } else {
            document.cookie = "profileId=" + profileSelect.value;
            loadProfileData(profileId); // Load profile data for the selected profile
        }

        /// END COOKIE

    } else {
        console.log("There are no profiles")
        //Show the createProfile form
        showProfileForm() /// THERE ISN'T ANY PROFILES SO MAKE ONE!!!! 
        profileSelectDiv.style.display = "none";
    }

}
///////////////////////////////////// END LOADS /////////////////////////////////


/////////////////////////////// LOAD A PROFILE /////////////////////////////////
function loadProfileData(profileId) {
    const profile = JSON.parse(localStorage.getItem(profileId));
    console.log(profile)

    if (profile) {
        profileForm.innerHTML = ``;
        profileForm.style.display = "none"; // Ensure profile form is not displayed
        
        let editProfileBtn = document.getElementById('editProfileButton');
        editProfileBtn.setAttribute('onclick', `editProfile('${profileId}'); `);
        editProfileBtn.setAttribute('display', 'block')

        //Select the relevant dropdown
        let element = document.getElementById('profileSelect');
        console.log(`profileId: ${profileId}`)
        element.value = profileId;   

        //downloadCSVBtn.style.display = "block";
        displayEntries(profileId);

        //Calculate personal details
        if (profile.isDiabetic == false){
            isDiabetic = "No"
        }else{
            isDiabetic = "Yes"
        }
        weight = profile.weight
        bmi = profile.weight / ((profile.height / 100) ** 2);
        bmi = bmi.toFixed(2)
        category = ''
        if (bmi < 18.5) {
            category = "Underweight";
        } else if (bmi < 25) {
            category = "Normal weight";
        } else if (bmi < 30) {
            category = "Overweight";
        } else {
            category = "Obese";
        }
        entry = getLastEntry(profileId)
        age = calculateAge(profile.birthDate)

       
        /*
        //BLOOD PRESSURE RANKINGS

IN CLINIC
        // > 180/120 mmHg -> Assess for target organ damage as soon as possible:
                Consider starting drug treatment immediately without ABPM/HBPM if
                target organ damage
                • Repeat clinic BP in 7days if no target organ damage

                Refer for same-day specialist review if:
                    • retinal haemorrhage or papilloedema
                    (accelerated hypertension) or
                    • life-threatening symptoms or
                    • suspected pheochromocytoma

        // 140/90 to 179/119 -> Offer ABPM (or HBPM if ABPM is declined or not tolerated),Investigate for target organ damage,Assess cardiovascular risk

        // > 140/90 high

        // < 135/85 medium --> check every five years

NOT IN CLINIC
        // > 150/95 mmHg or more

        // 135/85 to 149/94 mmHg (Stage 1)

        // Under 135/85 mmHg


        */
    
    
        ethnicity = profile.ethnicity

        document.getElementById("name").innerHTML = profile.fullName
        document.getElementById("bmi").innerHTML = bmi
        document.getElementById("weight").innerHTML = profile.weight
        document.getElementById("weightDisplay").innerHTML = profile.weight//in the header
        document.getElementById("category").innerHTML = category
        document.getElementById("age").innerHTML = age
        document.getElementById("isDiabetic").innerHTML = isDiabetic
        document.getElementById("ethnicity").innerHTML = ethnicity
        document.getElementById("averageBloodPressure").innerHTML = averageSystolic+"/"+averageDiastolic + "(" + bloodPressureStatus + ")"

        //show releveant sections of the screen
        bpForm.style.display = "block"; //show the blood pressure form
        entriesTable.style.display = "block";//show the entries table
        personalDetails.style.display = "block"
        hhNav.style.display = "block"
        informationNav.style.display = "block"
        editProfileButton.style.display = "block"
        content.style.display = "block"

        //Set the cookie so when you return you return to the same profile if you pop into the information
        document.cookie = "profileId=" + profile.id;
        
    }
}
/////////////////////////////// LOAD A PROFILE /////////////////////////////////

//////////////////////////////// CREATE NEW EMPTY PROFILE FORM EVENT ////////////////////////////////
function showProfileForm(){
    hhNav.style.display = "none"
    informationNav.style.display = "none"
    editProfileButton.style.display = "none"
    personalDetails.style.display = "none"

    profileForm.style.display = "block";
    bpForm.style.display = "none";
    entriesTable.style.display = "none";
    //downloadCSVBtn.style.display = "none";

    profileForm.innerHTML = "<h2>Create New Profile</h2>";
    profileForm.innerHTML += ``;

    //Build Ethnicities Dropdown select
    var ethnicitiesDropdown = ''
    ethnicities.forEach( function(ethnicity){
        ethnicitiesDropdown += `<option name="${ethnicity}" value="${ethnicity}" >${ethnicity}</option>`  
    });
    console.log(ethnicitiesDropdown)
    //End Ethnicities Dropdown

    const profileFields = [
        { label: '', id: 'id', type: 'hidden', value: generateUniqueId() },
        { label: 'Full Name:', id: 'fullName', type: 'text', value: "" },
        { label: 'Email:', id: 'email', type: 'email', value: "" },
        { label: 'Telephone:', id: 'telephone', type: 'tel', value: "" },
        { label: 'Birth Date:', id: 'birthDate', type: 'date', value: "" },
        { label: 'Ethnicity:', id: 'ethnicity', type: 'select', value: ethnicitiesDropdown },
        { label: 'Height (cm):', id: 'height', type: 'number', value: "" },
        { label: 'Weight (kg):', id: 'weight', type: 'number', value: "" },
        { label: 'Medications:', id: 'medications', type: 'textarea', value: "" },
        { label: 'Do you have type 2 diabetes?', id: 'isDiabetic', type: 'checkbox', value: "" },
        { label: 'Do you smoke?', id: 'isSmoker', type: 'checkbox', value: "" },
        { label: 'About Your Health:', id: 'healthInfo', type: 'textarea', value: "" },
    ];

    // Build Create Profile Form...

        profileFields.forEach(field => {

            // create the input
                /*const inputField = field.type === 'textarea' ?
                 `<textarea class="form-control" id="${field.id}">${field.value}</textarea>` :
                `<input type="${field.type}" class="form-control" id="${field.id}" value="${field.value}" ${field.disabled ? 'disabled' : ''} ${field.checked ? 'checked' : ''}>`;*/
    
            var inputField = ''
            switch(field.type) {
    
                case "hidden":
                    inputField += `<input type="${field.type}" class="form-control" id="${field.id}" value="${field.value}" ${field.disabled ? 'disabled' : ''} ${field.checked ? 'checked' : ''}><div class="form-helper helper">${field.helper || ""}</div>`
    
                    break;
    
                case "text":
                    inputField += `<input type="${field.type}" class="form-control" id="${field.id}" value="${field.value}" ${field.disabled ? 'disabled' : ''} ${field.checked ? 'checked' : ''}>
                    <div class="form-helper helper">${field.helper || ""}</div>`
    
                    break;
    
                case "checkbox":
                    inputField += `<input type="${field.type}" class="form-control d-inline-flex w-25" id="${field.id}" value="${field.value}" ${field.disabled ? 'disabled' : ''} ${field.checked ? 'checked' : ''}>
                    <div class="form-helper helper">${field.helper || ""}</div>`
    
                    break;
    
                case "textarea":
                    inputField += `<textarea rows="10" class="form-control" id="${field.id}">${field.value}</textarea>
                    <div class="form-helper helper">${field.helper || ""}</div>`
    
                    break;
    
                case "number":
                    inputField += `<input type="${field.type}" class="form-control" id="${field.id}" value="${field.value}" ${field.disabled ? 'disabled' : ''} ${field.checked ? 'checked' : ''}>
                    <div class="form-helper helper">${field.helper || ""}</div>`
    
                    break;
    
                case "email":
                    inputField += `<input type="${field.type}" class="form-control" id="${field.id}" value="${field.value}" ${field.disabled ? 'disabled' : ''} ${field.checked ? 'checked' : ''}>
                    <div class="form-helper helper">${field.helper || ""}</div>`
    
                    break;
    
                case "date":
                        inputField += `<input type="${field.type}" class="form-control" id="${field.id}" value="${field.value}" ${field.disabled ? 'disabled' : ''} ${field.checked ? 'checked' : ''}>
                        <div class="form-helper helper">${field.helper || ""}</div>`
        
                        break;
    
                case "tel":
                    inputField += `<input type="${field.type}" class="form-control" id="${field.id}" value="${field.value}" >
                    <div class="form-helper helper">${field.helper || ""}</div>`
    
                    break;

                case "select":
                    inputField += `<select class="form-control" id="${field.id}" >${field.value}</select>
                    <div class="form-helper helper">${field.helper || ""}</div>`
    
                    break;

    
                default:
                    
                    inputField += `<input type="text" class="form-control" id="${field.id}" value="${field.value}" ${field.disabled ? 'disabled' : ''} ${field.checked ? 'checked' : ''}>`
                    
                }     

        const formGroup = document.createElement("div");
        formGroup.classList.add("form-group");
        formGroup.innerHTML = `<label for="${field.id}">${field.label}</label>${inputField}`;
        profileForm.appendChild(formGroup);
    });

    const saveProfileBtn = document.createElement("button");
    saveProfileBtn.id = "saveProfileBtn";
    saveProfileBtn.classList.add("btn", "btn-primary");
    saveProfileBtn.textContent = "Save Profile";
    saveProfileBtn.addEventListener("click", saveProfile);
    profileForm.appendChild(saveProfileBtn);

    const cancelProfileBtn = document.createElement("button");
    cancelProfileBtn.id = "cancelProfileBtn";
    cancelProfileBtn.classList.add("btn", "btn-secondary");
    cancelProfileBtn.textContent = "Cancel";
    cancelProfileBtn.addEventListener("click", cancelProfile);
    profileForm.appendChild(cancelProfileBtn);

    //document.getElementById("weight").value = profile.weight

}


createProfileBtn.addEventListener("click", function () {
    showProfileForm()
});


//////////////////////////////// END CREATE NEW PROFILE FORM EVENT ////////////////////////////////
var ethnicities =[
    "Afro-Latino",
    "African-Caribbean",
    "Black African",
    "Asian (including East Asian, South Asian, Southeast Asian)",
    "Hispanic/Latinx",
    "Indigenous Australian",
    "Maori (New Zealand)",
    "Mediterranean",
    "Middle Eastern/North African",
    "Mixed Race/Multiracial",
    "Native American/Indigenous",
    "Pacific Islander",
    "Slavic/Eastern European",
    "White/Caucasian",
]
/////////////////////  EDIT PROFILE FORM ///////////////////////////////
window.editProfile = function (profileId) {
    hhNav.style.display = "none"
    informationNav.style.display = "none"
    editProfileButton.style.display = "none"
    content.style.display = "none"
    personalDetails.style.display = "none"


    const profile = JSON.parse(localStorage.getItem(profileId));
    profileForm.innerHTML = "<h2>Edit Profile</h2>";
    profileForm.innerHTML += `<!-- Profile form fields will be dynamically generated here -->`;
    console.log('editProfle: ' + profile.id)
    if (profile.id == "") profile.id = generateUniqueId()

    //Build Ethnicities Dropdown select
    var ethnicitiesDropdown = ''
    ethnicities.forEach( function(ethnicity){
        console.log( profile.ethnicity, ethnicity)
        var selected= ''
        if (profile.ethnicity == ethnicity){
            selected = ' selected '
        }
        ethnicitiesDropdown += `<option name="${ethnicity}" value="${ethnicity}" ${selected}>${ethnicity}</option>`

    });
    console.log(ethnicitiesDropdown)
    //End Ethnicities Dropdown

    const profileFields = [
        { label: '', id: 'id', type: 'hidden', value: profile.id },
        { label: 'Full Name:', id: 'fullName', type: 'text', value: profile.fullName },
        { label: 'Email:', id: 'email', type: 'email', value: profile.email, helper: "This isn't shared ever, but is included in your spreadsheet data that you can download." },
        { label: 'Telephone:', id: 'telephone', type: 'tel', value: profile.telephone, helper: "This isn't shared ever, but is included in your spreadsheet data that you can download." },
        { label: 'Birth Date:', id: 'birthDate', type: 'date', value: profile.birthDate,helper: "This is used to calculate your BMI and used to help make the Information section more useful" },
        { label: 'Ethnicity:', id: 'ethnicity', type: 'select', value: ethnicitiesDropdown, helper: "This is used to tailor the Information section too" },
        { label: 'Height (cm):', id: 'height', type: 'number', value: profile.height, helper: "Used to calculate BMI" },
        { label: 'Weight (kg):', id: 'weight', type: 'number', value: profile.weight, helper: "Used to calculate BMI" },
        { label: 'Medications:', id: 'medications', type: 'textarea', value: profile.medications },
        { label: 'Do you have type 2 diabetes?', id: 'isDiabetic', type: 'checkbox', checked: profile.isDiabetic },
        { label: 'Do you smoke?', id: 'isSmoker', type: 'checkbox', checked: profile.isSmoker },
        { label: 'About Your Health:', id: 'healthInfo', type: 'textarea', value: profile.healthInfo },

    ];

    profileFields.forEach(field => {

        var inputField = ''
        switch(field.type) {

            case "hidden":
                inputField += `<input type="${field.type}" class="form-control" id="${field.id}" value="${field.value}" ${field.disabled ? 'disabled' : ''} ${field.checked ? 'checked' : ''}><div class="form-helper helper">${field.helper || ""}</div>`

                break;

            case "text":
                inputField += `<input type="${field.type}" class="form-control" id="${field.id}" value="${field.value}" ${field.disabled ? 'disabled' : ''} ${field.checked ? 'checked' : ''}>
                <div class="form-helper helper">${field.helper || ""}</div>`

                break;

            case "checkbox":
                inputField += `<input type="${field.type}" class="form-control d-inline-flex w-25" id="${field.id}" value="${field.value}" ${field.disabled ? 'disabled' : ''} ${field.checked ? 'checked' : ''}>
                <div class="form-helper helper">${field.helper || ""}</div>`

                break;

            case "textarea":
                inputField += `<textarea rows="10" class="form-control" id="${field.id}">${field.value}</textarea>
                <div class="form-helper helper">${field.helper || ""}</div>`

                break;

            case "number":
                inputField += `<input type="${field.type}" class="form-control" id="${field.id}" value="${field.value}" ${field.disabled ? 'disabled' : ''} ${field.checked ? 'checked' : ''}>
                <div class="form-helper helper">${field.helper || ""}</div>`

                break;

            case "email":
                inputField += `<input type="${field.type}" class="form-control" id="${field.id}" value="${field.value}" ${field.disabled ? 'disabled' : ''} ${field.checked ? 'checked' : ''}>
                <div class="form-helper helper">${field.helper || ""}</div>`

                break;

            case "date":
                    inputField += `<input type="${field.type}" class="form-control" id="${field.id}" value="${field.value}" ${field.disabled ? 'disabled' : ''} ${field.checked ? 'checked' : ''}>
                    <div class="form-helper helper">${field.helper || ""}</div>`
    
                    break;

            case "tel":
                inputField += `<input type="${field.type}" class="form-control" id="${field.id}" value="${field.value}" >
                <div class="form-helper helper">${field.helper || ""}</div>`

                break;

            case "select":
                    inputField += `<select class="form-control" id="${field.id}" >${field.value}</select>
                    <div class="form-helper helper">${field.helper || ""}</div>`
    
                    break;

            default:
                
                inputField += `<input type="text" class="form-control" id="${field.id}" value="${field.value}" ${field.disabled ? 'disabled' : ''} ${field.checked ? 'checked' : ''}>`
                
            }     

        //create a formGroup
        const formGroup = document.createElement("div");

        //add a label
        formGroup.classList.add("form-group");
        //
        formGroup.classList.add("align-items-start");
        formGroup.innerHTML = `<label for="${field.id}">${field.label}</label>${inputField}`;

        profileForm.appendChild(formGroup);
        profileForm.style.display = "block";
    });

    const saveProfileBtn = document.createElement("button");
    saveProfileBtn.id = "saveProfileBtn";
    saveProfileBtn.classList.add("btn", "btn-primary");
    saveProfileBtn.textContent = "Save Profile";
    saveProfileBtn.addEventListener("click", saveProfile);
    profileForm.appendChild(saveProfileBtn);

    const cancelProfileBtn = document.createElement("button");
    cancelProfileBtn.id = "cancelProfileBtn";
    cancelProfileBtn.classList.add("btn", "btn-secondary");
    cancelProfileBtn.textContent = "Cancel";
    cancelProfileBtn.addEventListener("click", cancelProfile);
    profileForm.appendChild(cancelProfileBtn);

    hideHH()

    
}

function hideBPForm(){
    console.log('hiding blood pressure form')
    const bpForm = document.getElementById("bpForm");
    bpForm.style.display = "none";
}

function hideEntries(){
    console.log('hiding blood pressure entries table')
    const entriesTable = document.getElementById("entriesTable");
    entriesTable.style.display = "none";
}

function hideHH(){ 
    hideBPForm()
    hideEntries()
}

///////////////////// END CREATE EDIT PROFILE FORM ///////////////////////////////


//////////////////////////////// SAVE PROFILE //////////////////////////////////////////////////
function saveProfile(event) {
    hhNav.style.display = "block"
    informationNav.style.display = "block"
    editProfileButton.style.display = "block"
    personalDetails.style.display = "block"
    content.style.display = "block"

    event.preventDefault();
    const id = document.getElementById("id").value;
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const birthDate = document.getElementById("birthDate").value;

    const ethnicityElement = document.getElementById("ethnicity");
    var ethnicity = ethnicityElement.options[ethnicityElement.selectedIndex].text;
    console.log(`ethnicity: ${ethnicity}`)

    const height = document.getElementById("height").value;
    const weight = document.getElementById("weight").value;
    const medications = document.getElementById("medications").value;
    const isDiabetic = document.getElementById("isDiabetic").checked;
    const isSmoker = document.getElementById("isSmoker").checked;
    const healthInfo = document.getElementById("healthInfo").value;
    const telephone = document.getElementById("telephone").value;


    const profile = { id, fullName, email, birthDate, ethnicity, height, weight, medications, isDiabetic,isSmoker, healthInfo, telephone };
    localStorage.setItem(id, JSON.stringify(profile));

    const profiles = JSON.parse(localStorage.getItem("profiles")) || [];
    const existingProfileIndex = profiles.findIndex(p => p.id === id);
    if (existingProfileIndex !== -1) {
        profiles.splice(existingProfileIndex, 1, profile);
    } else {
        profiles.push(profile);
    }
    localStorage.setItem("profiles", JSON.stringify(profiles));
    loadAllProfiles();
    console.log(`id: ${id} for email:${email}`)
    loadProfileData(id); // Automatically select and load the newly created profile
    //alert("Profile saved successfully!");

  
    document.getElementById("weight").value = profile.weight
}
/////////////////////////// END SAVE PROFILE ////////////////////////////////////


///////////////////////////////// DISPLAY ENTRIES IN TABLE /////////////////////////////////
function displayEntries(profileId) {
    console.log(`displayEntries: ${profileId} `)
    var profile = getProfile(profileId)

    entriesBody.innerHTML = '';
    const entries = JSON.parse(localStorage.getItem(profileId + "_entries")) || [];

    var count = 0
    var systolicSum = 0
    var diastolicSum = 0
    console.log( "num of entries: " , entries.length)
    if (entries.length > 1){
        entries.forEach(entry => {
            //tidy up the timestamp
            var timestamp = entry.timestamp.replace(",", "<br>")
            timestamp = timestamp.substring(0, timestamp.length-3);//chop last :34 secs off.
            //tidy up the timestamp

            const row = document.createElement("tr");
            systolicSum += Number(entry.systolic)
            diastolicSum += Number(entry.diastolic)
            count ++

            row.innerHTML = `
            <td>${timestamp}</td>
            <td>${entry.systolic}</td>
            <td>${entry.diastolic}</td>
            <td>${entry.weight}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteEntry('${profileId}', '${entry.id}')">Delete</button></td>
        `;
            entriesBody.appendChild(row);
        });
   

        //Add average to table
        averageSystolic = Math.round( systolicSum/count)
        averageDiastolic = Math.round( diastolicSum/count)
        console.log("Average:", averageSystolic, "/", averageDiastolic)
        averageMsg = averageSystolic + "/" + averageDiastolic

        if (averageSystolic >=150 & averageDiastolic >= 95){
            // HIGH
            bloodPressureStatus = "High"
        }else if (averageSystolic >=135 & averageDiastolic >= 85){
            //MEDIUM
            bloodPressureStatus = "Medium"
        }else if (averageSystolic <135 & averageDiastolic < 85){
            bloodPressureStatus = "Low"

        }
        console.log("averageMsg:", averageMsg)
        console.log(`averageSystolic:`, averageSystolic , "/", "averageDiastolic", averageDiastolic)
        console.log(`bloodPressureStatus: ${bloodPressureStatus}`)
        document.getElementById("average").innerHTML = "Your average reading is: " +  averageMsg
   }



}
///////////////////////////////// END DISPLAY ENTRIES /////////////////////////////


/////////////////////////////// ADD BLOOD PRESSURE ENTRY ///////////////////////////
bpForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const profileId = profileSelect.value;
    const systolic = document.getElementById("systolic").value;
    const diastolic = document.getElementById("diastolic").value;
    const weight = document.getElementById("weight").value;
    const notes = document.getElementById("notes").value;

    //update profile to most recent weight
    var profile = getProfile(profileId) //update profile
    profile.weight = weight
    localStorage.setItem(profileId, JSON.stringify(profile));

    //create a new diary entry
    const timestamp = new Date().toLocaleString({dateStyle:"short", timeStyle:"short"});
    const id = generateUniqueId();
    const entry = { id, systolic, diastolic, weight, timestamp, notes };
    const entries = JSON.parse(localStorage.getItem(profileId + "_entries")) || [];
    entries.push(entry);
    localStorage.setItem(profileId + "_entries", JSON.stringify(entries));

    displayEntries(profileId);
    document.getElementById("bpForm").reset(); // Clear form
    document.getElementById("weight").value = profile.weight

});
//////////////////////////// END ADD ENTRY //////////////////////////////////////////////////////





/////////////////////////// GET LAST ENTRY IN THE BLOOD PRESSURE DIARY ///////////////////////
function getLastEntry(profileId) {
    console.log(`getLastEntry: ${profileId} `)
    const entries = JSON.parse(localStorage.getItem(profileId + "_entries")) || [];
    console.log(entries)
    return entries.pop()
}
//////////////////////// END GET LAST ENTRY IN THE BLOOD PRESSURE DIARY ///////////////////////



// Delete blood pressure entry
window.deleteEntry = function (profileId, entryId) {
    const entries = JSON.parse(localStorage.getItem(profileId + "_entries")) || [];
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    localStorage.setItem(profileId + "_entries", JSON.stringify(updatedEntries));
    displayEntries(profileId);
}

function cancelProfile(event) {
    loadAllProfiles();
}





////////////////////////////////// UTILITIES /////////////////////////////////////////////////////

function calculateAge(birthDate) {
    var diff_ms = Date.now() - new Date(birthDate)
    var age_dt = new Date(diff_ms);
    var age = Math.abs(age_dt.getUTCFullYear() - 1970);
    return age
}

// Function to generate unique ID
function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}
////////////////////////////////// END UTILITIES /////////////////////////////////////////////////////




//////////////////////// MARKDOWN INFORMATION PAGES ////////////////////////////

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
    hideHH()
    $.ajaxSetup({ cache: false });
    console.log("loadPage:", markdownFileName)
    $.get("information/" + markdownFileName, function (data) {
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


//////////////////////// END MARKDOWN INFORMATION PAGES ////////////////////////////


///////////////// Download profile information and blood pressure entries as CSV ///////////////////////
downloadCSVBtn.addEventListener("click", function () {
    const profileId = profileSelect.value;
    const profiles = JSON.parse(localStorage.getItem("profiles")) || [];
    const profile = profiles.find(p => p.id === profileId);
    const entries = JSON.parse(localStorage.getItem(profileId + "_entries")) || [];

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Profile Information\n";
    csvContent += "Full Name,Email,Birth Date,Ethnicity,Height (cm),Weight (kg),Medications,Diabetic,About Your Health,Telephone\n";
    csvContent += `${profile.fullName},${profile.email},${profile.birthDate},${profile.ethnicity},${profile.height},${profile.weight},"${profile.medications}",${profile.isDiabetic ? 'Yes' : 'No'},"${profile.healthInfo}",${profile.telephone || 'Not provided'}\n\n`;
    csvContent += "Blood Pressure Entries\n";
    csvContent += "Timestamp,Systolic,Diastolic,Weight (kg)\n";
    entries.forEach(entry => {
        csvContent += `${entry.timestamp},${entry.systolic},${entry.diastolic},${entry.weight}\n`;
    });

    const encodedURI = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedURI);
    link.setAttribute("download", `${profile.fullName}_data.csv`);
    document.body.appendChild(link);
    link.click();
});
///////////////// END Download profile information and blood pressure entries as CSV ///////////////////////
