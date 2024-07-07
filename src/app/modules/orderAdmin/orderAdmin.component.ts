import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orderAdmin',
  templateUrl: './orderAdmin.component.html',
  styleUrls: ['./orderAdmin.component.css']
})
export class OrderAdminComponent implements OnInit {
  orders: any[] = [];

  constructor(
    private callService: CallserviceService,
    private router: Router
  ) { }

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.callService.getAllOrders().subscribe(
      (response) => {
        this.orders = response.data; // Assuming your API response structure has a 'data' field with orders
      },
      (error) => {
        console.error('Error fetching orders:', error);
        // Handle error scenario
      }
    );
  }

  viewOrder(order: any) {
    // Implement logic to view details of a specific order
    console.log('View order:', order);
    // Example: Redirect to order details page
    // this.router.navigate(['/order-details', order.orderId]);
  }

  deleteOrder(orderId: number) {
    // Implement logic to delete an order
    console.log('Delete order:', orderId);
    // Example: Call service to delete order
    // this.callService.deleteOrder(orderId).subscribe(
    //   (response) => {
    //     console.log('Order deleted successfully:', response);
    //     // Refresh orders list
    //     this.fetchOrders();
    //   },
    //   (error) => {
    //     console.error('Error deleting order:', error);
    //     // Handle error scenario
    //   }
    // );
  }
}
