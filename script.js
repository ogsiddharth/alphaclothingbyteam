async function signup() {
  let name = document.getElementById("signupName").value;
  let email = document.getElementById("signupEmail").value;
  let password = document.getElementById("signupPassword").value;

  let res = await fetch("http://localhost:5000/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });
  let data = await res.json();

  if (data.message === "Signup successful!") {
    // Redirect to greetings page with name
    window.location.href = `greetings.html?name=${encodeURIComponent(name)}`;
  } else {
    document.getElementById("message").innerText = data.message;
  }
}

async function login() {
  let email = document.getElementById("loginEmail").value;
  let password = document.getElementById("loginPassword").value;

  let res = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  let data = await res.json();

  if (data.message.startsWith("Login successful")) {
    // Extract name from message
    let name = data.message.split("Welcome ")[1];
    window.location.href = `greetings.html?name=${encodeURIComponent(name)}`;
  } else {
    document.getElementById("message").innerText = data.message;
  }
}



/**
 * =========================================================
 * 🚀 ALPHA CLOTHING: CORE JAVASCRIPT LOGIC
 * =========================================================
 */

// --- 1. UTILITIES & AUTH GUARD ---
function isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

function gatekeeper(event) {
    if (!isUserLoggedIn()) {
        if (event) event.preventDefault();
        // alert("Please log in or sign up to continue shopping.");
        // window.location.href = 'index.html';
        return false;
    }
    return true;
}

function logoutUser() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('cart'); // Logout par cart clear karna option hai
    // alert("You have been logged out.");
    // window.location.href = 'index.html';
}

// --- 2. CART LOGIC ---
function getCartItems() {
    // Dhyaan rakho: Hamesha 'cart' key use karo logic consistency ke liye
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCartItems(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// function addToCart(productId) {
    // Gatekeeper check yahan bhi zaroori hai
    // if (!isUserLoggedIn()) {
    //     alert("Pehle login karein!");
    //     window.location.href = 'index.html';
    //     return;
    // }

    // products array data.js se aayega
//     const product = products.find(p => p.id === productId);
//     if (product) {
//         let cart = getCartItems();
//         cart.push(product);
//         saveCartItems(cart);
//         alert(`${product.name} added to cart!`);
//     } else {
//         console.error("Product ID not found:", productId);
//     }
// }
function addToCart(productId) {
    const product = products.find(p => p.id === productId);

    let cart = getCartItems();

    let existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCartItems(cart);
  // HOME PAGE FIX: Check if Swal is loaded properly
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `${product.name} added to cart! 🛒`,
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
        } else {
            // Agar home page par Swal load nahi hua, toh kam se kam alert dikhega
            console.error("SweetAlert2 not loaded on this page!");
            alert(product.name + " added to cart!");
        }
    
}

function displayCart() {
    const cartContainer = document.getElementById('cart-items-list');
    const totalElement = document.getElementById('cart-total');
    if (!cartContainer) return;

    let cart = getCartItems();
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center; padding:20px;">Your cart is empty.</p>';
        totalElement.innerText = "0.00";
        return;
    }

    let total = 0;
    cartContainer.innerHTML = cart.map((item, index) => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item" style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border-bottom: 1px solid #ddd;">
                <div class="item-details" style="display: flex; align-items: center;">
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; height:60px; object-fit:cover; border-radius:5px; margin-right: 15px;">
                    <div>
                        <h3 style="font-size:1.1rem;">${item.name}</h3>
                        <p style="color:#666;">₹${item.price}</p>
                    </div>
                </div>
                <button onclick="removeItem(${index})" style="background: #ff4d4d; color: white; border: none; padding: 8px 12px; border-radius:4px; cursor: pointer;">Remove</button>
            </div>
        `;
    }).join('');
    
    totalElement.innerText = total.toFixed(2);
    localStorage.setItem('orderTotal', total.toFixed(2));
}

function removeItem(index) {
    let cart = getCartItems();
    cart.splice(index, 1);
    saveCartItems(cart);
    displayCart();
}

function placeOrder() {
    const cart = getCartItems();
    if (cart.length > 0) {
        window.location.href = 'payment.html';
    } else {
       // script.js mein addToCart function ke andar alert hata kar ye daalo:
Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: 'Item added to cart!',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true
});
    }
}

// --- 3. ANIMATIONS & EFFECTS ---
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    },
    { threshold: 0.3 }
);

// --- 4. INITIALIZATION (DOM Content Loaded) ---
document.addEventListener('DOMContentLoaded', () => {
    // Observe sections
    document.querySelectorAll('section').forEach(section => observer.observe(section));

    // Cart Page logic
    if (document.getElementById('cart-items-list')) {
        displayCart();
    }

    // Hamburger Menu
    const hamburger = document.querySelector('.nav2 h5');
    const mobileMenu = document.getElementById('mobileMenu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => mobileMenu.classList.toggle('active'));
    }

    // Event Delegation for Dynamic Elements (Security)
    document.body.addEventListener('click', (e) => {
        // Buy buttons, links etc.
        if (e.target.matches('.btn-buy, .btn2, #learnmore, .btn')) {
            gatekeeper(e);
        }
        
        // Cart Icon Click
        if (e.target.matches('.ri-shopping-cart-2-fill')) {
             if (gatekeeper(e)) window.location.href = 'cart.html';
        }

        // Profile Icon Click
        if (e.target.matches('.ri-account-circle-line')) {
            if (gatekeeper(e)) window.location.href = 'user.html';
        }
    });
});