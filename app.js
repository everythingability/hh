
var twineLink = "" //gets populated with search args to pump Twine project

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


////////////////////////   ON LOAD ////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
    const profileSelect = document.getElementById("profileSelect");
    profileForm.setAttribute('display', "none");

    // Load profiles and profile data on page load
    loadAllProfiles();
    profileSelect.addEventListener("change", function () {
        loadProfileData(this.value);
    });

});
///////////////////////////// END ON LOAD ///////////////////////////


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
        //editProfile('${profileId}')  editProfileButton
        let editProfileBtn = document.getElementById('editProfileButton');
        editProfileBtn.setAttribute('onclick', `editProfile('${profileId}'); `);


        profileForm.style.display = "none"; // Ensure profile form is displayed

        //Select the dropdown
        let element = document.getElementById('profileSelect');
        console.log(`profileId: ${profileId}`)
        element.value = profileId;

        bpForm.style.display = "block";
        entriesTable.style.display = "block";

        downloadCSVBtn.style.display = "block";
        displayEntries(profileId);


        //fixup Twine link //     
        makeTwineLink(profile)


        //Set the cookie so when you return you return to the same profile if you pop into the information
        document.cookie = "profileId=" + profile.id;
        document.getElementById("weight").value = profile.weight
    }
}
/////////////////////////////// LOAD A PROFILE /////////////////////////////////

//////////////////////////////// CREATE NEW EMPTY PROFILE FORM EVENT ////////////////////////////////
function showProfileForm(){
    profileForm.style.display = "block";
    bpForm.style.display = "none";
    entriesTable.style.display = "none";
    downloadCSVBtn.style.display = "none";

    profileForm.innerHTML = "<h2>Create New Profile</h2>";
    profileForm.innerHTML += `
  <!-- Profile form fields will be dynamically generated here -->
`;
    const profileFields = [
        { label: '', id: 'id', type: 'hidden', value: generateUniqueId() },
        { label: 'Full Name:', id: 'fullName', type: 'text', value: "" },
        { label: 'Email:', id: 'email', type: 'email', value: "" },
        { label: 'Telephone:', id: 'telephone', type: 'tel', value: "" },
        { label: 'Birth Date:', id: 'birthDate', type: 'date', value: "" },
        { label: 'Ethnicity:', id: 'ethnicity', type: 'text', value: "" },
        { label: 'Height (cm):', id: 'height', type: 'number', value: "" },
        { label: 'Weight (kg):', id: 'weight', type: 'number', value: "" },
        { label: 'Medications:', id: 'medications', type: 'textarea', value: "" },
        { label: 'Do you have type 2 diabetes?:', id: 'isDiabetic', type: 'checkbox', value: "" },
        { label: 'About Your Health:', id: 'healthInfo', type: 'textarea', value: "" },
    ];

    profileFields.forEach(field => {

        const inputField = field.type === 'textarea' ? `<textarea class="form-control" id="${field.id}"></textarea>` :
            `<input type="${field.type}" class="form-control" id="${field.id}" value="${field.value}">`;
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

///////////////////// CREATE EDIT PROFILE FORM ///////////////////////////////
window.editProfile = function (profileId) {
    const profile = JSON.parse(localStorage.getItem(profileId));
    profileForm.innerHTML = ''//"<h2>Edit Profile</h2>";
    profileForm.innerHTML += `<!-- Profile form fields will be dynamically generated here -->`;
    console.log('editProfle: ' + profile.id)
    if (profile.id == "") profile.id = generateUniqueId()

        const profileFields = [
            { label: '', id: 'id', type: 'hidden', value: profile.id },
            { label: 'Full Name:', id: 'fullName', type: 'text', value: profile.fullName },
            { label: 'Email:', id: 'email', type: 'email', value: profile.email, helper: "This isn't shared ever, but is included in your spreadsheet data that you can download." },
            { label: 'Telephone:', id: 'telephone', type: 'tel', value: profile.telephone, helper: "This isn't shared ever, but is included in your spreadsheet data that you can download." },
            { label: 'Birth Date:', id: 'birthDate', type: 'date', value: profile.birthDate,helper: "This is used to calculate your BMI and used to help make the Information section more useful" },
            { label: 'Ethnicity:', id: 'ethnicity', type: 'text', value: profile.ethnicity, helper: "This is used to tailor the Information section too" },
            { label: 'Height (cm):', id: 'height', type: 'number', value: profile.height, helper: "Used to calculate BMI" },
            { label: 'Weight (kg):', id: 'weight', type: 'number', value: profile.weight, helper: "Used to calculate BMI" },
            { label: 'Medications:', id: 'medications', type: 'textarea', value: profile.medications },
            { label: 'Do you have type 2 diabetes?', id: 'isDiabetic', type: 'checkbox', checked: profile.isDiabetic },
            { label: 'About Your Health:', id: 'healthInfo', type: 'textarea', value: profile.healthInfo },

    ];

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

    event.preventDefault();
    const id = document.getElementById("id").value;
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const birthDate = document.getElementById("birthDate").value;
    const ethnicity = document.getElementById("ethnicity").value;
    /*
    <div class="form-group">
        <label for="ethnicity">Ethnicity:</label>
        <select class="form-control" id="ethnicity" required>
          <option value="">Select Ethnicity</option>
          <option value="akan">Akan</option>
          <option value="amhara">Amhara</option>
          <option value="ashanti">Ashanti</option>
          <option value="bantu">Bantu</option>
          <option value="berber">Berber</option>
          <option value="dinka">Dinka</option>
          <option value="hausa">Hausa</option>
          <option value="igbo">Igbo</option>
          <option value="kikuyu">Kikuyu</option>
          <option value="oromo">Oromo</option>
          <option value="shona">Shona</option>
          <option value="swahili">Swahili</option>
          <option value="wolof">Wolof</option>
          <option value="yoruba">Yoruba</option>
          <option value="zulu">Zulu</option>
          <option value="caucasian">Caucasian</option>
          <option value="indian">Indian</option>
          <!-- Add more options as needed -->
        </select>
      </div>
      */

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

    entries.forEach(entry => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${entry.timestamp}</td>
        <td>${entry.systolic}</td>
        <td>${entry.diastolic}</td>
        <td>${entry.weight}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteEntry('${profileId}', '${entry.id}')">Delete</button></td>
      `;
        entriesBody.appendChild(row);
    });


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
    var profile = getProfile(profileId)//update profile
    profile.weight = weight
    localStorage.setItem(profileId, JSON.stringify(profile));

    //create a new diary entry
    const timestamp = new Date().toLocaleString();
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
    query += "ethnicity=" + encodeURIComponent(profile.ethnicity) + "&"
    query += "bmi=" + encodeURIComponent(bmi) + "&"
    query += "medications=" + encodeURIComponent(profile.medications) + "&"
    query += "name=" + encodeURIComponent(profile.fullName) + "&"
    query += "diabetic=" + encodeURIComponent(profile.isDiabetic) + "&"
    query += "weight=" + encodeURIComponent(profile.weight) + "&"
    query += "systolic=" + encodeURIComponent(entry.systolic) + "&"
    query += "diastolic=" + encodeURIComponent(entry.diastolic) + "&"
    query += "category=" + encodeURIComponent(category) + "&"
    query += "age=" + encodeURIComponent(age) + "&"
    query += "random=" + Math.random()
    //

    twineLink = 'twine/Information.html' + query
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