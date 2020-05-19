function toggle(self) {
    self.classList.toggle('change');
    let x = document.getElementsByTagName("nav")[0];
    if (x.className === "") {
        x.className = "responsive";
    } else {
        x.className = "";
    }
}