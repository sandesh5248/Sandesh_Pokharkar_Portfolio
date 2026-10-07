// Main Application JavaScript for Sandesh Pokharkar Portfolio

document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // 2. Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    const formResponse = document.getElementById('form-response');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value;

            if (formResponse) {
                formResponse.innerHTML = `<i class="fa-solid fa-circle-check"></i> Thank you ${name}! Your message has been received. Sandesh will get back to you shortly.`;
                formResponse.classList.remove('hidden');
                contactForm.reset();

                setTimeout(() => {
                    formResponse.classList.add('hidden');
                }, 5000);
            }
        });
    }

});
