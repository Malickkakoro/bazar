document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Empêcher l'envoi par défaut du formulaire

        // Envoyer le formulaire via EmailJS
        emailjs.sendForm('service_yb2uwka', 'template_z43bbvx', contactForm)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                alert('Message envoyé avec succès!');
                contactForm.reset(); // Réinitialiser le formulaire après envoi
            }, function(error) {
                console.log('FAILED...', error);
                alert('Échec de l\'envoi du message.');
            });
    });
});
