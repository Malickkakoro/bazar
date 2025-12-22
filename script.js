const engine = {
    products: [],
    cart: JSON.parse(localStorage.getItem('bazar_cart')) || [],

    init: async function() {
        try {
            const res = await fetch('produits.json');
            this.products = await res.json();
            this.render(this.products);
            this.updateUI();
        } catch (e) { console.error("Fichier JSON manquant !"); }
    },

    render: function(data) {
        const list = document.getElementById('product-list');
        list.innerHTML = '';
        data.forEach(p => {
            list.innerHTML += `
            <div class="col-12 col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <img src="${p.image}" class="card-img-top" onerror="this.src='https://via.placeholder.com/300x200'">
                    <div class="card-body d-flex flex-column">
                        <h5 class="font-weight-bold">${p.nom}</h5>
                        <p class="text-muted small flex-grow-1">${p.desc}</p>
                        <p class="text-info h5 font-weight-bold">${p.prix}</p>
                        <button class="btn btn-dark" onclick="engine.addToCart(${p.id})">Ajouter au panier</button>
                    </div>
                </div>
            </div>`;
        });
    },

    filter: function() {
        const text = document.getElementById('searchInput').value.toLowerCase();
        const cat = document.getElementById('catSelect').value;
        const filtered = this.products.filter(p => {
            return (cat === 'all' || p.categorie === cat) && p.nom.toLowerCase().includes(text);
        });
        this.render(filtered);
    },

    addToCart: function(id) {
        const p = this.products.find(item => item.id === id);
        this.cart.push(p);
        this.updateUI();
        alert(`${p.nom} ajouté !`);
    },

    updateUI: function() {
        localStorage.setItem('bazar_cart', JSON.stringify(this.cart));
        document.getElementById('cart-count').innerText = this.cart.length;
        
        const content = document.getElementById('cart-content');
        let total = 0;
        content.innerHTML = '';
        
        this.cart.forEach((p, idx) => {
            total += parseInt(p.prix.replace(/\D/g, ''));
            content.innerHTML += `
            <div class="item">
                <span>${p.nom}</span>
                <span class="text-info">${p.prix} <button class="btn btn-sm text-danger" onclick="engine.remove(${idx})">&times;</button></span>
            </div>`;
        });
        document.getElementById('cart-total').innerText = total.toLocaleString() + " FG";
    },

    remove: function(idx) {
        this.cart.splice(idx, 1);
        this.updateUI();
    },

    showCart: function() { $('#cartModal').modal('show'); },

    sendWhatsApp: function() {
        if(this.cart.length === 0) return alert("Panier vide !");
        let msg = "Bonjour SolantaKCorp, je commande :\n";
        this.cart.forEach(p => msg += `- ${p.nom} (${p.prix})\n`);
        msg += "\nTotal: " + document.getElementById('cart-total').innerText;
        window.open(`https://wa.me/+224626928839?text=${encodeURIComponent(msg)}`, '_blank');
    }
};

document.getElementById('orderForm').onsubmit = function(e) {
    e.preventDefault();
    emailjs.sendForm('service_yb2uwka', 'template_uc2yx1f', this).then(() => {
        alert("Commande envoyée par email !");
        engine.cart = [];
        engine.updateUI();
        $('#cartModal').modal('hide');
    });
};

window.onload = () => engine.init();
