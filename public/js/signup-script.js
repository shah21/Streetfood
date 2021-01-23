const toggleBtn = document.getElementsByClassName('toggle-button')[0];
const navbarLinks = document.getElementsByClassName('navbar-links')[0];
const nameField = document.getElementById('nameField');
nameField.style.display = 'none'


toggleBtn.addEventListener('click',()=>{
    navbarLinks.classList.toggle('active'); 
});

const userTypeRadioBtn = document.signupForm.userType;
for (let i = 0; i < userTypeRadioBtn.length; i++) {
  userTypeRadioBtn[i].addEventListener("change", () => {
    const selectedRadio = userTypeRadioBtn[i];
    
    if(selectedRadio.value === 'hotel'){
        if(nameField.style.display === "none"){
            nameField.style.display = "block";
        }
    }else{
        if(nameField.style.display === "block"){
            nameField.style.display = "none";
        }
    }
  });
}



