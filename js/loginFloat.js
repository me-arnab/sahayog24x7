function closeAll() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("noticeBox").style.display = "none";
  document.getElementById("faqBox").style.display = "none";
}

function openLogin() {
  closeAll();
  document.getElementById("overlay").style.display = "block";
  document.getElementById("loginBox").style.display = "block";
}



function openNotice() {
  closeAll();
  document.getElementById("overlay").style.display = "block";
  document.getElementById("noticeBox").style.display = "block";
}

function openFAQ() {
  closeAll();
  document.getElementById("overlay").style.display = "block";
  document.getElementById("faqBox").style.display = "block";
}



