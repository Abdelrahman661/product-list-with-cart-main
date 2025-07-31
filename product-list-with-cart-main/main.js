class CartItem {
  constructor(name, price, quantity = 1) {
    this.name = name;
    this.price = price;
    this.quantity = quantity;
  }

  getTotalPrice() {
    return this.price * this.quantity;
  }

  increment() {
    this.quantity++;
  }

  decrement() {
    this.quantity--;
    return this.quantity;
  }
}

class Cart {
  constructor() {
    this.items = {};
  }

  addItem(name, price) {
    if (!this.items[name]) {
      this.items[name] = new CartItem(name, price);
    }
  }

  incrementItem(name) {
    this.items[name]?.increment();
  }

  decrementItem(name) {
    if (this.items[name]?.decrement() === 0) {
      delete this.items[name];
    }
  }

  removeItem(name) {
    delete this.items[name];
  }

  getTotalCount() {
    return Object.keys(this.items).length;
  }

  getTotalPayment() {
    return Object.values(this.items).reduce(
      (acc, item) => acc + item.getTotalPrice(),
      0
    );
  }

  getItems() {
    return this.items;
  }

  clear() {
    this.items = {};
  }
}

class CartUI {
  constructor(cart) {
    this.cart = cart;
    this.cartBox = document.querySelector(".cart-box");
    this.cartCount = document.querySelector(".cart-header");
    this.totalPayment = document.querySelector(".total-payment");
    this.confirmationModal = document.querySelector(".confirmation-modal");

    this.init();
  }

  init() {
    document.querySelectorAll(".item-box").forEach((box) => {
      const button = box.querySelector(".cart-button");
      const name = box.querySelector(".item-name").innerText.trim();
      const price = parseFloat(
        box.querySelector(".item-price").innerText.replace("$", "")
      );

      button.addEventListener("click", () => {
        this.cart.addItem(name, price);
        this.updateUI();
        this.replaceButtonWithControls(button, box, name, price);
      });
    });

    const confirmBtn = document.querySelector(".confirmation");
    confirmBtn?.addEventListener("click", () => this.showConfirmationModal());

    document.querySelector(".start-new-order").addEventListener("click", () => {
      this.cart.clear();
      this.updateUI();
      this.confirmationModal.classList.add("hidden");
      window.location.reload();
    });
  }

  replaceButtonWithControls(button, box, name, price) {
    const container = document.createElement("div");
    container.className = "quantity-control";
    container.style.cssText = `
      margin: auto;
      background: hsl(14, 86%, 42%);
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
      <button class="increment" style="padding: 2px 12px; background: transparent; border: 2px solid white; border-radius: 10px; color: white; cursor:pointer;">+</button>
    `;

    button.replaceWith(container);

    container.querySelector(".increment").addEventListener("click", () => {
      this.cart.incrementItem(name);
      container.querySelector(".qty-count").innerText =
        this.cart.getItems()[name].quantity;
      this.updateUI();
    });

    container.querySelector(".decrement").addEventListener("click", () => {
      this.cart.decrementItem(name);
      const item = this.cart.getItems()[name];
      if (!item) {
        const newBtn = this.createAddButton(name, price, box);
        container.replaceWith(newBtn);
      } else {
        container.querySelector(".qty-count").innerText = item.quantity;
      }
      this.updateUI();
    });
  }

  createAddButton(name, price, box) {
    const newBtn = document.createElement("button");
    newBtn.className = "cart-button";
    newBtn.innerHTML = `<img class="cart-logo" src="assets/images/icon-add-to-cart.svg" alt="" /> Add to cart`;

    newBtn.addEventListener("click", () => {
      this.cart.addItem(name, price);
      this.updateUI();
      this.replaceButtonWithControls(newBtn, box, name, price);
    });

    return newBtn;
  }

  updateUI() {
    this.cartBox.innerHTML = "";

    Object.entries(this.cart.getItems()).forEach(([name, item]) => {
      const article = document.createElement("article");
      article.className = "cart-item";
      article.innerHTML = `
        <div class="item-flex">
          <p class="order-name">${name}</p>
          <div class="price-flex">
            <span class="quantity">${item.quantity}x</span>
            <span class="price">@$${item.price.toFixed(2)}</span>
            <span class="total-price">$${item.getTotalPrice().toFixed(2)}</span>
          </div>
        </div>
        <button class="remove-item">
          <img src="assets/images/icon-remove-item.svg" alt="remove" />
        </button>
      `;

      article.querySelector(".remove-item").addEventListener("click", () => {
        this.cart.removeItem(name);
        this.updateUI();
        this.resetAddButton(name);
      });

      this.cartBox.appendChild(article);
    });

    this.cartCount.innerText = `Your cart (${this.cart.getTotalCount()})`;
    this.totalPayment.innerText = `$${this.cart.getTotalPayment().toFixed(2)}`;
  }

  resetAddButton(name) {
    document.querySelectorAll(".item-box").forEach((box) => {
      const itemName = box.querySelector(".item-name").innerText.trim();
      if (itemName === name) {
        const control = box.querySelector(".quantity-control");
        if (control) {
          const newBtn = this.createAddButton(
            name,
            this.cart.getItems()[name]?.price ?? 0,
            box
          );
          control.replaceWith(newBtn);
        }
      }
    });
  }

  showConfirmationModal() {
    const orderList = this.confirmationModal.querySelector(".order-list");
    const totalPriceEl =
      this.confirmationModal.querySelector(".order-total-price");

    orderList.innerHTML = "";
    Object.entries(this.cart.getItems()).forEach(([name, item]) => {
      const div = document.createElement("div");
      div.className = "order-item";
      div.innerHTML = `
      
      
        <span>${name} (${item.quantity}x @ $${item.price.toFixed(2)})</span>
        <span>$${item.getTotalPrice().toFixed(2)}</span>
      `;
      orderList.appendChild(div);
    });

    totalPriceEl.innerText = `$${this.cart.getTotalPayment().toFixed(2)}`;
    this.confirmationModal.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const cart = new Cart();
  new CartUI(cart);
});
