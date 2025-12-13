//   const slides = document.querySelector(".slides");
//   const dots = document.querySelectorAll(".dot");

//   let index = 0;
//   const slidesPerView = 3;
//   const totalSlides = 5;
//   const maxIndex = Math.ceil(totalSlides / slidesPerView) - 1;

//   function updateSlider() {
//     slides.style.transform = `translateX(-${index * 900}px)`;

//     dots.forEach(dot => dot.classList.remove("active"));
//     dots[index].classList.add("active");
//   }

//   function nextSlide() {
//     if (index < maxIndex) {
//       index++;
//       updateSlider();
//     }
//   }

//   function prevSlide() {
//     if (index > 0) {
//       index--;
//       updateSlider();
//     }
//   }

