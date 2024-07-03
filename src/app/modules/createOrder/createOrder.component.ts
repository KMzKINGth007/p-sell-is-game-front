import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CallserviceService } from '../services/callservice.service';

@Component({
  selector: 'app-createOrder',
  templateUrl: './createOrder.component.html',
  styleUrls: ['./createOrder.component.css']
})
export class CreateOrderComponent implements OnInit {
  cart: any[] = [];
  userDetail: any;

  constructor(private router: Router, private callService: CallserviceService) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { cart: any[], userDetail: any };
    this.cart = state.cart;
    this.userDetail = state.userDetail;
  }

  ngOnInit() {
    if (!this.cart || !this.userDetail) {
      this.router.navigate(['/']);
    }
  }

  placeOrder() {
    const orderDetails = {
      userDetailId: this.userDetail.userId,
      paymentId: 1, // Assuming a static payment ID for this example
      totalAmount: this.cart.reduce((total, item) => total + (item.productPrice * item.quantity), 0),
      items: this.cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.productPrice
      }))
    };

    this.callService.placeOrder(orderDetails).subscribe(
      (response) => {
        alert('Order placed successfully!');
        this.router.navigate(['/']);
      },
      (error) => {
        console.error('Error placing order', error);
      }
    );
  }
}
