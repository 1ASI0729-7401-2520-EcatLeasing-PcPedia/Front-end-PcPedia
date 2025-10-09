import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarContent } from './toolbar-content';

describe('ToolbarContent', () => {
  let component: ToolbarContent;
  let fixture: ComponentFixture<ToolbarContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolbarContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
