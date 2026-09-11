function saveAndNext() {

    let name = document.getElementById("name").value;
    let age = document.getElementById("age").value;
    let accNo = document.getElementById("accNo").value;


    // Save data in localStorage
    localStorage.setItem("name", name);
    localStorage.setItem("age", age);
    localStorage.setItem("accNo", accNo);


    // Open second page
    window.location.href = "moreDetails.html";
}



// Run this code only if we are on moreDetails.html

if (document.getElementById("details")) {

    let name = localStorage.getItem("name");
    let age = localStorage.getItem("age");
    let accNo = localStorage.getItem("accNo");


    document.getElementById("details").innerHTML = `
        Name: ${name}<br><br>
        Age: ${age}<br><br>
        Account Number: ${accNo}
    `;
}



function validateDetails() {

    // Get values from localStorage
    let name = localStorage.getItem("name");
    let age = localStorage.getItem("age");
    let accNo = localStorage.getItem("accNo");


    // Put values permanently into the current webpage
    document.getElementById("finalName").textContent = name;
    document.getElementById("finalAge").textContent = age;
    document.getElementById("finalAccNo").textContent = accNo;


    // Hide validation section
    document.getElementById("storedDetails").style.display = "none";


    // Show final section
    document.getElementById("validatedData").style.display = "block";


    // Remove temporary localStorage data
    localStorage.removeItem("name");
    localStorage.removeItem("age");
    localStorage.removeItem("accNo");
}