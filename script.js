const engine = {
    products: [],
    cart: JSON.parse(localStorage.getItem('solanta_cart')) || [],

    init: async function() {
        try {
            const res = await fetch('produits.json');
            this.products = await res.json();
            this.render(this.products);
            this.updateUI();
            this.updateJSON(); // Prépare le JSON au cas où
        } catch (e) {
            console.error("Base de données introuvable. Créez produits.json");
        }
    },

    // --- AFFICHAGE ---
    render: function(data) {
        const list = document.getElementById('product-list');
        const isAdminVisible = document.getElementById('admin-section').style.display === 'block';
        list.innerHTML = '';

        data.forEach((p, index) => {
            list.innerHTML += `
            <div class="col-6 col-md-4 mb-4 px-2">
                <div class="card h-100 border-0 shadow-sm">
                    <img src="${p.image}" class="card-img-top" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=SolantaKCorp'">
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

    // --- GESTION ADMIN (CRUD) ---
    authAdmin: function() {
        const pass = prompt("Mot de passe SolantaKCorp :");
        if (pass === "admin123") { // CHANGE LE MOT DE PASSE ICI
            document.getElementById('admin-section').style.display = 'block';
            this.render(this.products); // Rafraîchit pour voir les boutons supprimer
            this.updateJSON();
        } else {
            alert("Accès refusé.");
        }
    },

    adminAdd: function() {
        const nom = document.getElementById('adm-nom').value;
        const prix = document.getElementById('adm-prix').value;
        const cat = document.getElementById('adm-cat').value;
        const img = document.getElementById('adm-img').value || 'placeholder.jpg';
        const desc = document.getElementById('adm-desc').value;

        if (!nom || !prix) return alert("Nom et Prix obligatoires !");

        const newP = { id: Date.now(), categorie: cat, nom: nom, prix: prix, image: img, desc: desc };
        this.products.push(newP);
        this.render(this.products);
        this.updateJSON();
        
        // Vider les champs
        document.getElementById('adm-nom').value = '';
        document.getElementById('adm-prix').value = '';
    },

    adminDelete: function(index) {
        if (confirm("Supprimer cet article du catalogue ?")) {
            this.products.splice(index, 1);
            this.render(this.products);
            this.updateJSON();
        }
    },

    updateJSON: function() {
        const output = document.getElementById('json-output');
        if(output) output.value = JSON.stringify(this.products, null, 2);
    },

    // --- PANIER ET WHATSAPP ---
    addToCart: function(id) {
        const p = this.products.find(item => item.id === id);
        this.cart.push(p);
        this.updateUI();
    },

    updateUI: function() {
        localStorage.setItem('solanta_cart', JSON.stringify(this.cart));
        document.getElementById('cart-count').innerText = this.cart.length;
        const content = document.getElementById('cart-content');
        let total = 0;
        content.innerHTML = this.cart.length ? '' : 'Panier vide';
        this.cart.forEach((p, idx) => {
            total += parseInt(p.prix.replace(/\D/g, '')) || 0;
            content.innerHTML += `<div class="d-flex justify-content-between mb-2"><span>${p.nom}</span><button class="btn btn-sm text-danger" onclick="engine.remove(${idx})">&times;</button></div>`;
        });
        document.getElementById('cart-total').innerText = total.toLocaleString() + " FG";
    },

    remove: function(idx) { this.cart.splice(idx, 1); this.updateUI(); },

    sendWhatsApp: function() {
        const phoneNumber = "224626928839"; // TON NUMÉRO
        let msg = "Bonjour SolantaKCorp, ma commande :\n";
        this.cart.forEach(p => msg += `- ${p.nom} (${p.prix})\n`);
        const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(msg)}`;
        window.location.href = url;
        setTimeout(() => window.open(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(msg)}`, '_blank'), 500);
    },

    filter: function() {
        const text = document.getElementById('searchInput').value.toLowerCase();
        const cat = document.getElementById('catSelect').value;
        const filtered = this.products.filter(p => (cat === 'all' || p.categorie === cat) && p.nom.toLowerCase().includes(text));
        this.render(filtered);
    },

    showCart: function() { $('#cartModal').modal('show'); }
};

window.onload = () => engine.init();
