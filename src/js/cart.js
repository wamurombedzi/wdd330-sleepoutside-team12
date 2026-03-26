import { loadHeaderFooter } from "./utils.mjs";
import { getLocalStorage } from "./utils.mjs";

loadHeaderFooter();

function cartItemTemplate(item) {
  if (!item) return "";

  const imgSrc = item.Image || "../images/placeholder.png";
  const name = item.Name || "Unnamed Product";
  const brand = item.Brand || "Unknown Brand";
  const price = item.FinalPrice ?? 0;
  const quantity = item.Quantity || 1;

  return `
    <li class="cart-card divider" data-id="${item.Id}">
      <a href="#" class="cart-card__image">
        <img src="${imgSrc}" alt="${name}" />
      </a>
      <div class="cart-card__info">
        <h4 class="cart-card__brand">${brand}</h4>
        <h2 class="cart-card__name">${name}</h2>
        <p class="cart-card__price">$${price.toFixed(2)}</p>
        <div class="cart-card__quantity-control">
          <button class="qty-btn decrease">-</button>
          <input type="number" class="qty-input" min="0" value="${quantity}">
          <button class="qty-btn increase">+</button>
        </div>
        <p class="cart-card__subtotal">Subtotal: $${(price * quantity).toFixed(2)}</p>
      </div>
    </li>
  `;
}

// Render the cart contents + grand total
function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const container = document.querySelector(".product-list"); // matches your HTML
  if (!container) return;

  if (cartItems.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  // Render each item
  container.innerHTML = cartItems.map(cartItemTemplate).join("");

  // Add grand total at the bottom
  const grandTotal = cartItems.reduce(
    (sum, item) => sum + item.FinalPrice * (item.Quantity || 1),
    0,
  );
  const totalEl = document.createElement("li");
  totalEl.className = "cart-grand-total";
  totalEl.innerHTML = `<h3>Grand Total: $${grandTotal.toFixed(2)}</h3>`;
  container.appendChild(totalEl);

  attachQuantityListeners(); // attach event listeners after rendering
}

// Attach event listeners to quantity inputs and buttons
function attachQuantityListeners() {
  const cartItems = document.querySelectorAll(".cart-card");
  const cart = getLocalStorage("so-cart") || [];

  cartItems.forEach((itemEl) => {
    const id = itemEl.dataset.id;
    const input = itemEl.querySelector(".qty-input");
    const decreaseBtn = itemEl.querySelector(".decrease");
    const increaseBtn = itemEl.querySelector(".increase");

    // Input change
    input.addEventListener("change", () => {
      let newQty = parseInt(input.value);
      if (isNaN(newQty) || newQty < 0) newQty = 0;

      const product = cart.find((p) => p.Id === id);
      if (product) {
        if (newQty === 0) {
          // Remove item if quantity is 0
          const index = cart.indexOf(product);
          cart.splice(index, 1);
        } else {
          product.Quantity = newQty;
        }
        setLocalStorage("so-cart", cart);
        renderCartContents(); // re-render cart including grand total
      }
    });

    // Increase button
    increaseBtn.addEventListener("click", () => {
      input.value = parseInt(input.value) + 1;
      input.dispatchEvent(new Event("change"));
    });

    // Decrease button
    decreaseBtn.addEventListener("click", () => {
      input.value = Math.max(0, parseInt(input.value) - 1);
      input.dispatchEvent(new Event("change"));
    });
  });
}

// Render cart on page load
document.addEventListener("DOMContentLoaded", renderCartContents);
