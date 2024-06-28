import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-productDetail',
  templateUrl: './productDetail.component.html',
  styleUrls: ['./productDetail.component.css']
})
export class ProductDetailComponent implements OnInit {

  constructor(
    private callService: CallserviceService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  productId: any;
  product: any;
  productImgList: any;
  ImageList: any = [];
  imageBlobUrl: any;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('productId');
      if (this.productId) {
        this.getProductDetails();
      } else {
        // Handle error: productId is null
        this.router.navigate(['/']);
      }
    });
  }

  getProductDetails() {
    this.callService.getProductByProductId(this.productId).subscribe((res) => {
      if (res.data) {
        this.product = res.data;
        this.getProductImages();
      } else {
        // Handle error: product not found
        this.router.navigate(['/']);
      }
    });
  }

  getProductImages() {
    this.callService.getProductImgByProductId(this.product.productId).subscribe((res) => {
      if (res.data) {
        this.productImgList = res.data;
        for (let productImg of this.productImgList) {
          this.getImage(productImg.productImageName);
        }
      } else {
        // Handle error: no images found
        this.router.navigate(['/']);
      }
    });
  }

  getImage(fileNames: any) {
    this.callService.getImageByte(fileNames).subscribe((res) => {
      let objectURL = URL.createObjectURL(res);
      this.imageBlobUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      this.ImageList.push({
        key: fileNames,
        value: this.imageBlobUrl
      });
    });
  }
}
