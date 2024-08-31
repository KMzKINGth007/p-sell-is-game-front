import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-admin',
  templateUrl: './orderAdmin.component.html',
  styleUrls: ['./orderAdmin.component.css']
})
export class OrderAdminComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  currentFilter: string = 'all';

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
        this.orders = response.data;
        this.applyFilter(this.currentFilter);  // Apply the initial filter
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );
  }

  applyFilter(status: string) {
    this.currentFilter = status;
    if (status === 'all') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === status);
    }
  }

  viewOrder(order: any) {
    this.router.navigate(['/orderDetailAdmin', order.orderId]);
  }

  deleteOrder(orderId: number) {
    if (confirm('Are you sure you want to delete this order?')) {
      this.callService.deleteOrder(orderId).subscribe(
        () => {
          this.fetchOrders(); // Refresh the orders list
          alert('Order deleted successfully.');
        },
        (error) => {
          console.error('Error deleting order:', error);
          alert('Failed to delete the order. Please try again.');
        }
      );
    }
  }

  // New method to navigate to the SendMailComponent
  sendMail(orderId: number) {
    this.router.navigate(['/sendmail', orderId]);
  }
}
