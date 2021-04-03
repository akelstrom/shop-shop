import React, { useEffect } from "react";
import CartItem from "../CartItem";
import Auth from "../../utils/auth";
import "./style.css";
// import { useStoreContext } from "../../utils/GlobalState";
import { TOGGLE_CART, ADD_MULTIPLE_TO_CART } from "../../utils/actions";
import { idbPromise } from "../../utils/helpers";
import { QUERY_CHECKOUT } from '../../utils/queries';
import { loadStripe } from '@stripe/stripe-js';
import { useLazyQuery } from '@apollo/react-hooks';
//redux
import { useDispatch, useSelector } from 'react-redux';

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const Cart = () => {
  // const [getCheckout, { data }] = useLazyQuery(QUERY_CHECKOUT);
  // const [state, dispatch] = useStoreContext();
  const dispatch = useDispatch();
  const cartToggled = useSelector(state => state.cartOpen);
  const cartItem = useSelector(state => state.cart)
  
  useEffect(() => {
    async function getCart() {
      const cart = await idbPromise('cart', 'get');
      dispatch({ type: ADD_MULTIPLE_TO_CART, products: [...cart] });
    };
  
    if (!cartItem.length) {
      getCart();
    }
  }, [cartItem.length, dispatch]);

  useEffect(() => {
    if (data) {
      stripePromise.then((res) => {
        res.redirectToCheckout({ sessionId: data.checkout.session });
      });
    }
  }, [data]);

  function toggleCart() {
    dispatch({ type: TOGGLE_CART });
  }

  function calculateTotal() {
    let sum = 0;
    cartItem.forEach(item => {
      sum += item.price * item.purchaseQuantity;
    });
    return sum.toFixed(2);
  }

  function submitCheckout() {
    const productIds = [];
    getCheckout({
        variables: { products: productIds }
      });
  
    cartItem.forEach((item) => {
      for (let i = 0; i < item.purchaseQuantity; i++) {
        productIds.push(item._id);
      }

    });
  }

  if (!cartToggled) {
    return (
      <div className="cart-closed" onClick={toggleCart}>
        <span
          role="img"
          aria-label="trash">🛒</span>
      </div>
    );
  }

  return (
    <div className="cart">
    <div className="close" onClick={toggleCart}>[close]</div>
    <h2>Shopping Cart</h2>
    {cartItem.length ? (
      <div>
        {state.cart.map(item => (
          <CartItem key={item._id} item={item} />
        ))}
        <div className="flex-row space-between">
          <strong>Total: ${calculateTotal()}</strong>
          {
            Auth.loggedIn() ?
            <button onClick={submitCheckout}>
            Checkout
          </button>
              :
              <span>(log in to check out)</span>
          }
        </div>
      </div>
    ) : (
      <h3>
        <span role="img" aria-label="shocked">
          😱
        </span>
        You haven't added anything to your cart yet!
      </h3>
    )}
  </div>
  );
};

export default Cart;
