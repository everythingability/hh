
var twineLink = "" //gets populated with search args to pump Twine project
var averageSystolic
var averageDiastolic 
var averageMsg

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
        showProfileForm() /// THERE ISN'T ONE SO MAKE ONE!!!! 
        profileSelectDiv.style.display = "none";
    }

}
///////////////////////////////////// END LOADS /////////////////////////////////


/////////////////////////////// LOAD A PROFILE /////////////////////////////////
function loadProfileData(profileId) {
    const profile = JSON.parse(localStorage.getItem(profileId));
    console.log(profile)

    if (profile) {
        profileForm.innerHTML = `
    <h2 class="mb-3">Profile Details</h2>

    <strong>Full Name:</strong> ${profile.fullName}<br>
    <strong>Email:</strong> ${profile.email}<br>
    <strong>Telephone:</strong> ${profile.telephone || 'Not provided'}<br>
    <strong>Birth Date:</strong> ${profile.birthDate}<br>
    <strong>Ethnicity:</strong> ${profile.ethnicity}<br>
    <strong>Height (cm):</strong> ${profile.height}<br>
    <strong>Weight (kg):</strong> ${profile.weight}<br>
    <strong>Medications:</strong> ${profile.medications}<br>
    <strong>Do you have Type 2 Diabetes:</strong> ${profile.isDiabetic ? 'Yes' : 'No'}<br>
    <strong>About Your Health:</strong> ${profile.healthInfo}<br><br>
  
    
  `;
        profileForm.style.display = "none"; // Ensure profile form is not displayed
        
        let editProfileBtn = document.getElementById('editProfileButton');
        editProfileBtn.setAttribute('onclick', `editProfile('${profileId}'); `);

        //Select the relevant dropdown
        let element = document.getElementById('profileSelect');
        console.log(`profileId: ${profileId}`)
        element.value = profileId;

        bpForm.style.display = "block"; //show the blood pressure form
        entriesTable.style.display = "block";//show the entries table

        //downloadCSVBtn.style.display = "block";
        displayEntries(profileId);


        //fixup Twine link //     
        makeTwineLink(profile)


        //Set the cookie so when you return you return to the same profile if you pop into the information
        document.cookie = "profileId=" + profile.id;
        document.getElementById("weight").value = profile.weight ; // in the form to the last weight entered
    }
}
/////////////////////////////// LOAD A PROFILE /////////////////////////////////

//////////////////////////////// CREATE NEW EMPTY PROFILE FORM EVENT ////////////////////////////////
function showProfileForm(){
    hhNav.style.display = "none"
    informationNav.style.display = "none"
    editProfileButton.style.display = "none"

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

    hideBPForm()
    hideEntries()
    
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

///////////////////// END CREATE EDIT PROFILE FORM ///////////////////////////////


//////////////////////////////// SAVE PROFILE //////////////////////////////////////////////////
function saveProfile(event) {
    hhNav.style.display = "block"
    informationNav.style.display = "block"
    editProfileButton.style.display = "block"

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
    const healthInfo = document.getElementById("healthInfo").value;
    const telephone = document.getElementById("telephone").value;


    const profile = { id, fullName, email, birthDate, ethnicity, height, weight, medications, isDiabetic, healthInfo, telephone };
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

    makeTwineLink(getProfile(id))
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

    //update profile to most recent weight
    var profile = getProfile(profileId) //update profile
    profile.weight = weight
    localStorage.setItem(profileId, JSON.stringify(profile));

    //create a new diary entry
    const timestamp = new Date().toLocaleString({dateStyle:"short", timeStyle:"short"});
    const id = generateUniqueId();
    const entry = { id, systolic, diastolic, weight, timestamp };
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







//////////////////// UTILITIES /////////////////////////////////////////////////////

function makeTwineLink(profile) {
    //Calculate BMI
    let bmi = profile.weight / ((profile.height / 100) ** 2);
    bmi = bmi.toFixed(2)
    var category = ''
    if (bmi < 18.5) {
        category = "Underweight";
    } else if (bmi < 25) {
        category = "Normal weight";
    } else if (bmi < 30) {
        category = "Overweight";
    } else {
        category = "Obese";
    }

    var age = calculateAge(profile.birthDate)

    // DO WEIGHT
    try {
        let weightInput = document.getElementById('weight');
        weightInput.value = profile.weight
    } catch (e) {
        console.log("no weight")
    }


    let entry = getLastEntry(profile.id)
    console.log("lastEntry:", entry)

    //Make the link
    var query = '?'
    query += "id=" + profile.id + "&"
    query += "ethnicity=" + encodeURIComponent(profile.ethnicity) + "&"
    query += "age=" + encodeURIComponent(age) + "&"
    query += "bmi=" + encodeURIComponent(bmi) + "&"
    query += "medications=" + encodeURIComponent(profile.medications) + "&"
    query += "name=" + encodeURIComponent(profile.fullName) + "&"
    query += "diabetic=" + encodeURIComponent(profile.isDiabetic) + "&"
    query += "weight=" + encodeURIComponent(profile.weight) + "&"

    if (entry){

        query += "systolic=" + encodeURIComponent(entry.systolic) + "&"
        query += "diastolic=" + encodeURIComponent(entry.diastolic) + "&"
        query += "category=" + encodeURIComponent(category) + "&"

        query += "averageSystolic=" + averageSystolic + "&"
        query += "averageDiastolic=" + averageDiastolic + "&"
        query += "random=" + Math.random() + "&"
        console.log("They need to add a blood pressure reading")
        
    }else{
        query += "msg=" + encodeURIComponent("You need to add your first reading.") + "&"
    }
   
   
    //

    twineLink = 'information/Information.html' + query
    link = document.getElementById('twineLink')
    link.setAttribute("href", twineLink);
    console.log("twineLink:" + twineLink)

}

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