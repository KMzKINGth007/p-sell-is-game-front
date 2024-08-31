import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CallserviceService } from '../services/callservice.service';

@Component({
  selector: 'app-sandmail',
  templateUrl: './sandmail.component.html',
  styleUrls: ['./sandmail.component.css']
})
export class SandmailComponent implements OnInit {

  order: any = {};
  orderId: number | null = null;
  productImgList: any[] = [];
  ImageList: any[] = [];

  constructor(
    private callService: CallserviceService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.orderId = Number(params.get('orderId'));
      if (this.orderId) {
        this.fetchOrderDetails(this.orderId);
      }
    });
  }

  fetchOrderDetails(orderId: number): void {
    this.callService.getOrderDetails(orderId).subscribe(
      response => {
        this.order = response.data;
        this.fetchProductDetailsForOrderItems();
        this.fetchOrderImages(orderId); // Add this line
      },
      error => {
        console.error('Error fetching order details:', error);
      }
    );
  }


  fetchProductDetailsForOrderItems(): void {
    this.order.items.forEach((item: any) => {
      this.callService.getProductByProductId(item.productId).subscribe(
        productResponse => {
          if (productResponse.data) {
            item.productDetails = productResponse.data;
            this.fetchProductImages(item);
          } else {
            // Handle error: product not found
          }
        },
        error => {
          console.error('Error fetching product details:', error);
        }
      );
    });
  }

  fetchProductImages(item: any): void {
    this.callService.getProductImgByProductId(item.productId).subscribe(
      imageResponse => {
        if (imageResponse.data) {
          item.images = [];
          this.productImgList = imageResponse.data;
          this.productImgList.forEach((img: any) => {
            this.getImage(img.productImageName, item);
          });
        } else {

        }
      },
      error => {
        console.error('Error fetching product images:', error);
      }
    );
  }

  getImage(fileName: string, item: any): void {
    this.callService.getImageByte(fileName).subscribe(
      imageBlob => {
        let objectURL = URL.createObjectURL(imageBlob);
        let imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        item.images.push({ key: fileName, value: imageUrl });
      },
      error => {
        console.error('Error fetching image:', error);
      }
    );
  }

  updateOrder(): void {
    if (this.orderId && this.order.descOrder) {
      const updatedOrder = {
        ...this.order,
        descOrder: this.order.descOrder,
        status: 'paid' // Set status to 'paid'
      };

      this.callService.updateOrder(this.orderId, updatedOrder).subscribe(
        response => {
          if (response.status === 'SUCCESS') {
            alert('Order updated successfully!');
          } else {
            alert('Failed to update order: ' + response.message);
          }
        },
        error => {
          console.error('Error updating order:', error);
        }
      );
    }
  }

  fetchOrderImages(orderId: number): void {
    this.callService.getOrderImgByOrderId(orderId).subscribe(
      imageResponse => {
        if (imageResponse.data) {
          this.ImageList = imageResponse.data;
          this.ImageList.forEach((img: any) => {
            this.getOrderImage(img.orderImageName);
            console.log(img.orderImageName);
          });
        } else {
          console.error('No images found for the order.');
        }
      },
      error => {
        console.error('Error fetching order images:', error);
      }
    );
  }

  getOrderImage(fileName: string): void {
    this.callService.getOrderImageByte(fileName).subscribe(
      imageBlob => {
        let objectURL = URL.createObjectURL(imageBlob);
        let imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        this.ImageList.push({ key: fileName, value: imageUrl });
      },
      error => {
        console.error('Error fetching order image:', error);
      }
    );
  }


}
