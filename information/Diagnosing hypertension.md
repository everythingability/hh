# Diagnosing hypertension

When considering a diagnosis of hypertension, measure blood pressure in both arms:

* If the difference in readings between arms is more than 15 mmHg, repeat the measurements.
* If the difference in readings between arms remains more than 15 mmHg on the second measurement, measure subsequent blood pressures in the arm with the higher reading.
* If clinic blood pressure is between 140/90 mmHg and 180/120 mmHg, consider ambulatory blood pressure monitoring [ambulatory blood pressure monitoring ](ABPM.md) to confirm the diagnosis of hypertension. 


<div id="msg"></div>

<script>
// available variables

// id, bmi, name, category, isDiabetic, weight, height, systolic, diastolic
// averageSystolic, averageDiastolic, age, ethnicity, averageMsg
// bloodPressureStatus


var options = {"High":  `This is considered higher risk. Please review the <a href="javascript:loadPage('How Do I Control My Blood Pressure.md')">How Do I Control My Blood Pressure</a> information `,
				"Medium":  "This a medium risk, and there are some things you should consider",
				"Low": "Carry on, be as healthy as you can be", 
				}

var message = `Your average blood pressure is: ${averageSystolic}/${averageDiastolic}`
var extra = options[bloodPressureStatus]
msg.innerHTML = message + " " + extra

if (bloodPressureStatus == "High"){
msg.style.color = "red"
}

</script>
