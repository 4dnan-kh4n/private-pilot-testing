function addDetails() {

    let name = document.getElementById("name").value;
    let age = document.getElementById("age").value;
    let accNo = document.getElementById("accNo").value;

    localStorage.setItem("name", name);
    localStorage.setItem("age", age);
    localStorage.setItem("accNo", accNo);

    document.getElementById("detailsSaved").textContent =
        "Details Saved Successfully";
}


function nextPage() {

    window.location.href = "moreDetails.html";

}



if (document.getElementById("details")) {

    let name = localStorage.getItem("name");
    let age = localStorage.getItem("age");
    let accNo = localStorage.getItem("accNo");

    document.getElementById("details").textContent =
        `Name: ${name}, Age: ${age}, Account Number: ${accNo}`;
}


function submitDetails() {

    let hireReason = document.getElementById("hireReason").value;

    localStorage.setItem("hireReason", hireReason);

    document.getElementById("submitted").textContent =
        "All Details Submitted Successfully";
}