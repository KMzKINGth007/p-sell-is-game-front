import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashbordAdmin',
  templateUrl: './dashbordAdmin.component.html',
  styleUrls: ['./dashbordAdmin.component.css']
})
export class DashbordAdminComponent implements OnInit {
  userList: any[] = [];
  activeCount: number = 0;
  noActiveCount: number = 0;
  pieChartData: any[] = [];

  productList: any[] = [];
  productTypeList: any[] = [];
  productStockData: any[] = [];
  totalProducts: number = 0;

  orders: any[] = [];
  filteredOrders: any[] = [];
  currentFilter: string = 'all';

  constructor(private callService: CallserviceService, private router: Router) { }

  ngOnInit() {
    this.callService.getAllUser().subscribe(res => {
      if (res.data) {
        this.userList = res.data;
        this.calculateUserStats();
      }
    });

    this.getProductData();
    this.fetchOrders();
  }

  calculateUserStats() {
    this.activeCount = this.userList.filter(user => user.status === 'ACTIVE').length;
    this.noActiveCount = this.userList.filter(user => user.status === 'NOACTIVE').length;
    this.pieChartData = [
      { name: 'Active Users', value: this.activeCount },
      { name: 'Inactive Users', value: this.noActiveCount }
    ];
  }

  getProductData() {
    this.callService.getProductTypeAll().subscribe(res => {
      if (res.data) {
        this.productTypeList = res.data;
      }
    });

    this.callService.getAllProduct().subscribe(res => {
      if (res.data) {
        this.productList = res.data;
        this.totalProducts = this.productList.length;

        this.productStockData = this.productTypeList.map(type => {
          const totalStock = this.productList
            .filter(product => product.productTypeId === type.productTypeId)
            .reduce((sum, product) => sum + product.productStock, 0);

          return { name: type.productTypeName, value: totalStock };
        });
      }
    });
  }

  fetchOrders() {
    this.callService.getAllOrders().subscribe(
      (response) => {
        this.orders = response.data;
        this.applyFilter(this.currentFilter);
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
          this.fetchOrders();
          alert('Order deleted successfully.');
        },
        (error) => {
          console.error('Error deleting order:', error);
          alert('Failed to delete the order. Please try again.');
        }
      );
    }
  }
}
