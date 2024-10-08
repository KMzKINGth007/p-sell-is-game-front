/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SandmailComponent } from './sandmail.component';

describe('SandmailComponent', () => {
  let component: SandmailComponent;
  let fixture: ComponentFixture<SandmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SandmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SandmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
