# Ethnicity and Hypertension

<div id="msg"></div>

<script>
var appsEthnicities =[
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
var str = ""
console.log("ethnicity", ethnicity)
if (ethnicity == "White/Caucasian"){
   str = "You are White/Caucasian. You'll be fine." 

}else {
	
  str = "You are " + ethnicity 
	

}

msg.innerHTML = str


</script>