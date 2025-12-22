const engine = {
    products: [],
    cart: JSON.parse(localStorage.getItem('solanta_cart')) || [],

    // 1. Initialisation : Chargement des produits
    init: async function() {
        try {
            const res = await fetch('produits.json');
            if (!res.ok) throw new Error();
            this.products = await res.json();
            this.render(this.products);
            this.updateUI();
            this.updateJSON();
        } catch (e) {
            console.error("Erreur: produits.json introuvable.");
            document.getElementById('product-list').innerHTML = "<p class='col-12 text-center'>Veuillez créer le fichier produits.json sur GitHub.</p>";
        }
    },

    // 2. Affichage des produits (Grille responsive)
    render: function(data) {
        const list = document.getElementById('product-list');
        const isAdminVisible = document.getElementById('admin-section').style.display === 'block';
        list.innerHTML = '';

        data.forEach((p, index) => {
            list.innerHTML += `
            <div class="col-6 col-md-4 mb-4 px-2">
                <div class="card h-100 border-0 shadow-sm">
                    <img src="${p.image}" class="card-img-top" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Bientôt+Disponible'">
                    <div class="card-body p-2 p-md-3 d-flex flex-column">
                        <h6 class="font-weight-bold mb-1 text-truncate">${p.nom}</h6>
                        <p class="text-info small font-weight-bold mb-2">${p.prix}</p>
                        <button class="btn btn-dark btn-sm btn-block mt-auto" onclick="engine.addToCart(${p.id})">Ajouter</button>
                        ${isAdminVisible ? `<button class="btn btn-outline-danger btn-sm btn-block mt-2" onclick="engine.adminDelete(${index})">🗑 Supprimer</button>` : ''}
                    </div>
                </div>
            </div>`;
        });
    },

    // 3. Espace Admin (CRUD)
    authAdmin: function() {
        const pass = prompt("Mot de passe SolantaKCorp :");
        if (pass === "admin123") { // <-- TON MOT DE PASSE ICI
            document.getElementById('admin-section').style.display = 'block';
            this.render(this.products);
            this.updateJSON();
            alert("Accès Admin activé !");
        } else {
            alert("Mot de passe incorrect.");
        }
    },

    adminAdd: function() {
        const nom = document.getElementById('adm-nom').value;
        const prix = document.getElementById('adm-prix').value;
        const cat = document.getElementById('adm-cat').value;
        const img = document.getElementById('adm-img').value || 'placeholder.jpg';
        const desc = document.getElementById('adm-desc').value;

        if (!nom || !prix) return alert("Remplissez le nom et le prix !");

        const newP = { id: Date.now(), categorie: cat, nom: nom, prix: prix, image: img, desc: desc };
        this.products.push(newP);
        this.render(this.products);
        this.updateJSON();
        
        document.getElementById('adm-nom').value = '';
        document.getElementById('adm-prix').value = '';
    },

    adminDelete: function(index) {
        if (confirm("Supprimer définitivement cet article du catalogue ?")) {
            this.products.splice(index, 1);
            this.render(this.products);
            this.updateJSON();
        }
    },

    updateJSON: function() {
        const output = document.getElementById('json-output');
        if(output) output.value = JSON.stringify(this.products, null, 2);
    },

    // 4. Panier et WhatsApp
    addToCart: function(id) {
        const p = this.products.find(item => item.id === id);
        this.cart.push(p);
        this.updateUI();
        
        // Animation rapide du bouton
        const btn = event.target;
        btn.innerText = "✅";
        setTimeout(() => btn.innerText = "Ajouter", 800);
    },

    updateUI: function() {
        localStorage.setItem('solanta_cart', JSON.stringify(this.cart));
        document.getElementById('cart-count').innerText = this.cart.length;
        const content = document.getElementById('cart-content');
        let total = 0;
        content.innerHTML = this.cart.length ? '' : 'Panier vide';

        this.cart.forEach((p, idx) => {
            total += parseInt(p.prix.replace(/\D/g, '')) || 0;
            content.innerHTML += `
            <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-1">
                <span class="small">${p.nom}</span>
                <button class="btn btn-sm text-danger font-weight-bold" onclick="engine.remove(${idx})">&times;</button>
            </div>`;
        });
        document.getElementById('cart-total').innerText = total.toLocaleString() + " FG";
    },

    remove: function(idx) {
        this.cart.splice(idx, 1);
        this.updateUI();
    },

    sendWhatsApp: function() {
        if(!this.cart.length) return alert("Le panier est vide !");
        
        const phoneNumber = "224600000000"; // TON NUMÉRO ICI
        let msg = "Bonjour SolantaKCorp, je souhaite commander :\n\n";
        this.cart.forEach(p => msg += `• ${p.nom} (${p.prix})\n`);
        msg += `\n*TOTAL : ${document.getElementById('cart-total').innerText}*`;
        
        const encodedMsg = encodeURIComponent(msg);
        
        // Force l'ouverture de l'application mobile
        window.location.href = `whatsapp://send?phone=${phoneNumber}&text=${encodedMsg}`;
        
        // Backup si WhatsApp Web est nécessaire (PC)
        setTimeout(() => {
            window.open(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMsg}`, '_blank');
        }, 600);
    },

    showCart: function() { $('#cartModal').modal('show'); },

    filter: function() {
        const text = document.getElementById('searchInput').value.toLowerCase();
        const cat = document.getElementById('catSelect').value;
        const filtered = this.products.filter(p => {
            return (cat === 'all' || p.categorie === cat) && p.nom.toLowerCase().includes(text);
        });
        this.render(filtered);
    }
};

// Formulaire EmailJS (Optionnel si tu as configuré les templates)
document.getElementById('orderForm').onsubmit = function(e) {
    e.preventDefault();
    emailjs.sendForm('service_yb2uwka', 'template_uc2yx1f', this).then(() => {
        alert("Commande envoyée par email à SolantaKCorp !");
        engine.cart = [];
        engine.updateUI();
        $('#cartModal').modal('hide');
    });
};

window.onload = () => engine.init();
