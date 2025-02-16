// Initialize Swiper
var swiper = new Swiper(".swiper", {
    loop: true,
    spaceBetween: 0,
    centeredSlides: true,
    grabCursor: true,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    breakpoints: {
        // above 800px width applies these settings, below uses top-level/default
        // 800: {
        //     spaceBetween: 10,
        //     // slidesPerView: 1.5
        // }
    }
});