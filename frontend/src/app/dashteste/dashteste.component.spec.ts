import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashtesteComponent } from '../dashteste/dashteste.component';

describe('DashtesteComponent', () => {
  let component: DashtesteComponent;
  let fixture: ComponentFixture<DashtesteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashtesteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashtesteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
