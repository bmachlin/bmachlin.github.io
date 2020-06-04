function toggle(self) {
    self.classList.toggle('change');
    let nav = document.getElementsByTagName("nav")[0];
    if (nav.className === "") {
        nav.className = "responsive";
    } else {
        nav.className = "";
    }
}