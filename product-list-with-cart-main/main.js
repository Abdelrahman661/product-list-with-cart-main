let cart = {};
const cartBox = document.querySelector(".cart-box");
const cartCount = document.querySelector(".cart-header");
const totalPayment = document.querySelector(".total-payment");

document.querySelectorAll(".item-box").forEach((box) => {
  const button = box.querySelector(".cart-button");
  const itemName = box.querySelector(".item-name").innerText.trim();
  const itemPrice = parseFloat(
    box.querySelector(".item-price").innerText.replace("$", "")
  );

  button.addEventListener("click", () => {
    if (!cart[itemName]) {
      cart[itemName] = { qty: 1, price: itemPrice };
      updateCartUI();
      replaceWithQuantityControls(button, itemName, itemPrice);
    }
  });
});

function replaceWithQuantityControls(button, itemName, itemPrice) {
  const container = document.createElement("div");
  container.className = "quantity-control";
  container.style.cssText = `
  margin: auto;
  background:hsl(14, 86%, 42%);
  padding: 15px 20px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 120px;
  color: white;
  position: relative;
    bottom: 45px;
`;

  container.innerHTML = `
  <button class="decrement" style="padding: 2px 12px; background: transparent; border: 2px solid white; border-radius: 10px; color: white; cursor:pointer;">−</button>
  <span class="qty-count">1</span>
  <button class="increment" style="padding: 2px 12px; background: transparent; border: 2px solid white; border-radius: 10px; color: white;cursor:pointer">+</button>
`;

  button.replaceWith(container);

  container.querySelector(".increment").addEventListener("click", () => {
    cart[itemName].qty++;
    container.querySelector(".qty-count").innerText = cart[itemName].qty;
    updateCartUI();
  });

  container.querySelector(".decrement").addEventListener("click", () => {
    cart[itemName].qty--;
    if (cart[itemName].qty === 0) {
      delete cart[itemName];
      updateCartUI();
      const newButton = document.createElement("button");
      newButton.className = "cart-button";
      newButton.innerHTML = `<img class="cart-logo" src="assets/images/icon-add-to-cart.svg" alt="" /> Add to cart`;
      container.replaceWith(newButton);
      newButton.addEventListener("click", () => {
        cart[itemName] = { qty: 1, price: itemPrice };
        updateCartUI();
        replaceWithQuantityControls(newButton, itemName, itemPrice);
      });
    } else {
      container.querySelector(".qty-count").innerText = cart[itemName].qty;
      updateCartUI();
    }
  });
}

function updateCartUI() {
  let confirmation = document.querySelector(".confirmation");
  confirmation.addEventListener("click", () => {
    showConfirmationModal();
  });
  cartBox.innerHTML = "";
  let total = 0;
  let count = 0;

  for (let item in cart) {
    const { qty, price } = cart[item];
    const itemTotal = qty * price;
    total += itemTotal;
    count++;

    const article = document.createElement("article");
    article.className = "cart-item";
    article.innerHTML = `
      <div class="item-flex">
        <p class="order-name">${item}</p>
        <div class="price-flex">
          <span class="quantity">${qty}x</span>
          <span class="price">@$${price.toFixed(2)}</span>
          <span class="total-price">$${itemTotal.toFixed(2)}</span>
        </div>
      </div>
      <button class="remove-item">
        <img src="assets/images/icon-remove-item.svg" alt="remove" />
      </button>
    `;

    article.querySelector(".remove-item").addEventListener("click", (e) => {
      let target =
        e.target.parentElement.parentElement.childNodes[1].childNodes[1]
          .innerText;
      e.target.parentElement.parentElement.remove();
      delete cart[target];
      console.log(cart);

      updateCartUI();

      // Reset menu button
      document.querySelectorAll(".item-box").forEach((box) => {
        const name = box.querySelector(".item-name").innerText.trim();
        if (name === item) {
          const container = box.querySelector(".quantity-control");
          if (container) {
            const newButton = document.createElement("button");
            newButton.className = "cart-button";
            newButton.innerHTML = `<img class="cart-logo" src="assets/images/icon-add-to-cart.svg" alt="" /> Add to cart`;
            container.replaceWith(newButton);
            newButton.addEventListener("click", () => {
              cart[item] = { qty: 1, price: price };
              updateCartUI();
              replaceWithQuantityControls(newButton, item, price);
            });
          }
        }
      });
    });

    cartBox.appendChild(article);
  }

  cartCount.innerText = `Your cart (${count})`;
  totalPayment.innerText = `$${total.toFixed(2)}`;
}
function showConfirmationModal() {
  const modal = document.querySelector(".confirmation-modal");
  const orderList = modal.querySelector(".order-list");
  const totalPriceEl = modal.querySelector(".total-price");

  orderList.innerHTML = "";
  let total = 0;

  for (let item in cart) {
    const { qty, price } = cart[item];
    const itemTotal = qty * price;
    total += itemTotal;

    const itemEl = document.createElement("div");
    itemEl.className = "order-item";
    itemEl.innerHTML = `
      <span>${item} (${qty}x @ $${price.toFixed(2)})</span>
      <span>$${itemTotal.toFixed(2)}</span>
    `;
    orderList.appendChild(itemEl);
  }

  totalPriceEl.innerText = `$${total.toFixed(2)}`;
  modal.classList.remove("hidden");

  document.querySelector(".start-new-order").addEventListener("click", () => {
    cart = {};
    updateCartUI();
    document.querySelector(".confirmation-modal").classList.add("hidden");
    window.location.reload();
  });
}
